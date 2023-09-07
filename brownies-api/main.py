import os
import torch
import chromadb
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from langchain.document_loaders import WebBaseLoader, UnstructuredFileLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from transformers import AutoTokenizer, AutoModelForCausalLM, StoppingCriteria, StoppingCriteriaList, pipeline
from llm import load_llm, load_embeddings
from langchain.chains import RetrievalQA

app = Flask(__name__)
CORS(app) # CORS(app, origins=["http://localhost:5173"])

supported_ext = {".txt", ".docx", ".pptx", ".jpg", ".png", ".eml", ".html", ".pdf"}

# load model & embeddings
llm = load_llm()
embeddings = load_embeddings()

@app.route("/process", methods=["POST"])
def process():
    collection_name = request.form.get('topicName')
    uploaded_files = request.files.values()
    current_time = datetime.now()
    timestamp = str(current_time.timestamp())
    timestamp = timestamp.replace(".","") # strip away .

    # Create the directory
    folder_path = f'temp/{timestamp}'
    os.makedirs(folder_path, exist_ok=True)

    # upload to temp directory
    docs = []
    for index, file in enumerate(uploaded_files):
        if file.filename != '':
            ext = os.path.splitext(file.filename)[-1]
            if(ext in supported_ext):
                file.save(f'{folder_path}/{file.filename}')
                loader = UnstructuredFileLoader(f'{folder_path}/{file.filename}')
                # loaded_documents = loader.load()
                # for doc in loaded_documents:
                #     doc.metadata = {"source": f'{folder_path}/{file.filename}'}
                docs.extend(loader.load())
            elif ext == ".md":
                file.save(f'{folder_path}/{file.filename}')
                loader = UnstructuredMarkdownLoader(f'{folder_path}/{file.filename}')
                docs.extend(loader.load())

    if len(docs) == 0:
        return jsonify({"error":"no valid docs found" }), 400

    url_list = request.form.get("urls").split()
    if len(url_list) > 0:
        loader = WebBaseLoader(url_list)
        # loaded_documents = loader.load()
        docs.extend(loader.load())
    
    # create embeddings and store in chroma
    document_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=20)
    document_chunks = document_splitter.split_documents(docs)
    
    vectordb = Chroma.from_documents(document_chunks, embedding=embeddings, persist_directory='./data', collection_name=collection_name)
    vectordb.persist()
    return jsonify({})

@app.route("/query", methods=["POST"])
def query():
    data = request.json

    if "prompt" not in data or "topic" not in data or "chat_history" not in data:
        abort(400, "Missing required fields: prompt, topic, or chat_history")

    prompt = data["prompt"]
    topic = data["topic"]
    chat_history = data["chat_history"]

    vectorstore = Chroma(persist_directory="./data", collection_name=topic, embedding_function=embeddings)    
    chain = ConversationalRetrievalChain.from_llm(llm=llm, chain_type="stuff", retriever=vectorstore.as_retriever(), return_source_documents=True, )
    result = chain({"question": prompt, "chat_history": chat_history})

    response = {
        "question": result["question"],
        "chat_history": result["chat_history"],
        "answer": result["answer"],
        "source_documents": []
    }

    for doc in result["source_documents"]:
        response["source_documents"].append(doc.metadata)

    return jsonify(response)

@app.route("/get_all_topics", methods=["GET"])
def get_all_topics():
    client = chromadb.PersistentClient(path="./data")
    topics = []
    for topic in client.list_collections():
        topics.append(topic.name)
    return jsonify({"topics": topics})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)