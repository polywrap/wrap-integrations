import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import CardLink from "./CardLink";

const useStyles = makeStyles(() => ({
  root: {
    "&:hover": {
      textDecoration: "none",
    },
  },
}));

const content =   {
    title: "Go to Docs",
    description: "Read documentation for every integration.",
    cta: "Get Started!",
    link: "/docs/intro",
  };

export default function Showcase() {
  const theme = useTheme();
  useStyles(theme);

  return (
    <Box mt={6} mb={6} position="relative" zIndex={0}>
      <Container maxWidth="lg">
        <CardLink link={content.link} shine>
          <Grid container direction={"column"} alignItems={"center"}>
          <Typography variant="h5" component="h3" fontWeight="800">
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
