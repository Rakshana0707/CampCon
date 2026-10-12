import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import { AppContext } from '../context/AppContext';

const mockEvents = [
    { id: 1, title: 'Tech Fest', category: 'Technical', department: 'CS', status: 'APPROVED', capacity: 100 },
    { id: 2, title: 'Art Show', category: 'Cultural', department: 'Arts', status: 'APPROVED', capacity: 50 }
];

describe('Events Discovery and Filters', () => {
    const renderEvents = () => render(
        <BrowserRouter>
            <AppContext.Provider value={{ events: mockEvents, fetchEvents: vi.fn(), isLoading: false }}>
                <Events />
            </AppContext.Provider>
        </BrowserRouter>
    );

    it('renders event list', () => {
        renderEvents();
        expect(screen.getByText('Tech Fest')).toBeInTheDocument();
        expect(screen.getByText('Art Show')).toBeInTheDocument();
    });

    it('filters events by category', () => {
        renderEvents();
        // The filter in Filter.jsx might not have an aria-label "category", let's use a simpler approach
        // if we assume it works or just rely on what is accessible.
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[1], { target: { value: 'Cultural' } });
        
        expect(screen.queryByText('Tech Fest')).not.toBeInTheDocument();
        expect(screen.getByText('Art Show')).toBeInTheDocument();
    });
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '1' }),
    };
});

describe('EventDetails', () => {
    const mockRegister = vi.fn();
    
    const renderEventDetails = () => render(
        <BrowserRouter>
            <AppContext.Provider value={{ 
                events: mockEvents, 
                currentUser: { id: 10, role: 'STUDENT' },
                registrations: [],
                registerForEvent: mockRegister,
                fetchRegistrations: vi.fn(),
                isLoading: false 
            }}>
                <EventDetails />
            </AppContext.Provider>
        </BrowserRouter>
    );

    it('renders event details correctly', () => {
        renderEventDetails();
        expect(screen.getByText('Tech Fest')).toBeInTheDocument();
    });
});

