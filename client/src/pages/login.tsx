import React from "react";
import { Formik, Form } from "formik";
import { Box, Button, Link, Flex } from "@chakra-ui/core";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NavBar from "../components/NavBar";
import NextLink from "next/link";
import Layout from "../components/Layout";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          usernameOrEmail: "",
          password: "",
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next == "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="usernameOrEmail" label="Username or Email" />
            <Box mt={4}>
              <InputField name="password" label="Password" type="password" />
            </Box>
            <Flex>
              <NextLink href="/forgot-password">
                <Link ml="auto">forgot password?</Link>
              </NextLink>
            </Flex>

            <Button
              mt={8}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Log In
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
