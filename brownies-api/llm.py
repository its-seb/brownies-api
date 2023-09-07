import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, StoppingCriteria, StoppingCriteriaList, pipeline
from langchain import HuggingFacePipeline
from langchain.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

# define custom stopping criteria object
class StopOnTokens(StoppingCriteria):
    def __init__(self, stop_token_ids):
        self.stop_token_ids = stop_token_ids

    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        for stop_ids in self.stop_token_ids:
            if torch.eq(input_ids[0][-len(stop_ids):], stop_ids).all():
                return True
        return False

def load_llm():
    hf_auth = os.environ.get("hf_auth")
    model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-chat-hf",
                                                device_map='auto',
                                                torch_dtype=torch.float16,
                                                use_auth_token=hf_auth,
                                                load_in_4bit=True
                                                )

    tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf",
                                            use_auth_token=hf_auth,)
    device = f'cuda:{torch.cuda.current_device()}' if torch.cuda.is_available() else 'cpu'
    stop_list = ['\nHuman:', '\n```\n']
    stop_token_ids = [tokenizer(x)['input_ids'] for x in stop_list]
    stop_token_ids = [torch.LongTensor(x).to(device) for x in stop_token_ids]
    stopping_criteria = StoppingCriteriaList([StopOnTokens(stop_token_ids)])
    generate_text = pipeline(
        model=model,
        tokenizer=tokenizer,
        return_full_text=True,  # langchain expects the full text
        task='text-generation',
        # we pass model parameters here too
        stopping_criteria=stopping_criteria,  # without this model rambles during chat
        temperature=0.1,  # 'randomness' of outputs, 0.0 is the min and 1.0 the max
        max_new_tokens=512,  # max number of tokens to generate in the output
        repetition_penalty=1.1,  # without this output begins repeating
        top_k=30
    )

    return HuggingFacePipeline(pipeline=generate_text)


def load_embeddings():
    model_name = "sentence-transformers/all-mpnet-base-v2"
    model_kwargs = {"device": "cuda"}
    return HuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)
    