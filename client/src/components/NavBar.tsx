import React from "react";
import { Box, Link, Flex, Button, Icon, Heading } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: loggingOut }, logout] = useLogoutMutation();
  let body = null;
  if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Button mr={1} variant="ghost">
            login
          </Button>
        </NextLink>
        <NextLink href="/register">
          <Button variant="ghost">register</Button>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center" justify="center">
        <Box mr={4}>Hello, {data.me.username}</Box>
        <Box mr={4}>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              router.reload();
            }}
            isLoading={loggingOut}
          >
            log out
          </Button>
        </Box>
      </Flex>
    );
  }
  return (
    <Flex position="sticky" top="0" zIndex={100} bg="crimson" p={4}>
      <NextLink href="/">
        <Link>
          <Heading>LiReddit</Heading>
        </Link>
      </NextLink>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
