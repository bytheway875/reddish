import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../components/InputField";
import Layout from "../../components/Layout";
import { useCreatePostMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useIsAuth } from "../../utils/useIsAuth";

const Post: React.FC<{}> = ({}) => {
  const [, createPost] = useCreatePostMutation();
  useIsAuth();
  const router = useRouter();

  return (
    <Layout>
      <Formik
        initialValues={{
          title: "",
          text: "",
        }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" />
            <Box mt={4}>
              <InputField textarea label="Text" name="text" />
            </Box>

            <Button
              mt={8}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(Post);
