import React, { useEffect } from "react";
import Layout from "../../../components/Layout";
import { Formik, Form } from "formik";
import InputField from "../../../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useUpdatePostMutation, useMeQuery } from "../../../generated/graphql";
import { useRouter } from "next/router";
import { ValuesOfCorrectTypeRule } from "graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const EditPost: React.FC<{}> = ({}) => {
  const router = useRouter();

  const [, updatePost] = useUpdatePostMutation();
  const [{ data: meData }] = useMeQuery();
  const [{ data, fetching }] = useGetPostFromUrl();

  if (!data?.post) {
    return null;
  }

  if (meData?.me?.id && meData?.me?.id != data.post.creator.id) {
    router.push(`/posts/${data.post.id}`);
  }
  const { id: postId } = data.post;
  return (
    <Layout>
      <Formik
        initialValues={{
          title: data.post?.title,
          text: data.post?.text,
        }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await updatePost({ ...values, id: postId });
          if (!error) {
            router.push(`/posts/${postId}`);
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <InputField name="title" label="Title" value={values.title} />
            <Box mt={4}>
              <InputField
                textarea
                label="Text"
                name="text"
                value={values.text}
              />
            </Box>

            <Button
              mt={8}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(EditPost);
