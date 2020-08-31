import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Wrapper from "../components/Wrapper";
import { Formik, Form } from "formik";
import { toErrorMap } from "../utils/toErrorMap";
import InputField from "../components/InputField";
import { Flex, Box, Link, Button } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";
import Layout from "../components/Layout";

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          email: "",
        }}
        onSubmit={async (values, { setErrors }) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              if an account with that email exists, you'll get an email from us!
            </Box>
          ) : (
            <Form>
              <InputField name="email" label="Email" type="email" />
              <Button
                mt={8}
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
              >
                Send Forgot Password Email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
