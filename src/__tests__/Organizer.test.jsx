import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import OrganizerDashboard from '../pages/OrganizerDashboard';
import CreateEvent from '../pages/CreateEvent';
import { AppContext } from '../context/AppContext';

describe('Organizer Interactions', () => {
    describe('Create Event', () => {
        const mockCreateEvent = vi.fn();
        const renderCreate = () => render(
            <BrowserRouter>
                <AppContext.Provider value={{ 
                    createEvent: mockCreateEvent, 
                    currentUser: { id: 1, role: 'ORGANIZER' } 
                }}>
                    <CreateEvent />
                </AppContext.Provider>
            </BrowserRouter>
        );

        it('renders the create event form', () => {
            renderCreate();
            expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        });
    });

    describe('Organizer Dashboard & Attendance', () => {
        const mockVerifyAttendance = vi.fn();
        const renderDashboard = () => render(
            <BrowserRouter>
                <AppContext.Provider value={{ 
                    currentUser: { id: 1, role: 'ORGANIZER' },
                    events: [{ id: 1, title: 'My Event', organizerId: 1 }],
                    registrations: [],
                    users: [],
                    verifyAttendance: mockVerifyAttendance,
                    fetchEvents: vi.fn(),
                    fetchRegistrations: vi.fn(),
                    fetchUsers: vi.fn(),
                    approveRegistration: vi.fn(),
                    rejectRegistration: vi.fn(),
                    assignVolunteer: vi.fn()
                }}>
                    <OrganizerDashboard />
                </AppContext.Provider>
            </BrowserRouter>
        );

        it('renders the attendance verification UI', () => {
            renderDashboard();
            fireEvent.click(screen.getByRole('tab', { name: /attendance check/i }));
            expect(screen.getByPlaceholderText(/enter ticket id/i)).toBeInTheDocument();
        });

        it('submits attendance verification', () => {
            renderDashboard();
            fireEvent.click(screen.getByRole('tab', { name: /attendance check/i }));
            const input = screen.getByPlaceholderText(/enter ticket id/i);
            fireEvent.change(input, { target: { value: 'CC-1-2' } });
            fireEvent.click(screen.getByRole('button', { name: /verify ticket/i }));
            
            expect(mockVerifyAttendance).toHaveBeenCalledWith('CC-1-2', 1);
        });
    });
});
