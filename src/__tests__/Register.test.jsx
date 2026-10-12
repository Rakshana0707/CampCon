import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Register from '../pages/Register';
import { AppContext } from '../context/AppContext';

describe('Register Component', () => {
    const mockRegister = vi.fn();

    const renderRegister = () => {
        return render(
            <BrowserRouter>
                <AppContext.Provider value={{ register: mockRegister, currentUser: null }}>
                    <Register />
                </AppContext.Provider>
            </BrowserRouter>
        );
    };

    it('renders registration form', () => {
        renderRegister();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        mockRegister.mockResolvedValue({ success: true, user: { role: 'STUDENT' } });
        renderRegister();
        
        fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@college.edu' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));
        
        expect(mockRegister).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@college.edu',
            password: 'password123',
            role: 'STUDENT',
            department: '',
            rollNumber: '',
            year: ''
        });
    });
});
