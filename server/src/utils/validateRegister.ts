import { UsernamePasswordInput } from "../gqlTypes/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  const errors = [];
  if (!options.email.includes("@")) {
    errors.push({
      field: "email",
      message: "Email must be a valid email.",
    });
  }
  if (options.username.includes("@")) {
    errors.push({
      field: "username",
      message: "Username must not contain @.",
    });
  }
  if (options.username.length < 6) {
    errors.push({
      field: "username",
      message: "Username must be at least 6 characters.",
    });
  }
  if (options.password.length < 8) {
    errors.push({
      field: "password",
      message: "password must be at least 8 characters.",
    });
  }
  return errors;
};
