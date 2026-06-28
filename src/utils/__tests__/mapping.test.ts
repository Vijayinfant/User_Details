import { describe, it, expect } from 'vitest';
import { mapToFrontendUser, mapToBackendUser } from '../mapping';
import type { BackendUser, User } from '../../types';

describe('Data Mapping Utility', () => {
  describe('mapToFrontendUser', () => {
    it('should split backend full name into first and last name', () => {
      const backendUser: BackendUser = {
        id: 1,
        name: 'Leanne Graham',
        email: 'Sincere@april.biz',
        company: {
          name: 'Romaguera-Crona',
        },
      };

      const mapped = mapToFrontendUser(backendUser);

      expect(mapped).toEqual({
        id: 1,
        firstName: 'Leanne',
        lastName: 'Graham',
        email: 'Sincere@april.biz',
        department: 'Romaguera-Crona',
      });
    });

    it('should handle single-word names correctly', () => {
      const backendUser: BackendUser = {
        id: 2,
        name: 'Cher',
        email: 'cher@example.com',
        company: {
          name: 'Music',
        },
      };

      const mapped = mapToFrontendUser(backendUser);

      expect(mapped.firstName).toBe('Cher');
      expect(mapped.lastName).toBe('');
    });

    it('should handle multi-word names correctly', () => {
      const backendUser: BackendUser = {
        id: 3,
        name: 'John Fitzgerald Kennedy',
        email: 'jfk@example.com',
        company: {
          name: 'Government',
        },
      };

      const mapped = mapToFrontendUser(backendUser);

      expect(mapped.firstName).toBe('John');
      expect(mapped.lastName).toBe('Fitzgerald Kennedy');
    });

    it('should default missing company details to General', () => {
      const backendUser: BackendUser = {
        id: 4,
        name: 'No Company',
        email: 'nocomp@example.com',
      };

      const mapped = mapToFrontendUser(backendUser);

      expect(mapped.department).toBe('General');
    });
  });

  describe('mapToBackendUser', () => {
    it('should merge first and last name into full name and nest department', () => {
      const user: User = {
        id: 5,
        firstName: 'Patricia',
        lastName: 'Lebsack',
        email: 'Julianne.OConner@kory.org',
        department: 'HR',
      };

      const mapped = mapToBackendUser(user);

      expect(mapped.id).toBe(5);
      expect(mapped.name).toBe('Patricia Lebsack');
      expect(mapped.email).toBe('Julianne.OConner@kory.org');
      expect(mapped.company?.name).toBe('HR');
    });
  });
});
