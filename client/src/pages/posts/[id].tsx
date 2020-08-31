import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import {
  usePostQuery,
  useDeletePostMutation,
  useMeQuery,
} from "../../generated/graphql";
import { Heading, Text, IconButton } from "@chakra-ui/core";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post: React.FC = ({}) => {
  const router = useRouter();

  const [{ data, fetching }] = useGetPostFromUrl();

  const [{ data: meData }] = useMeQuery();

  const [, deletePost] = useDeletePostMutation();

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return <Layout>No post found.</Layout>;
  }
  console.log(meData.me);
  return (
    <Layout>
      <Heading>{data.post.title}</Heading>
      <Text mb={8}>{data.post.text}</Text>
      {meData?.me?.id == data.post.creator.id && (
        <>
          <IconButton
            icon="delete"
            aria-label="delete post"
            onClick={() => deletePost({ id: data.post?.id || -1 })}
          />{" "}
          <IconButton
            icon="edit"
            aria-label="edit post"
            onClick={() => router.push(`/posts/edit/${data.post?.id}`)}
          />
        </>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
