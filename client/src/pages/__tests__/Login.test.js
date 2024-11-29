import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { mockStore, mockState } from '../../test/mocks/reduxMock';
import authService from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');

const renderLoginWithStore = () => {
  const store = mockStore(mockState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLoginWithStore();

    expect(screen.getByLabelText(/e-mail adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginWithStore();

    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/e-mail adresse/i)).toBeInvalid();
      expect(screen.getByLabelText(/passwort/i)).toBeInvalid();
    });
  });

  it('handles successful login', async () => {
    const mockLoginResponse = {
      data: {
        token: 'test-token',
        user: {
          _id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    };

    authService.login.mockResolvedValueOnce(mockLoginResponse);

    renderLoginWithStore();

    const emailInput = screen.getByLabelText(/e-mail adresse/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    const submitButton = screen.getByRole('button', { name: /anmelden/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValueOnce(new Error(errorMessage));

    renderLoginWithStore();

    const emailInput = screen.getByLabelText(/e-mail adresse/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    const submitButton = screen.getByRole('button', { name: /anmelden/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderLoginWithStore();

    const passwordInput = screen.getByLabelText(/passwort/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const visibilityToggle = screen.getByRole('button', { name: /toggle password visibility/i });
    fireEvent.click(visibilityToggle);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('disables submit button while loading', async () => {
    authService.login.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    renderLoginWithStore();

    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
