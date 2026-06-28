import type { User } from '../types';

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
}

// Simple email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name regex validation: letters, spaces, hyphens, and apostrophes
const NAME_REGEX = /^[a-zA-Z\s\-'\u00C0-\u017F]+$/;

/**
 * Validates a user's details and returns an object containing validation error messages.
 * If there are no errors, the returned object will be empty.
 */
export function validateUser(user: Omit<User, 'id'>): ValidationErrors {
  const errors: ValidationErrors = {};

  // First Name Validation
  const firstName = (user.firstName || '').trim();
  if (!firstName) {
    errors.firstName = 'First Name is required.';
  } else if (firstName.length < 2) {
    errors.firstName = 'First Name must be at least 2 characters long.';
  } else if (!NAME_REGEX.test(firstName)) {
    errors.firstName = 'First Name can only contain letters, spaces, and hyphens.';
  }

  // Last Name Validation
  const lastName = (user.lastName || '').trim();
  if (!lastName) {
    errors.lastName = 'Last Name is required.';
  } else if (lastName.length < 2) {
    errors.lastName = 'Last Name must be at least 2 characters long.';
  } else if (!NAME_REGEX.test(lastName)) {
    errors.lastName = 'Last Name can only contain letters, spaces, and hyphens.';
  }

  // Email Validation
  const email = (user.email || '').trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Department Validation
  const department = (user.department || '').trim();
  if (!department) {
    errors.department = 'Department is required.';
  } else if (department.length < 2) {
    errors.department = 'Department must be at least 2 characters long.';
  }

  return errors;
}
