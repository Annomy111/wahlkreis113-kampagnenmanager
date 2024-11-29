import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import Events from '../Events';
import { mockStore, mockState } from '../../test/mocks/reduxMock';
import { mockEvents } from '../../test/mocks/serviceMocks';
import eventService from '../../services/eventService';
import { format } from 'date-fns';

// Mock the event service
jest.mock('../../services/eventService');

const renderEventsWithStore = (initialState = mockState) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <Events />
    </Provider>
  );
};

describe('Events Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventService.getAllEvents.mockResolvedValue(mockEvents);
  });

  it('renders events list correctly', async () => {
    renderEventsWithStore();

    await waitFor(() => {
      expect(screen.getByText(/veranstaltungen/i)).toBeInTheDocument();
      expect(screen.getByText(mockEvents[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockEvents[1].title)).toBeInTheDocument();
    });
  });

  it('opens create event dialog when clicking add button', async () => {
    renderEventsWithStore();

    const addButton = screen.getByRole('button', { name: /neue veranstaltung/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/neue veranstaltung/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/titel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/beschreibung/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/datum/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/uhrzeit/i)).toBeInTheDocument();
    });
  });

  it('handles event creation successfully', async () => {
    const newEvent = {
      title: 'New Event',
      description: 'New Description',
      type: 'Infostand',
      date: '2024-03-20',
      time: '14:00',
      location: 'Marktplatz',
      maxParticipants: 20,
    };

    eventService.createEvent.mockResolvedValueOnce(newEvent);

    renderEventsWithStore();

    // Open create dialog
    const addButton = screen.getByRole('button', { name: /neue veranstaltung/i });
    fireEvent.click(addButton);

    // Fill form
    const titleInput = screen.getByLabelText(/titel/i);
    const descriptionInput = screen.getByLabelText(/beschreibung/i);
    const dateInput = screen.getByLabelText(/datum/i);
    const timeInput = screen.getByLabelText(/uhrzeit/i);
    const locationInput = screen.getByLabelText(/ort/i);
    const maxParticipantsInput = screen.getByLabelText(/maximale teilnehmerzahl/i);

    fireEvent.change(titleInput, { target: { value: newEvent.title } });
    fireEvent.change(descriptionInput, { target: { value: newEvent.description } });
    fireEvent.change(dateInput, { target: { value: newEvent.date } });
    fireEvent.change(timeInput, { target: { value: newEvent.time } });
    fireEvent.change(locationInput, { target: { value: newEvent.location } });
    fireEvent.change(maxParticipantsInput, { target: { value: newEvent.maxParticipants } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /erstellen/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalledWith(expect.objectContaining({
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
      }));
    });
  });

  it('handles event registration', async () => {
    renderEventsWithStore();

    await waitFor(() => {
      const registerButton = screen.getAllByRole('button', { name: /teilnehmen/i })[0];
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(eventService.registerForEvent).toHaveBeenCalledWith(mockEvents[0]._id);
    });
  });

  it('shows correct event details', async () => {
    renderEventsWithStore();

    await waitFor(() => {
      expect(screen.getByText(mockEvents[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockEvents[0].description)).toBeInTheDocument();
      expect(screen.getByText(mockEvents[0].location)).toBeInTheDocument();
      expect(screen.getByText(`${mockEvents[0].participants.length} / ${mockEvents[0].maxParticipants} Teilnehmer`)).toBeInTheDocument();
    });
  });

  it('formats date and time correctly', async () => {
    renderEventsWithStore();

    const formattedDate = format(new Date(mockEvents[0].date), 'dd.MM.yyyy HH:mm');

    await waitFor(() => {
      expect(screen.getByText(new RegExp(formattedDate, 'i'))).toBeInTheDocument();
    });
  });

  it('handles event deletion', async () => {
    // Mock user as admin
    const adminState = {
      ...mockState,
      auth: {
        ...mockState.auth,
        user: {
          ...mockState.auth.user,
          role: 'admin'
        }
      }
    };

    renderEventsWithStore(adminState);

    await waitFor(() => {
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      fireEvent.click(deleteButton);
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    await waitFor(() => {
      expect(eventService.deleteEvent).toHaveBeenCalledWith(mockEvents[0]._id);
    });
  });

  it('shows error message when events fail to load', async () => {
    const error = new Error('Failed to load events');
    eventService.getAllEvents.mockRejectedValueOnce(error);

    renderEventsWithStore();

    await waitFor(() => {
      expect(screen.getByText(/failed to load events/i)).toBeInTheDocument();
    });
  });

  it('disables registration when event is full', async () => {
    const fullEvent = {
      ...mockEvents[0],
      participants: Array(mockEvents[0].maxParticipants).fill('user-id'),
    };

    eventService.getAllEvents.mockResolvedValueOnce([fullEvent]);

    renderEventsWithStore();

    await waitFor(() => {
      const registerButton = screen.getByRole('button', { name: /teilnehmen/i });
      expect(registerButton).toBeDisabled();
    });
  });
});
