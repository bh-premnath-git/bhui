
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { InferType } from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { Box, Button, Checkbox, FormControl, FormControlLabel, TextField, Typography } from '@mui/material';
// import { makeStyles } from '@mui/styles'; 

const schema = yup.object().shape({
    email: yup.string().email('You must enter a valid email').required('You must enter a email'),
    password: yup
        .string()
        .required('Please enter your password.')
        .min(4, 'Password is too short - must be at least 4 chars.'),
    remember: yup.boolean()
});

const defaultValues = {
    email: '',
    password: '',
    remember: true
};

function SignInPage() {
    const navigate = useNavigate();
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema)
    });

    const { isValid, dirtyFields, errors } = formState;
    // const classes = useStyles();

    useEffect(() => {
        setValue('email', '', { shouldDirty: true, shouldValidate: true });
        setValue('password', '', { shouldDirty: true, shouldValidate: true });
    }, [setValue]);

    async function onSubmit({ email, password }: InferType<typeof schema>) {

        console.log(email)
        console.log(password)
        navigate("/Home", { replace: true, });
    }

    return (
        // left0
        <>

            <Box sx={{
                display: 'flex',
                backgroundColor: '#F5F5F5',
            }}>
                <Box sx={{
                    flex: '0 0 70%',
                    backgroundColor: '#F5F5F5',
                    textAlign: 'center',
                    margin: 'auto',
                    // paddingLeft: theme.spacing(2),
                }}>
                    {/* Content for left section */}
                    <div style={{ width: '65%', margin: 'auto', padding: '3%', borderRadius: '8px', backgroundColor: 'white' }}>
                        <Typography className='my-2' sx={{ fontWeight: 'bold' }} variant='h3'>
                            BigHammer.ai
                        </Typography>
                        <Typography className='my-2' sx={{ fontWeight: 'bold' }} variant='h4'>
                            Welcome
                        </Typography>

                        <Typography className="mt-32 py-2 text-xl font-normal leading-tight tracking-tight">One Stop for all your data, anytime, anywhere.</Typography>

                        <div>
                            <form
                                name="loginForm"
                                noValidate
                                className="mt-32 flex w-full flex-col justify-center"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="d-flex mx-4">
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                className="mb-12"
                                                label="Email"
                                                autoFocus
                                                type="email"
                                                error={!!errors.email}
                                                helperText={errors?.email?.message}
                                                variant="outlined"
                                                required
                                                fullWidth
                                            />
                                        )}
                                    />
                                    &nbsp;&nbsp;&nbsp;
                                    <Controller
                                        name="password"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                className="mb-24"
                                                label="Password"
                                                type="password"
                                                error={!!errors.password}
                                                helperText={errors?.password?.message}
                                                variant="outlined"
                                                required
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <br></br>
                                <div className="d-flex justify-content-between">
                                    <Controller
                                        name="remember"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl>
                                                <FormControlLabel
                                                    label="Remember me"
                                                    control={
                                                        <Checkbox
                                                            size="small"
                                                            {...field}
                                                        />
                                                    }
                                                />
                                            </FormControl>
                                        )}
                                    />

                                    <Link
                                        className="text-md font-medium"
                                        to="/pages/auth/forgot-password"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <br></br>
                                <div className="flex  pb-20 justify-center">
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: '#000' }}
                                        className="mt-2 w-25"
                                        aria-label="Sign in"
                                        disabled={_.isEmpty(dirtyFields) || !isValid}
                                        type="submit"
                                        size="large"
                                    >
                                        Sign In
                                    </Button>
                                </div>
                                <div className="flex justify-center my-2">
                                    Or
                                </div>
                                <div className="flex  pb-20 justify-center">
                                    <Button sx={{ backgroundColor: '#000' }}
                                        variant="contained"
                                        className="mt-2 sign-in-button"
                                        aria-label="Sign in"
                                        // type="submit"
                                        size="large"
                                    >
                                        Sign In With SSO
                                    </Button>
                                </div>

                            </form>
                        </div>
                    </div>
                </Box>
                <Box sx={{
                    flex: '0 0 30%',
                    backgroundColor: '#E8E8E8',
                }}>
                    <img style={{ objectFit: "cover", marginLeft: "-25%", marginTop: '20%' }} src="/assets/login/signin.png" />
                </Box>
            </Box>

        </>
    );
}

export default SignInPage;