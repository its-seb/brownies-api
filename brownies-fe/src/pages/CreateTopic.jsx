import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  calc,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { route } from "../../const";

const CreateTopic = () => {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    setFiles(acceptedFiles);
  }, []);

  const [topicName, setTopicName] = useState("");
  const [urls, setUrls] = useState("");
  const [files, setFiles] = useState([]);
  const [topics, setTopics] = useState([]);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleTopicNameChange = (e) => {
    setTopicName(e.target.value);
  };

  const handleUrlsChange = (e) => {
    setUrls(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAwaitingResponse(true);
    setDisplayErrorMessage(false);
    console.log("submitted");

    if (!validateTopicName(topicName)) {
      setDisplayErrorMessage(true);
      return;
    }

    const formData = new FormData();
    formData.append("topicName", topicName);
    formData.append("urls", urls);

    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch(`${route}/process`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Upload successful");
        setTopicName("");
        setUrls("");
        setFiles([]);
      } else {
        console.log("Upload failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    console.log("ended");
    setAwaitingResponse(false);
  };

  useEffect(() => {
    fetch(`${route}/get_all_topics`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setTopics(data.topics.map((topic) => topic.toLowerCase()));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const validateTopicName = (name) => {
    if (topics.includes(name.toLowerCase())) {
      console.log("hello");
      return false;
    }

    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/; // Regex to match the constraints

    if (!regex.test(name)) {
      return false;
    }

    // Additional checks for IPv4 address
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(name)) {
      return false;
    }

    return true;
  };

  return (
    <Box w="4xl" py="12" px="6" m="auto">
      <Heading>Create a new topic</Heading>
      <VStack gap={4} mt={4}>
        <FormControl>
          <FormLabel>Topic name</FormLabel>
          <Input
            type="text"
            p={8}
            borderRadius="3xl"
            bg="#eff3f8"
            value={topicName}
            onChange={handleTopicNameChange}
            color="#056dae"
            placeholder="API Documents"
          />
          {displayErrorMessage && (
            <FormHelperText>
              Topic name must follow the following rules: (1) contain 3-63
              characters, (2) starts and ends with an alphanumeric character,
              (3) otherwise contains only alphanumeric characters, underscores
              or hyphens (-), (4) contains no two consecutive periods (..) and
              (5) is not a valid IPv4 address,
            </FormHelperText>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>URLs</FormLabel>
          <Textarea
            h="250px"
            bg="#eff3f8"
            borderRadius="3xl"
            placeholder={`https://url1.com\nhttps://url2.com\nhttps://url3.com`}
            p={8}
            value={urls}
            color="#056dae"
            onChange={handleUrlsChange}></Textarea>
          <FormHelperText>
            *Please separate multiple links with a new line
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Upload files</FormLabel>
          <Flex
            {...getRootProps()}
            h="150px"
            bg="#eff3f8"
            borderRadius="3xl"
            alignItems={"center"}
            justifyContent={"center"}
            color="#056dae">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : files.length == 0 ? (
              <p>Drag 'n' drop some files here, or click to select files</p>
            ) : (
              <p>{files.length} files uploaded</p>
            )}
          </Flex>
        </FormControl>
      </VStack>
      <Flex w="full" justifyContent="flex-end" mt={8}>
        <Button
          bg="#002d72"
          color="white"
          _hover={{ bg: "#002d72" }}
          _disabled={{ bg: "#333333" }}
          onClick={handleSubmit}
          disabled={awaitingResponse}>
          Submit
        </Button>
      </Flex>
    </Box>
  );
};

export default CreateTopic;
