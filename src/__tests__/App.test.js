import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the providers to avoid Firebase dependency in tests
jest.mock('../providers/AppProviders', () => ({
  AppProviders: ({ children }) => <div data-testid="app-providers">{children}</div>,
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app-providers')).toBeInTheDocument();
  });
});
