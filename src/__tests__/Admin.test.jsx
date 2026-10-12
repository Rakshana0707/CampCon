import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from '../pages/AdminDashboard';
import { AppContext } from '../context/AppContext';

describe('Admin Dashboard', () => {
    const mockUpdateUserRole = vi.fn();
    const mockDeleteUser = vi.fn();
    const mockUpdateEventStatus = vi.fn();
    const mockDeleteEvent = vi.fn();

    const renderAdmin = () => render(
        <BrowserRouter>
            <AppContext.Provider value={{ 
                currentUser: { id: 1, role: 'ADMIN' },
                users: [{ id: 2, name: 'Student 1', role: 'STUDENT', email: 's@s.com' }],
                events: [{ id: 1, title: 'Event 1', status: 'PENDING', organizer: { name: 'Org' } }],
                adminStats: { roleCounts: [], totalEvents: 1, totalUsers: 1, totalRegistrations: 0, trends: [] },
                fetchAdminStats: vi.fn(),
                fetchUsers: vi.fn(),
                fetchEvents: vi.fn(),
                updateUserRole: mockUpdateUserRole,
                deleteUser: mockDeleteUser,
                updateEventStatus: mockUpdateEventStatus,
                deleteEvent: mockDeleteEvent
            }}>
                <AdminDashboard />
            </AppContext.Provider>
        </BrowserRouter>
    );

    it('renders admin tabs', () => {
        renderAdmin();
        expect(screen.getByRole('tab', { name: /platform analytics/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /manage events/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /manage users/i })).toBeInTheDocument();
    });

    it('handles user moderation actions', () => {
        renderAdmin();
        fireEvent.click(screen.getByRole('tab', { name: /manage users/i }));
        
        expect(screen.getByText('Student 1')).toBeInTheDocument();
        
        // Find promote button
        const promoteBtn = screen.getByRole('button', { name: /promote to organizer/i });
        fireEvent.click(promoteBtn);
        expect(mockUpdateUserRole).toHaveBeenCalledWith(2, 'ORGANIZER');
    });

    it('handles event moderation actions', () => {
        renderAdmin();
        fireEvent.click(screen.getByRole('tab', { name: /manage events/i }));
        
        expect(screen.getByText('Event 1')).toBeInTheDocument();
        
        const approveBtn = screen.getByRole('button', { name: /approve/i });
        fireEvent.click(approveBtn);
        expect(mockUpdateEventStatus).toHaveBeenCalledWith(1, 'APPROVED');
    });
});
