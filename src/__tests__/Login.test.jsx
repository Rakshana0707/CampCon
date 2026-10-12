import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../pages/Login';
import { AppContext } from '../context/AppContext';

// Mock contexts
const mockLogin = vi.fn();

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <AppContext.Provider value={{ login: mockLogin, currentUser: null }}>
                <Login />
            </AppContext.Provider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    it('renders login form correctly', () => {
        renderLogin();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles input changes', () => {
        renderLogin();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@college.edu' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        expect(emailInput.value).toBe('test@college.edu');
        expect(passwordInput.value).toBe('password123');
    });

    it('submits the form with provided credentials', async () => {
        mockLogin.mockResolvedValue({ success: true, user: { role: 'Student' } });
        
        renderLogin();
        
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@college.edu' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);
        
        expect(mockLogin).toHaveBeenCalledWith('test@college.edu', 'password123');
    });
});
