import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiBriefcase } from 'react-icons/fi';
import { Formik, Form as FormikForm } from 'formik';
import ReCAPTCHA from 'react-google-recaptcha';
import { registerUser, signInUser, resetPassword } from '../firebase/auth';
import { testFirestoreConnection } from '../firebase/test-connection';
import { loginSchema, registrationSchema, forgotPasswordSchema } from '../utils/validationSchemas';
import { logAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0.5rem 0 0 0;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-radius: 8px;
  background: #f1f5f9;
  padding: 4px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1e293b' : '#64748b'};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1.25rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
`;

const CaptchaContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-align: right;
  margin-top: -0.5rem;

  &:hover {
    text-decoration: underline;
    color: #2563eb;
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 0.75rem;
  width: 100%;
  text-align: center;

  &:hover {
    color: #3b82f6;
    text-decoration: underline;
  }
`;

const Button = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const TestButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 0.5rem;
  width: 100%;
  
  &:hover {
    background: #059669;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

function FirebaseLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);

  // Get reCAPTCHA site key from environment or use a default
  const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Google test key

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    clearMessages();

    // Verify CAPTCHA for registration
    if (!isLogin && !isForgotPassword && !captchaValue) {
      setError('Please complete the CAPTCHA verification');
      setLoading(false);
      setSubmitting(false);
      return;
    }

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(values.email);
        if (error) {
          setError(error);
        } else {
          setSuccess('Password reset email sent. Check your inbox and spam folder.');
        }
      } else if (isLogin) {
        const { error } = await signInUser(values.email, values.password);
        if (error) {
          setError(error);
        } else {
          setSuccess('Login successful!');
          logAnalyticsEvent(AnalyticsEvents.LOGIN, { method: 'email' });
        }
      } else {
        const { error } = await registerUser(
          values.email,
          values.password,
          `${values.firstName} ${values.lastName}`,
          values.businessName
        );

        if (error) {
          setError(error);
        } else {
          setSuccess('Registration successful! Please complete your business setup.');
          logAnalyticsEvent(AnalyticsEvents.SIGNUP, { method: 'email' });
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const getValidationSchema = () => {
    if (isForgotPassword) return forgotPasswordSchema;
    return isLogin ? loginSchema : registrationSchema;
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoText>KaziLedger</LogoText>
          <Subtitle>
            {isForgotPassword
              ? 'Reset your password'
              : 'Business Operations Management'}
          </Subtitle>
        </Logo>

        {!isForgotPassword && (
          <TabContainer>
            <Tab 
              active={isLogin} 
              onClick={() => {
                setIsLogin(true);
                setIsForgotPassword(false);
                clearMessages();
                setCaptchaValue(null);
              }}
              aria-label="Switch to login"
            >
              Login
            </Tab>
            <Tab 
              active={!isLogin} 
              onClick={() => {
                setIsLogin(false);
                setIsForgotPassword(false);
                clearMessages();
                setCaptchaValue(null);
              }}
              aria-label="Switch to registration"
            >
              Register
            </Tab>
          </TabContainer>
        )}

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        {success && <SuccessMessage role="status">{success}</SuccessMessage>}

        <Formik
          initialValues={{
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            businessName: ''
          }}
          validationSchema={getValidationSchema()}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <FormikForm>
              <FormFields>
                {isForgotPassword ? (
                  <>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                      Enter your email and we&apos;ll send you a link to reset your password.
                    </p>
                    <InputGroup>
                      <InputIcon aria-hidden="true">
                        <FiMail />
                      </InputIcon>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="username"
                        aria-label="Email address"
                        aria-invalid={errors.email && touched.email}
                        aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                      />
                      {errors.email && touched.email && (
                        <ErrorText id="email-error" role="alert">{errors.email}</ErrorText>
                      )}
                    </InputGroup>

                    <Button type="submit" disabled={loading} aria-label="Send password reset email">
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <BackLink
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsLogin(true);
                        clearMessages();
                      }}
                      aria-label="Back to login"
                    >
                      Back to Login
                    </BackLink>
                  </>
                ) : (
                  <>
                    {!isLogin && (
                      <>
                        <InputGroup>
                          <InputIcon aria-hidden="true">
                            <FiUser />
                          </InputIcon>
                          <Input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-label="First name"
                            aria-invalid={errors.firstName && touched.firstName}
                            aria-describedby={errors.firstName && touched.firstName ? 'firstName-error' : undefined}
                          />
                          {errors.firstName && touched.firstName && (
                            <ErrorText id="firstName-error" role="alert">{errors.firstName}</ErrorText>
                          )}
                        </InputGroup>

                        <InputGroup>
                          <InputIcon aria-hidden="true">
                            <FiUser />
                          </InputIcon>
                          <Input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-label="Last name"
                            aria-invalid={errors.lastName && touched.lastName}
                            aria-describedby={errors.lastName && touched.lastName ? 'lastName-error' : undefined}
                          />
                          {errors.lastName && touched.lastName && (
                            <ErrorText id="lastName-error" role="alert">{errors.lastName}</ErrorText>
                          )}
                        </InputGroup>

                        <InputGroup>
                          <InputIcon aria-hidden="true">
                            <FiBriefcase />
                          </InputIcon>
                          <Input
                            type="text"
                            name="businessName"
                            placeholder="Business Name"
                            value={values.businessName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-label="Business name"
                            aria-invalid={errors.businessName && touched.businessName}
                            aria-describedby={errors.businessName && touched.businessName ? 'businessName-error' : undefined}
                          />
                          {errors.businessName && touched.businessName && (
                            <ErrorText id="businessName-error" role="alert">{errors.businessName}</ErrorText>
                          )}
                        </InputGroup>
                      </>
                    )}

                    <InputGroup>
                      <InputIcon aria-hidden="true">
                        <FiMail />
                      </InputIcon>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="username"
                        aria-label="Email address"
                        aria-invalid={errors.email && touched.email}
                        aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                      />
                      {errors.email && touched.email && (
                        <ErrorText id="email-error" role="alert">{errors.email}</ErrorText>
                      )}
                    </InputGroup>

                    <InputGroup>
                      <InputIcon aria-hidden="true">
                        <FiLock />
                      </InputIcon>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        aria-label="Password"
                        aria-invalid={errors.password && touched.password}
                        aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                      </PasswordToggle>
                      {errors.password && touched.password && (
                        <ErrorText id="password-error" role="alert">{errors.password}</ErrorText>
                      )}
                    </InputGroup>

                    {isLogin && (
                      <LinkButton
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          clearMessages();
                        }}
                        aria-label="Forgot password"
                      >
                        Forgot password?
                      </LinkButton>
                    )}

                    {!isLogin && (
                      <InputGroup>
                        <InputIcon aria-hidden="true">
                          <FiLock />
                        </InputIcon>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="Confirm Password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="new-password"
                          aria-label="Confirm password"
                          aria-invalid={errors.confirmPassword && touched.confirmPassword}
                          aria-describedby={errors.confirmPassword && touched.confirmPassword ? 'confirmPassword-error' : undefined}
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                          <ErrorText id="confirmPassword-error" role="alert">{errors.confirmPassword}</ErrorText>
                        )}
                      </InputGroup>
                    )}

                    {!isLogin && (
                      <CaptchaContainer>
                        <ReCAPTCHA
                          sitekey={RECAPTCHA_SITE_KEY}
                          onChange={(value) => setCaptchaValue(value)}
                          onExpired={() => setCaptchaValue(null)}
                          aria-label="reCAPTCHA verification"
                        />
                      </CaptchaContainer>
                    )}

                    <Button type="submit" disabled={loading} aria-label={isLogin ? 'Login' : 'Register'}>
                      {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                    </Button>

                    <TestButton 
                      type="button" 
                      onClick={async () => {
                        console.log('Testing Firestore connection...');
                        const success = await testFirestoreConnection();
                        if (success) {
                          alert('✅ Firestore connection successful!');
                        } else {
                          alert('❌ Firestore connection failed. Check console for details.');
                        }
                      }}
                      aria-label="Test Firestore connection"
                    >
                      Test Firestore Connection
                    </TestButton>
                  </>
                )}
              </FormFields>
            </FormikForm>
          )}
        </Formik>
      </LoginCard>
    </LoginContainer>
  );
}

export default FirebaseLogin;
