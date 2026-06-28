import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { User } from '../types';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userToDelete: User | null;
  isSubmitting: boolean;
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userToDelete,
  isSubmitting,
}) => {
  if (!isOpen || !userToDelete) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" data-testid="delete-confirm-modal">
      <div className="modal-content glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="delete-confirm-icon">
          <AlertTriangle size={48} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0' }}>
          Delete User Record?
        </h2>
        <p className="delete-confirm-text">
          Are you sure you want to delete user{' '}
          <strong>
            {userToDelete.firstName} {userToDelete.lastName}
          </strong>
          ? This action will remove the user from the database.
        </p>

        <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{ backgroundColor: 'var(--danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
            data-testid="confirm-delete-btn"
          >
            <Trash2 size={16} />
            {isSubmitting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};
