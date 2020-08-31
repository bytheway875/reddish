import React from "react";
import { Box } from "@chakra-ui/core";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
  variant?: WrapperVariant;
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant == "regular" ? "800px" : "400px"}
      w={variant == "regular" ? "75%" : "90%"}
    >
      {children}
    </Box>
  );
};

export default Wrapper;
