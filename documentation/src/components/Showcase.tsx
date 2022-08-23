import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import CardLink from "./CardLink";

const content =   {
    title: "Go to Docs",
    description: "Read documentation for every integration.",
    cta: "Get Started!",
    link: "/docs/readme-doc",
  };

export default function Showcase() {

  return (
    <Box mt={6} mb={6} position="relative" zIndex={0}>
      <Container maxWidth="lg">
        <CardLink link={content.link} shine>
          <Grid container direction={"column"} alignItems={"center"}>
            <Typography variant="h4" component="h3" fontWeight="800">
            {content.title}
            </Typography>
          <Box mt={1} color={"var(--ifm-heading-color)"}>
            <Typography variant="body1">{content.description}</Typography>
          </Box>
          <Box mt={1}>
            <Typography
              variant="body1"
              fontWeight="800"
              className="card-link"
            >
              {content.cta} &#8250;
            </Typography>
          </Box>
          </Grid>
        </CardLink>
      </Container>
    </Box>
  );
}
