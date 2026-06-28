import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, UserCheck } from 'lucide-react';
import type { User } from '../types';
import { validateUser } from '../utils/validation';
import type { ValidationErrors } from '../utils/validation';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id'>) => Promise<void>;
  userToEdit: User | null;
  isSubmitting: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset or fill form data when open state or userToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          firstName: userToEdit.firstName,
          lastName: userToEdit.lastName,
          email: userToEdit.email,
          department: userToEdit.department,
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          department: '',
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, userToEdit]);

  // Run validation on form data when it changes (if touched)
  useEffect(() => {
    // Only run validation if the form has been touched
    if (Object.keys(touched).length > 0) {
      const validationErrors = validateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
      });
      setErrors(validationErrors);
    }
  }, [formData, touched]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched to trigger full validation check
    const allTouched = {
      firstName: true,
      lastName: true,
      email: true,
      department: true,
    };
    setTouched(allTouched);

    const validationErrors = validateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      department: formData.department,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await onSave({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          department: formData.department,
        });
        onClose();
      } catch {
        // Errors are handled by the parent component (Toast system)
      }
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" data-testid="user-form-modal">
      <div className="modal-content glass">
        <div className="modal-header">
          <h2 id="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {userToEdit ? (
              <>
                <UserCheck size={20} className="brand-icon" /> Edit User Details
              </>
            ) : (
              <>
                <UserPlus size={20} className="brand-icon" /> Add New User
              </>
            )}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              className={`form-control ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. John"
              disabled={isSubmitting}
              required
            />
            {errors.firstName && touched.firstName && (
              <span className="invalid-feedback" data-testid="error-firstName">
                {errors.firstName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              className={`form-control ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Doe"
              disabled={isSubmitting}
              required
            />
            {errors.lastName && touched.lastName && (
              <span className="invalid-feedback" data-testid="error-lastName">
                {errors.lastName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. john.doe@example.com"
              disabled={isSubmitting}
              required
            />
            {errors.email && touched.email && (
              <span className="invalid-feedback" data-testid="error-email">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              type="text"
              name="department"
              className={`form-control ${errors.department && touched.department ? 'is-invalid' : ''}`}
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Engineering"
              disabled={isSubmitting}
              required
            />
            {errors.department && touched.department && (
              <span className="invalid-feedback" data-testid="error-department">
                {errors.department}
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              data-testid="save-user-btn"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
