import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import EventCard from '../components/EventCard';
import { AppContext } from '../context/AppContext';

const mockToggleSaveEvent = vi.fn();

const mockEvent = {
    id: 1,
    title: "Hackathon 2026",
    category: "Technical",
    venue: "Main Auditorium",
    date: "2026-11-15",
    time: "10:00 AM",
    seats: 100,
    trending: true
};

const renderEventCard = (isFavorite = false) => {
    return render(
        <BrowserRouter>
            <AppContext.Provider value={{ bookmarks: isFavorite ? [1] : [], toggleSaveEvent: mockToggleSaveEvent }}>
                <EventCard event={mockEvent} />
            </AppContext.Provider>
        </BrowserRouter>
    );
};

describe('EventCard Component', () => {
    it('renders event details correctly', () => {
        renderEventCard();
        
        expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
        expect(screen.getByText('Technical')).toBeInTheDocument();
        expect(screen.getByText(/100 Seats Available/i)).toBeInTheDocument();
        expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    it('displays view details link', () => {
        renderEventCard();
        
        const link = screen.getByRole('link', { name: /view details/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/events/1');
    });
});
