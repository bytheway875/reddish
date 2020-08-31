import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import { Provider, createClient } from "urql";
import theme from "../theme";
import NavBar from "../components/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";

function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
