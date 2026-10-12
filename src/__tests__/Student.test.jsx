import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import StudentDashboard from '../pages/StudentDashboard';
import { AppContext } from '../context/AppContext';

const mockRegistrations = [
    {
        id: 1,
        eventId: 1,
        status: 'APPROVED',
        attendance: 'PRESENT',
        certificateType: 'PARTICIPATION',
        event: { id: 1, title: 'Hackathon', date: '2025-01-01', location: 'Lab' }
    },
    {
        id: 2,
        eventId: 2,
        status: 'PENDING',
        attendance: 'PENDING',
        certificateType: 'NONE',
        event: { id: 2, title: 'Workshop', date: '2026-12-01', location: 'Hall' }
    }
];

describe('Student Dashboard', () => {
    const mockCancel = vi.fn();
    const renderDashboard = () => render(
        <BrowserRouter>
            <AppContext.Provider value={{ 
                currentUser: { id: 10, name: 'Student', role: 'STUDENT' },
                registrations: mockRegistrations,
                cancelRegistration: mockCancel,
                fetchRegistrations: vi.fn(),
                events: [{ id: 1, title: 'Hackathon', category: 'Tech' }]
            }}>
                <StudentDashboard />
            </AppContext.Provider>
        </BrowserRouter>
    );

    it('renders upcoming, pending, and completed tabs', () => {
        renderDashboard();
        expect(screen.getByText('Hackathon')).toBeInTheDocument();
        
        fireEvent.click(screen.getByRole('tab', { name: /pending/i }));
        expect(screen.getByText('Workshop')).toBeInTheDocument();
    });

    it('handles certificate access', () => {
        renderDashboard();
        fireEvent.click(screen.getByRole('tab', { name: /completed/i }));
        expect(screen.getByText(/download certificate/i)).toBeInTheDocument();
    });
});
