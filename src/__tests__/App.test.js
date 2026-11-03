import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the providers to avoid Firebase dependency in tests
jest.mock('../providers/AppProviders', () => ({
  AppProviders: ({ children }) => <div data-testid="app-providers">{children}</div>,
}));

jest.mock('../context/FirebaseBusinessContext', () => ({
  useFirebaseBusiness: () => ({isAuthenticated: false, isOnboardingComplete: false, loading: false}),
}));
jest.mock('../pages/FirebaseLogin', () => () => <div>Sign in</div>);

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app-providers')).toBeInTheDocument();
  });
});
