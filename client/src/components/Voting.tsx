import React from "react";
import { Flex, IconButton, Text } from "@chakra-ui/core";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface VotingProps {
  post: PostSnippetFragment;
}

const Voting: React.FC<VotingProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  console.log("post", post);
  return (
    <Flex alignItems="center" direction="column" justifyContent="center">
      <IconButton
        icon="chevron-up"
        // backgroundColor="transparent"
        variantColor={post.voteStatus == 1 ? "green" : undefined}
        aria-label="update post"
        fontSize="24px"
        borderRadius="50%"
        onClick={() => {
          if (post.voteStatus == 1) {
            return;
          }
          vote({ postId: post.id, value: 1 });
        }}
      />{" "}
      <Text>{post.points}</Text>
      <IconButton
        icon="chevron-down"
        aria-label="downvote post"
        // backgroundColor="transparent"
        variantColor={post.voteStatus == -1 ? "red" : undefined}
        fontSize="24px"
        borderRadius="50%"
        onClick={() => {
          if (post.voteStatus == -1) {
            return;
          }
          vote({ postId: post.id, value: -1 });
        }}
      />
    </Flex>
  );
};
export default Voting;
