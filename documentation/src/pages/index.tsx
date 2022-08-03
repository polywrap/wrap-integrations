import React from 'react';
import Layout from "@theme/Layout";
import Showcase from "../components/Showcase";
import Minihacks from "../components/Minihacks";
import SocialCallout from "../components/SocialCallout";
import { darkTheme } from "../mui-theme";
import { ThemeProvider } from "@mui/material";

export default function Home() {
  return (
    <Layout>
    <ThemeProvider theme={darkTheme}>
        <Showcase/>
        <Minihacks/>
        <SocialCallout/>
    </ThemeProvider>
    </Layout>
  );
}
