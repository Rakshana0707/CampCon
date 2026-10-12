import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';

describe('Notifications in Navbar', () => {
    const mockMarkRead = vi.fn();
    
    const mockNotifications = [
        { id: 1, message: 'You have a new message', isRead: false, createdAt: new Date().toISOString() },
        { id: 2, message: 'Your event is approved', isRead: true, createdAt: new Date().toISOString() }
    ];

    const renderNavbar = () => render(
        <BrowserRouter>
            <AppContext.Provider value={{ 
                currentUser: { id: 10, name: 'User', role: 'STUDENT' },
                notifications: mockNotifications,
                markNotificationRead: mockMarkRead,
                logout: vi.fn()
            }}>
                <Navbar />
            </AppContext.Provider>
        </BrowserRouter>
    );

    it('displays unread notification badge', () => {
        renderNavbar();
        const badge = screen.getByText('1');
        expect(badge).toBeInTheDocument();
    });

    it('marks notification as read when clicked', () => {
        renderNavbar();
        // Open dropdown
        const bellIcon = screen.getByText('1').closest('button') || screen.getByTestId('notification-toggle');
        fireEvent.click(bellIcon);
        
        // Find the unread notification and click mark as read
        const unreadMsg = screen.getByText('You have a new message');
        expect(unreadMsg).toBeInTheDocument();
        
        // The Mark as Read button
        const markReadBtn = screen.getByRole('button', { name: /mark as read/i });
        fireEvent.click(markReadBtn);
        
        expect(mockMarkRead).toHaveBeenCalledWith(1);
    });
});
