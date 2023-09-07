import { Box, Button, Flex, Image, Spacer } from "@chakra-ui/react";
import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box minH="100vh">
      <Flex
        w="4xl"
        m="auto"
        bg="#002d72"
        h="80px"
        px={4}
        borderRadius={"lg"}
        mt={8}>
        <Box as={Link} to="/">
          <Image src="citiredesign.svg" h="full" />
        </Box>

        <Spacer />
        <Flex alignItems="center">
          <Button
            as={Link}
            to="/create-topic"
            color="white"
            bg="#002d72"
            _hover={{ bg: "#eff3f8", color: "#002d72" }}>
            Add topic
          </Button>
        </Flex>
      </Flex>
      <Box as="main" minH="calc(100vh - 80px)">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
