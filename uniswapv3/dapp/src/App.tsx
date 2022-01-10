import React from 'react';
import { Switch, Route, HashRouter } from 'react-router-dom';
import { Box, Grid, ThemeProvider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ParallaxProvider } from 'react-scroll-parallax';
import { theme } from './theme';
import { Home } from './pages/Home';
import { MembraneBg } from './components/MembraneBg'
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './App.css';
import { Web3ReactProvider } from '@web3-react/core'
import getLibrary from "./utils/getLibrary";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
  main: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
}));

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ParallaxProvider>
          <Box width='100%' minHeight='100vh' overflow="hidden">
            <HashRouter>
              <Grid container className={classes.wrapper}>
                <Box
                  display='flex'
                  flexDirection='column'
                  flexGrow='1'
                  position='relative'
                  className={classes.main}
                >
                  <MembraneBg />
                  <Header />
                  <Switch >
                    <Route path='/' exact>
                      <Home />
                    </Route>
                  </Switch>
                  <Footer />
                </Box>
              </Grid>
            </HashRouter>
          </Box>
        </ParallaxProvider>
      </ThemeProvider>
    </Web3ReactProvider>
  );
};

export default App;
