import React, { InputHTMLAttributes } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/core";
import { useField } from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);
  const Component = textarea ? Textarea : Input;
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Component
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default InputField;
