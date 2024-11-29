import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import DoorToDoor from '../DoorToDoor';
import { mockStore, mockState } from '../../test/mocks/reduxMock';
import { mockDistricts } from '../../test/mocks/serviceMocks';
import districtService from '../../services/districtService';

// Mock the district service
jest.mock('../../services/districtService');

const renderDoorToDoorWithStore = (initialState = mockState) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <DoorToDoor />
    </Provider>
  );
};

describe('DoorToDoor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    districtService.getAllDistricts.mockResolvedValue(mockDistricts);
  });

  it('renders districts list correctly', async () => {
    renderDoorToDoorWithStore();

    await waitFor(() => {
      expect(screen.getByText(/wahlbezirke/i)).toBeInTheDocument();
      expect(screen.getByText(mockDistricts[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockDistricts[1].name)).toBeInTheDocument();
    });
  });

  it('shows district details when selecting a district', async () => {
    renderDoorToDoorWithStore();

    await waitFor(() => {
      const districtButton = screen.getByText(mockDistricts[0].name);
      fireEvent.click(districtButton);
    });

    await waitFor(() => {
      expect(screen.getByText(mockDistricts[0].households[0].street)).toBeInTheDocument();
      expect(screen.getByText(mockDistricts[0].households[0].houseNumber)).toBeInTheDocument();
    });
  });

  it('opens add household dialog', async () => {
    renderDoorToDoorWithStore();

    // Select a district first
    await waitFor(() => {
      const districtButton = screen.getByText(mockDistricts[0].name);
      fireEvent.click(districtButton);
    });

    const addButton = screen.getByRole('button', { name: /haushalt hinzufügen/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/neuer haushalt/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/straße/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hausnummer/i)).toBeInTheDocument();
    });
  });

  it('handles household creation successfully', async () => {
    const newHousehold = {
      street: 'Teststraße',
      houseNumber: '123',
      postalCode: '12345',
      city: 'Teststadt',
      status: 'not_visited',
      notes: 'Test notes',
    };

    districtService.addHousehold.mockResolvedValueOnce(newHousehold);

    renderDoorToDoorWithStore();

    // Select a district first
    await waitFor(() => {
      const districtButton = screen.getByText(mockDistricts[0].name);
      fireEvent.click(districtButton);
    });

    // Open add dialog
    const addButton = screen.getByRole('button', { name: /haushalt hinzufügen/i });
    fireEvent.click(addButton);

    // Fill form
    const streetInput = screen.getByLabelText(/straße/i);
    const houseNumberInput = screen.getByLabelText(/hausnummer/i);
    const postalCodeInput = screen.getByLabelText(/plz/i);
    const cityInput = screen.getByLabelText(/stadt/i);
    const notesInput = screen.getByLabelText(/notizen/i);

    fireEvent.change(streetInput, { target: { value: newHousehold.street } });
    fireEvent.change(houseNumberInput, { target: { value: newHousehold.houseNumber } });
    fireEvent.change(postalCodeInput, { target: { value: newHousehold.postalCode } });
    fireEvent.change(cityInput, { target: { value: newHousehold.city } });
    fireEvent.change(notesInput, { target: { value: newHousehold.notes } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /hinzufügen/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(districtService.addHousehold).toHaveBeenCalledWith(
        mockDistricts[0]._id,
        expect.objectContaining(newHousehold)
      );
    });
  });

  it('updates household status correctly', async () => {
    const updatedHousehold = {
      ...mockDistricts[0].households[0],
      status: 'completed',
    };

    districtService.updateHousehold.mockResolvedValueOnce(updatedHousehold);

    renderDoorToDoorWithStore();

    // Select a district first
    await waitFor(() => {
      const districtButton = screen.getByText(mockDistricts[0].name);
      fireEvent.click(districtButton);
    });

    // Find and click edit button for first household
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(editButton);

    // Change status
    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    // Submit changes
    const updateButton = screen.getByRole('button', { name: /aktualisieren/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(districtService.updateHousehold).toHaveBeenCalledWith(
        mockDistricts[0]._id,
        updatedHousehold._id,
        expect.objectContaining({ status: 'completed' })
      );
    });
  });

  it('shows error message when districts fail to load', async () => {
    const error = new Error('Failed to load districts');
    districtService.getAllDistricts.mockRejectedValueOnce(error);

    renderDoorToDoorWithStore();

    await waitFor(() => {
      expect(screen.getByText(/failed to load districts/i)).toBeInTheDocument();
    });
  });

  it('displays correct household count for each district', async () => {
    renderDoorToDoorWithStore();

    await waitFor(() => {
      expect(screen.getByText(`${mockDistricts[0].households.length} Haushalte`)).toBeInTheDocument();
      expect(screen.getByText('0 Haushalte')).toBeInTheDocument(); // For empty district
    });
  });

  it('filters households by status', async () => {
    renderDoorToDoorWithStore();

    // Select a district first
    await waitFor(() => {
      const districtButton = screen.getByText(mockDistricts[0].name);
      fireEvent.click(districtButton);
    });

    // Find and use status filter
    const statusFilter = screen.getByLabelText(/status filter/i);
    fireEvent.change(statusFilter, { target: { value: 'completed' } });

    await waitFor(() => {
      const completedHouseholds = mockDistricts[0].households.filter(h => h.status === 'completed');
      expect(screen.getAllByRole('listitem')).toHaveLength(completedHouseholds.length);
    });
  });
});
