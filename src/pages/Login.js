import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMail, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
// import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';

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
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 2rem;
`;

const LogoTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const LogoSubtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    color: #6b7280;
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  
  span {
    padding: 0 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const OTPButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

// const LoginMethods = styled.div`
//   display: flex;
//   gap: 1rem;
// `;

// const MethodButton = styled.button`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;
//   padding: 0.75rem 1rem;
//   background: white;
//   color: #374151;
//   border: 1px solid #d1d5db;
//   border-radius: 8px;
//   font-weight: 500;
//   cursor: pointer;
//   transition: all 0.2s ease;
//   
//   &:hover {
//     border-color: #3b82f6;
//     color: #3b82f6;
//   }
// `;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const FooterText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const FooterLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default function Login() {
  // Note: This component is not currently used - FirebaseLogin is used instead
  // const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      // Login handled by Firebase Auth
      setIsLoading(false);
    }, 1000);
  };

  const handleOTPRequest = async () => {
    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      // Login handled by Firebase Auth
      setIsLoading(false);
    }, 1000);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoIcon>
            <FiMail />
          </LogoIcon>
          <LogoTitle>BusinessApp</LogoTitle>
          <LogoSubtitle>Manage your business operations</LogoSubtitle>
        </Logo>

        {!otpSent ? (
          <Form onSubmit={handleLogin}>
            <FormGroup>
              <Label>Email Address</Label>
              <InputGroup>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label>Password</Label>
              <InputGroup>
                <InputIcon>
                  <FiEye />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </InputGroup>
            </FormGroup>

            <LoginButton type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
              <FiArrowRight />
            </LoginButton>

            <Divider>
              <span>or</span>
            </Divider>

            <OTPButton onClick={handleOTPRequest} disabled={isLoading}>
              <FiPhone />
              {isLoading ? 'Sending...' : 'Send OTP to Phone'}
            </OTPButton>
          </Form>
        ) : (
          <Form onSubmit={handleOTPLogin}>
            <FormGroup>
              <Label>Phone Number</Label>
              <InputGroup>
                <InputIcon>
                  <FiPhone />
                </InputIcon>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 82 123 4567"
                  required
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label>OTP Code</Label>
              <InputGroup>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </InputGroup>
            </FormGroup>

            <LoginButton type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              <FiArrowRight />
            </LoginButton>

            <OTPButton onClick={() => setOtpSent(false)}>
              Back to Email Login
            </OTPButton>
          </Form>
        )}

        <Footer>
          <FooterText>
            Don't have an account?{' '}
            <FooterLink href="#">Sign up here</FooterLink>
          </FooterText>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
}
