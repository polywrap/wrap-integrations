import { Box, Container, Grid, Link, Typography } from '@material-ui/core';
import { EmailForm } from './EmailForm';
import { polywrapPalette } from '../theme';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: `${polywrapPalette.secondary[1000]}85`,
    padding: `${theme.spacing(8)}px ${theme.spacing(5)}px`,
    zIndex: 2,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      marginLeft: -theme.spacing(3),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      width: `calc(100% + ${theme.spacing(3) * 2}px)`,
    },
  },
  cell: {},
  logo: {
    width: 'auto',
    height: '48px',
    cursor: 'pointer',
    transition: 'opacity 0.25s ease-in-out',
    [theme.breakpoints.down('sm')]: {
      height: theme.spacing(4),
    },
    '&:hover': {
      opacity: 0.8,
    },
  },
  socialContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '50px',
    marginRight: 20,
    '&:last-of-type': {
      marginRight: 0,
    },
  },
  social: {
    cursor: 'pointer',
    fontSize: 24,
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.secondary.main,
    },
  },
  navLink: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
    marginTop: theme.spacing(3),
    transition: 'color 0.25s ease-in-out',
    '&:hover': {
      color: polywrapPalette.primary.start,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  footerDivider: {
    backgroundColor: theme.palette.primary.main,
    height: 4,
    marginBottom: theme.spacing(4),
    width: theme.spacing(4),
  },
  footerLink: {
    display: 'block',
    fontSize: 14,
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
}));

export const Footer = () => {
  const classes = useStyles();

  return (
    <Box component='footer' className={classes.root}>
      <Container className={classes.cell}>
        <Grid container justify='space-between' spacing={6}>
          <Grid item xs={12} md={7}>
            <img
              src={process.env.PUBLIC_URL + '/logos/polywrap-horizontal.svg'}
              alt='Polywrap Logo'
              className={classes.logo}
            />
            <Box marginTop={3}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={3}>
                  <Typography variant='h6'>Code</Typography>
                  <Box marginTop={2}>
                    <Box className={classes.footerDivider} />
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://github.com/polywrap/monorepo'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Toolchain
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://github.com/polywrap/hub'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      The Hub
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://docs.polywrap.io/'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Docs
                    </Link>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant='h6'>Social</Typography>
                  <Box marginTop={2}>
                    <Box className={classes.footerDivider} />
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://discord.com/invite/Z5m88a5qWu'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Discord
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://twitter.com/polywrap_io'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Twitter
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://blog.polywrap.io/'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Blog
                    </Link>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant='h6'>Governance</Typography>
                  <Box marginTop={2}>
                    <Box className={classes.footerDivider} />
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://handbook.polywrap.io'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Handbook
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://gnosis-safe.io/app/#/safes/0x8c3FA50473065f1D90f186cA8ba1Aa76Aee409Bb/balances'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Funds
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://snapshot.org/#/polywrap.eth'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Voting
                    </Link>
                    <Link
                      className={`${classes.navLink} ${classes.footerLink}`}
                      href='https://forum.polywrap.io'
                      target='_blank'
                      color='textPrimary'
                      variant='body1'
                    >
                      Forum
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant='h4'>Get Wrapped</Typography>
            <Box marginTop={5}>
              <EmailForm location='footer' />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
