import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import Tasks from '../Tasks';
import { mockStore, mockState } from '../../test/mocks/reduxMock';
import { mockTasks } from '../../test/mocks/serviceMocks';
import taskService from '../../services/taskService';

// Mock the task service
jest.mock('../../services/taskService');

const renderTasksWithStore = (initialState = mockState) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <Tasks />
    </Provider>
  );
};

describe('Tasks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    taskService.getAllTasks.mockResolvedValue(mockTasks);
  });

  it('renders tasks list correctly', async () => {
    renderTasksWithStore();

    await waitFor(() => {
      expect(screen.getByText(/aufgaben/i)).toBeInTheDocument();
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockTasks[1].title)).toBeInTheDocument();
    });
  });

  it('opens create task dialog when clicking add button', async () => {
    renderTasksWithStore();

    const addButton = screen.getByRole('button', { name: /neue aufgabe/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/neue aufgabe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/titel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/beschreibung/i)).toBeInTheDocument();
    });
  });

  it('handles task creation successfully', async () => {
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      type: 'door_to_door',
      priority: 'high',
      points: 20,
    };

    taskService.createTask.mockResolvedValueOnce(newTask);

    renderTasksWithStore();

    // Open create dialog
    const addButton = screen.getByRole('button', { name: /neue aufgabe/i });
    fireEvent.click(addButton);

    // Fill form
    const titleInput = screen.getByLabelText(/titel/i);
    const descriptionInput = screen.getByLabelText(/beschreibung/i);
    
    fireEvent.change(titleInput, { target: { value: newTask.title } });
    fireEvent.change(descriptionInput, { target: { value: newTask.description } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /erstellen/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(expect.objectContaining({
        title: newTask.title,
        description: newTask.description,
      }));
    });
  });

  it('handles task deletion', async () => {
    renderTasksWithStore();

    await waitFor(() => {
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      fireEvent.click(deleteButton);
    });

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /bestätigen/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(taskService.deleteTask).toHaveBeenCalledWith(mockTasks[0]._id);
    });
  });

  it('filters tasks correctly', async () => {
    renderTasksWithStore();

    await waitFor(() => {
      const filterInput = screen.getByPlaceholderText(/suchen/i);
      fireEvent.change(filterInput, { target: { value: mockTasks[0].title } });
    });

    await waitFor(() => {
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
      expect(screen.queryByText(mockTasks[1].title)).not.toBeInTheDocument();
    });
  });

  it('sorts tasks by priority', async () => {
    renderTasksWithStore();

    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: /sortieren/i });
      fireEvent.click(sortButton);
      const priorityOption = screen.getByText(/priorität/i);
      fireEvent.click(priorityOption);
    });

    const taskElements = screen.getAllByRole('listitem');
    expect(taskElements[0]).toHaveTextContent(/high/i);
  });

  it('shows error message when tasks fail to load', async () => {
    const error = new Error('Failed to load tasks');
    taskService.getAllTasks.mockRejectedValueOnce(error);

    renderTasksWithStore();

    await waitFor(() => {
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });

  it('updates task status correctly', async () => {
    const updatedTask = { ...mockTasks[0], status: 'completed' };
    taskService.updateTask.mockResolvedValueOnce(updatedTask);

    renderTasksWithStore();

    await waitFor(() => {
      const statusButton = screen.getByRole('button', { name: /status/i });
      fireEvent.click(statusButton);
      const completeOption = screen.getByText(/abgeschlossen/i);
      fireEvent.click(completeOption);
    });

    await waitFor(() => {
      expect(taskService.updateTask).toHaveBeenCalledWith(
        mockTasks[0]._id,
        expect.objectContaining({ status: 'completed' })
      );
    });
  });
});
