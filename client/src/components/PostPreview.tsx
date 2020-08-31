import React from "react";
import { Flex, IconButton, Box, Heading, Text, Link } from "@chakra-ui/core";
import Voting from "./Voting";
import { PostSnippetFragment } from "../generated/graphql";
import NextLink from "next/link";
interface PostPreviewProps {
  post: PostSnippetFragment;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  return (
    <Flex key={post.id} p={5} pl={0} shadow="md" borderWidth="1">
      <Flex mx={6}>
        <Voting post={post} />
      </Flex>
      <Box flexGrow={1}>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <NextLink href={"/posts/[id]"} as={`/posts/${post.id}`}>
            <Link>
              <Heading fontSize="m">{post.title}</Heading>
            </Link>
          </NextLink>
          <Text color="grey" fontSize="xs">
            posted by {post.creator.username}
          </Text>
        </Flex>
        <Text mt={4}>{post.textSnippet}...</Text>
      </Box>
    </Flex>
  );
};
export default PostPreview;
