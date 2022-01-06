import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '1400px',
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      margin: 'auto',
    },
  },
}));

export const Home = () => {
  ReactGA.pageview('home');

  const classes = useStyles();

  return (
    <Box className={classes.root}>

    </Box>
  );
};
