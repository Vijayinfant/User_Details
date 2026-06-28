import type { User, BackendUser } from '../types';

/**
 * Maps a JSONPlaceholder backend user schema to the frontend User interface.
 */
export function mapToFrontendUser(backend: BackendUser): User {
  const nameParts = (backend.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  return {
    id: backend.id,
    firstName,
    lastName,
    email: backend.email || '',
    department: backend.company?.name || 'General',
  };
}

/**
 * Maps a frontend User object back to the JSONPlaceholder backend user schema.
 */
export function mapToBackendUser(user: User): BackendUser {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    username: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}`,
    phone: '',
    website: '',
    company: {
      name: user.department,
    },
  };
}
