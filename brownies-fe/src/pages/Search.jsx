import {
  Box,
  IconButton,
  Flex,
  FormControl,
  Heading,
  Input,
  Button,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { route } from "../../const";

const Search = () => {
  const { topic } = useParams();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSearch = async () => {
    const url = `${route}/query`;
    const requestBody = {
      topic: topic,
      prompt: prompt,
      chat_history: [],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const sourceDocuments = data.source_documents.map((doc) => doc.source);
      const uniqueSourceDocuments = new Set(sourceDocuments);

      let res = {
        answer: data.answer,
        chat_history: [],
        question: data.question,
        source_documents: Array.from(uniqueSourceDocuments),
      };

      setResponse(res);

      // You can handle the response data here as needed
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    console.log("hehe", response);
  }, [response]);

  return (
    <Box w="4xl" py="12" px="6" m="auto">
      <Heading>{topic}</Heading>

      <Flex gap={4}>
        <FormControl mt={4} gap={4}>
          <Input
            p={8}
            borderRadius="3xl"
            bg="#eff3f8"
            color="#056dae"
            onChange={handlePromptChange}
          />
        </FormControl>
        <Box mt={4}>
          <Button
            p={8}
            borderRadius="3xl"
            bg="#002d72"
            _hover={{ bg: "#002d72" }}
            onClick={handleSearch}>
            <AiOutlineSearch color="white" />
          </Button>
        </Box>
      </Flex>
      {response && (
        <Box
          mt={8}
          w="full"
          p={8}
          bg="#eff3f8"
          color="#056dae"
          borderRadius={"3xl"}>
          <Text>{response.answer}</Text>
          <Text fontWeight="semibold" mt={4}>
            Sources
          </Text>
          <Box>
            {response.source_documents.map((x) => (
              <Box>{x}</Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Search;
