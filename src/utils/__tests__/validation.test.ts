import { describe, it, expect } from 'vitest';
import { validateUser } from '../validation';

describe('validateUser', () => {
  it('should pass validation with valid user details', () => {
    const validUser = {
      firstName: 'Leanne',
      lastName: 'Graham',
      email: 'Sincere@april.biz',
      department: 'Engineering',
    };
    const errors = validateUser(validUser);
    expect(errors).toEqual({});
  });

  it('should detect empty required fields', () => {
    const emptyUser = {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
    };
    const errors = validateUser(emptyUser);
    expect(errors.firstName).toBe('First Name is required.');
    expect(errors.lastName).toBe('Last Name is required.');
    expect(errors.email).toBe('Email is required.');
    expect(errors.department).toBe('Department is required.');
  });

  it('should validate name length limits', () => {
    const shortNames = {
      firstName: 'A',
      lastName: 'B',
      email: 'abc@example.com',
      department: 'D',
    };
    const errors = validateUser(shortNames);
    expect(errors.firstName).toBe('First Name must be at least 2 characters long.');
    expect(errors.lastName).toBe('Last Name must be at least 2 characters long.');
    expect(errors.department).toBe('Department must be at least 2 characters long.');
  });

  it('should reject invalid characters in names', () => {
    const invalidNames = {
      firstName: 'John123',
      lastName: 'Doe!',
      email: 'john@example.com',
      department: 'Marketing',
    };
    const errors = validateUser(invalidNames);
    expect(errors.firstName).toBe('First Name can only contain letters, spaces, and hyphens.');
    expect(errors.lastName).toBe('Last Name can only contain letters, spaces, and hyphens.');
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = ['invalid-email', 'abc@', '@example.com', 'abc@com'];
    invalidEmails.forEach((email) => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email,
        department: 'Sales',
      };
      const errors = validateUser(user);
      expect(errors.email).toBe('Please enter a valid email address.');
    });
  });
});
