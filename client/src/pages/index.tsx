import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostsQuery, useMeQuery } from "../generated/graphql";
import {
  Heading,
  Box,
  Button,
  Flex,
  Stack,
  Text,
  Icon,
  IconButton,
} from "@chakra-ui/core";
import NavBar from "../components/NavBar";
import Layout from "../components/Layout";
import NextLink from "next/link";
import { useState } from "react";
import { __postsLimit__ } from "../consts";
import PostPreview from "../components/PostPreview";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: __postsLimit__,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <Layout>
      <Flex m={8}>
        <Heading mb={4}>Recent Posts</Heading>

        <Box ml="auto">
          <NextLink href="/posts/new">
            <Button>Create Post</Button>
          </NextLink>
        </Box>
      </Flex>

      <Box m={8}>
        {!data ? null : (
          <Stack spacing={4}>
            {data!.posts.posts.map(
              (p) => p && <PostPreview post={p} key={p.id} />
            )}
          </Stack>
        )}
      </Box>
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                ...variables,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={4}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
