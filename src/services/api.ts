import type { BackendUser } from '../types';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Helper to simulate network latency.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all users from the mock API.
 */
export async function fetchUsers(): Promise<BackendUser[]> {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText} (${response.status})`);
  }
  return response.json();
}

/**
 * Create a new user.
 * JSONPlaceholder simulates the POST and returns the created user with a new ID (usually 11).
 */
export async function createUser(user: Omit<BackendUser, 'id'>): Promise<BackendUser> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`Failed to add user: ${response.statusText} (${response.status})`);
  }

  return response.json();
}

/**
 * Update an existing user.
 * If the user ID is > 10, JSONPlaceholder will return a 404 because the resource doesn't exist on their server.
 * In this case, we simulate a successful API response locally.
 */
export async function updateUser(id: number, user: Partial<BackendUser>): Promise<BackendUser> {
  // If the user ID is a locally created ID (typically > 10), we simulate API success.
  if (id > 10) {
    await delay(300); // Simulate network roundtrip
    return {
      id,
      ...user,
    } as BackendUser;
  }

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText} (${response.status})`);
  }

  return response.json();
}

/**
 * Delete a user.
 * If the user ID is > 10, we simulate a successful delete response locally.
 */
export async function deleteUser(id: number): Promise<void> {
  if (id > 10) {
    await delay(300); // Simulate network roundtrip
    return;
  }

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText} (${response.status})`);
  }
}
