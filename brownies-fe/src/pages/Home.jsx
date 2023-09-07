import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Heading,
  Image,
  Spacer,
  Button,
  useStatStyles,
  LinkBox,
} from "@chakra-ui/react";
import { route } from "../../const";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Topic = ({ children, to }) => {
  return (
    <Flex
      as={Link}
      to={to}
      borderRadius="3xl"
      height="180px"
      color="#056dae"
      bg="#eff3f8"
      alignItems="center"
      justifyContent="center"
      border="1px solid"
      borderColor="#eff3f8"
      transition="transform .6s cubic-bezier(.075,.82,.165,1),border-color
          .3s cubic-bezier(.165,.84,.44,1)"
      _hover={{ borderColor: "#056dae" }}>
      {children}
    </Flex>
  );
};

const Home = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${route}/get_all_topics`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setTopics(data.topics);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);
  console.log(topics);

  return (
    <Box w="4xl" py="12" px="6" m="auto">
      <Heading>Topics</Heading>
      <SimpleGrid columns={3} gap={8} mt={6}>
        {loading
          ? "Loading"
          : topics.map((topic) => (
              <Topic to={topic} key={topic}>
                <Text fontWeight="semibold" fontSize="lg">
                  {topic}
                </Text>
              </Topic>
            ))}
      </SimpleGrid>
    </Box>
  );
};

export default Home;
