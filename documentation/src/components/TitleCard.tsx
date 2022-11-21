import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";


export default function TitleCard() {
  const theme = useTheme();

  return (
    <Box mt={12} mb={6} position="relative" zIndex={0}>
      <Box
        sx={{
          position: "absolute",
          left: "-15vw",
          maxWidth: theme.breakpoints.values.xl,
          opacity: 0.15,
          overflow: "hidden",
          top: "-30vh",
          zIndex: -1,
          "& img": {
            width: "120vw",
          },
        }}
      >
        <img src={"img/polywrapper-hero-blurred.png"} />
      </Box>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" align="center">
          Welcome to Polywrap Integrations!
        </Typography>
        <Typography mt={4} variant="h5" align="center">
          Polywrap is a Wasm development platform that makes it easy to integrate
          any protocol into any application, written in any language. This website
          hosts documentation for the packages in Polywrap's Integrations repo.
        </Typography>
      </Container>
    </Box>
  );
}
