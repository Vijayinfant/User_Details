import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import * as api from '../../services/api';
import type { BackendUser } from '../../types';

// Mock the API layer
vi.mock('../../services/api', () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

const mockBackendUsers: BackendUser[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    email: 'Sincere@april.biz',
    company: { name: 'Engineering' },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    email: 'Shanna@melissa.tv',
    company: { name: 'Marketing' },
  },
];

describe('User Management App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default mock response for fetching users
    vi.mocked(api.fetchUsers).mockResolvedValue(mockBackendUsers);
  });

  it('should render loading skeleton and then load and display users', async () => {
    render(<App />);

    // Check loading skeleton renders
    expect(screen.getByTestId('table-loading-skeleton')).toBeInTheDocument();

    // Wait for the mock user data to resolve and render
    await waitFor(() => {
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
    });

    // Check that user rows are displayed
    expect(screen.getByText('Leanne')).toBeInTheDocument();
    expect(screen.getByText('Graham')).toBeInTheDocument();
    expect(screen.getByText('Ervin')).toBeInTheDocument();
    expect(screen.getByText('Howell')).toBeInTheDocument();
  });

  it('should display error banner if API request fails', async () => {
    vi.mocked(api.fetchUsers).mockRejectedValue(new Error('Network Timed Out'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API Connection Error:/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Network Timed Out/i).length).toBeGreaterThan(0);
  });

  it('should filter user records based on search query', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('user-table')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search by ID, name, email or department.../i);
    
    // Search for "Ervin"
    fireEvent.change(searchInput, { target: { value: 'Ervin' } });

    // "Ervin" should be visible, "Leanne" should be filtered out
    expect(screen.getByText('Ervin')).toBeInTheDocument();
    expect(screen.queryByText('Leanne')).not.toBeInTheDocument();
  });

  it('should open form modal and successfully add a new user', async () => {
    vi.mocked(api.createUser).mockResolvedValue({
      id: 11,
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: { name: 'Product' },
    });

    render(<App />);
    await waitFor(() => expect(screen.getByTestId('user-table')).toBeInTheDocument());

    // Click on "Add User" button
    const addButton = screen.getByRole('button', { name: /Add User/i });
    fireEvent.click(addButton);

    // Verify modal is open
    expect(screen.getByTestId('user-form-modal')).toBeInTheDocument();

    // Fill in input values
    fireEvent.change(screen.getByLabelText(/^First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/^Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/^Email Address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Department/i), { target: { value: 'Product' } });

    // Submit form
    const saveButton = screen.getByTestId('save-user-btn');
    fireEvent.click(saveButton);

    // Modal should close and new user should render in the table
    await waitFor(() => {
      expect(screen.queryByTestId('user-form-modal')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(api.createUser).toHaveBeenCalledTimes(1);
  });

  it('should display client-side validation errors in form modal', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('user-table')).toBeInTheDocument());

    // Open add form
    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

    // Click Save directly without typing anything
    fireEvent.click(screen.getByTestId('save-user-btn'));

    // Validation messages should render
    expect(screen.getByTestId('error-firstName')).toHaveTextContent('First Name is required.');
    expect(screen.getByTestId('error-lastName')).toHaveTextContent('Last Name is required.');
    expect(screen.getByTestId('error-email')).toHaveTextContent('Email is required.');
    expect(screen.getByTestId('error-department')).toHaveTextContent('Department is required.');
  });

  it('should trigger delete confirmation modal and delete a user', async () => {
    vi.mocked(api.deleteUser).mockResolvedValue(undefined);

    render(<App />);
    await waitFor(() => expect(screen.getByTestId('user-table')).toBeInTheDocument());

    // Click delete on Ervin Howell (ID: 2)
    const deleteButton = screen.getByTestId('delete-btn-2');
    fireEvent.click(deleteButton);

    // Verify confirmation modal opens
    expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByTestId('confirm-delete-btn');
    fireEvent.click(confirmButton);

    // Modal should close, user should be removed from table
    await waitFor(() => {
      expect(screen.queryByTestId('delete-confirm-modal')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Ervin')).not.toBeInTheDocument();
    expect(api.deleteUser).toHaveBeenCalledWith(2);
  });

  it('should restore deleted API users when reload is clicked', async () => {
    vi.mocked(api.deleteUser).mockResolvedValue(undefined);

    render(<App />);
    await waitFor(() => expect(screen.getByTestId('user-table')).toBeInTheDocument());

    // Verify both initial users are loaded
    expect(screen.getByText('Leanne')).toBeInTheDocument();
    expect(screen.getByText('Ervin')).toBeInTheDocument();

    // Delete Ervin Howell (ID: 2)
    const deleteButton = screen.getByTestId('delete-btn-2');
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    // Verify Ervin is removed
    await waitFor(() => {
      expect(screen.queryByText('Ervin')).not.toBeInTheDocument();
    });

    // Click the reload button
    const reloadButton = screen.getByRole('button', { name: /Reload users/i });
    fireEvent.click(reloadButton);

    // Verify Ervin is restored back in the table
    await waitFor(() => {
      expect(screen.getByText('Ervin')).toBeInTheDocument();
    });
  });
});
