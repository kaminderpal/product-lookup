// Test file for the login page component
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

describe('LoginPage', () => {
    it('renders the login form', () => {
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });

    it('renders the create account link', () => {
        render(<LoginPage />);
        const createAccountLink = screen.getByRole('link', { name: /create an account/i });
        expect(createAccountLink).toBeInTheDocument();
        expect(createAccountLink).toHaveAttribute('href', '/register');
    });
});