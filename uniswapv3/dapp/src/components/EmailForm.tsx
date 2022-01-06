import { useState } from 'react';
import ReactGA from 'react-ga';
import { Box, Button, Link, TextField, Typography, } from '@material-ui/core'
import { polywrapPalette } from '../theme';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowRightOutlined from '@material-ui/icons/KeyboardArrowRightOutlined';
import ArrowBackOutlinedIcon from '@material-ui/icons/ArrowBackOutlined';
import { CTA } from '../constants/verbiage';

const useStyles = makeStyles((theme) => ({
  heroSignUpFlex: {
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    }
  },
  heroTextField: {
    borderRadius: '99px 16px 16px 99px',
    display: 'flex',
    flexGrow: 1,
    maxWidth: 400,
    '& .MuiInput-input': {
      height: 38,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    }
  },
  heroButton: {
    borderRadius: '16px 99px 99px 16px',
    fontSize: 18,
    padding: '9px 28px',
    marginLeft: 20,
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      borderRadius: 99,
      marginLeft: 0,
      marginTop: theme.spacing(2),
      width: '100%',
    }
  },
  heroSignupSuccess: {
    backgroundColor: theme.palette.primary.dark,
    borderRadius: 8,
    boxShadow: `0 8px 16px ${polywrapPalette.secondary[900]}88`,
    fontWeight: 700,
    padding: 8,
    width: '100%',
  },
  backToPolywrap: {
    color: theme.palette.primary.main,
    display: 'block',
    fontSize: 24,
    fontWeight: 700,
    marginTop: theme.spacing(3),
  },
  errorText: {
    color: '#f44336'
  },
}));

interface EmailFormProps {
  location?: "signup" | "footer";
}

export const EmailForm = ({location}: EmailFormProps) => {
  const classes = useStyles();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const onSubmit = async () => {
    const re = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!re.test(email)) {
      setEmailError('Invalid email address...');
      return;
    } else {
      setEmailError('');
    }

    let uri = 'https://tech.us17.list-manage.com/subscribe/post-json?u=7515d8292da68c0a33f4c7e7e&amp;id=48ff512e96&c=jQuery34108557665382199082_1607465109249&b_7515d8292da68c0a33f4c7e7e_48ff512e96=&_=1607465109250';
    uri = uri + `&Email=${email}&EMAIL=${email}`;
    uri = encodeURI(uri);

    try {
      await fetch(uri, {
        mode: 'no-cors'
      });

      ReactGA.event({
        category: `Button-${location}`,
        action: CTA,
        label: 'Early Access'
      });

      setSignupSuccess(true);
    } catch (e) {
      setEmailError(`Sign-up failed... please use the "contract" form above.`);
    }
  }

  return (
    <form>
      <Box className={classes.heroSignUpFlex} display='flex' alignItems='center'>
        {!signupSuccess ? (
          <>
            <TextField
              className={classes.heroTextField}
              placeholder={location === 'signup' ? 'Request Early Access' : 'email address'}
              inputProps={{ style: { textAlign: 'center' } }}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              className={classes.heroButton}
              color='primary'
              endIcon={<KeyboardArrowRightOutlined />}
              type='button'
              variant='contained'
              onClick={onSubmit}
            >
              {location === 'signup' ? CTA : 'Subscribe'}
            </Button>
          </>
        ) : (
          <Box>
            <Typography className={classes.heroSignupSuccess} align='center' color='textPrimary'>
              Thank you for signing up {email}! More details coming soon.
            </Typography>
            {location === 'signup' ? (
              <Link href="/" className={classes.backToPolywrap}>
                <Box display="flex" alignItems="center" color="primary">
                  <Box marginRight={1} display="flex">
                    <ArrowBackOutlinedIcon />
                  </Box>
                  Go Back to Polywrap
                </Box>
              </Link>
            ) : null}
          </Box>
        )}
      </Box>
      {emailError && (
        <Typography className={classes.errorText}>
        {emailError}
        </Typography>
      )}
    </form>
  );
}