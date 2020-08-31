import React, { useState } from "react";
import { Box, Button, Link, Flex } from "@chakra-ui/core";
import { NextPage } from "next";
import NavBar from "../../components/NavBar";
import Wrapper from "../../components/Wrapper";
import { Formik, Form } from "formik";
import InputField from "../../components/InputField";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";
export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <>
      <NavBar />

      <Wrapper variant="small">
        <Formik
          initialValues={{
            newPassword: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              newPassword: values.newPassword,
              token,
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                label="New Password"
                type="password"
              />
              {tokenError && (
                <Flex>
                  <Box style={{ color: "red" }}>{tokenError}</Box>
                  <Box ml={2}>
                    <NextLink href="/forgot-password">
                      <Link>get another one.</Link>
                    </NextLink>
                  </Box>
                </Flex>
              )}
              <Button
                mt={8}
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
              >
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
