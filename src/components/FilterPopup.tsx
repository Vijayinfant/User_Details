import React, { useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import type { FilterOptions } from '../types';

interface FilterPopupProps {
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterPopup: React.FC<FilterPopupProps> = ({
  currentFilters,
  onApplyFilters,
  onResetFilters,
  isOpen,
  onClose,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({ ...currentFilters });

  // Sync state with currentFilters when popup opens
  useEffect(() => {
    if (isOpen) {
      setFilters({ ...currentFilters });
    }
  }, [isOpen, currentFilters]);

  // Close popup when clicking outside of it
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const popupEl = document.querySelector('.filter-popup');
      const toggleBtnEl = document.querySelector('[data-testid="filter-toggle-btn"]');
      
      if (
        popupEl && 
        !popupEl.contains(event.target as Node) && 
        toggleBtnEl && 
        !toggleBtnEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
    };
    setFilters(emptyFilters);
    onResetFilters();
    onClose();
  };

  return (
    <div className="filter-popup glass" data-testid="filter-popup">
      <div className="filter-popup-header">
        <h3>Filter Users</h3>
      </div>
      <form onSubmit={handleSubmit} className="filter-grid">
        <div className="form-group">
          <label htmlFor="filter-firstName">First Name</label>
          <input
            id="filter-firstName"
            type="text"
            name="firstName"
            className="form-control"
            value={filters.firstName}
            onChange={handleChange}
            placeholder="Search first name..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="filter-lastName">Last Name</label>
          <input
            id="filter-lastName"
            type="text"
            name="lastName"
            className="form-control"
            value={filters.lastName}
            onChange={handleChange}
            placeholder="Search last name..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="filter-email">Email</label>
          <input
            id="filter-email"
            type="text"
            name="email"
            className="form-control"
            value={filters.email}
            onChange={handleChange}
            placeholder="Search email..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="filter-department">Department</label>
          <input
            id="filter-department"
            type="text"
            name="department"
            className="form-control"
            value={filters.department}
            onChange={handleChange}
            placeholder="Search department..."
          />
        </div>
        <div className="filter-popup-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <Check size={14} /> Apply
          </button>
        </div>
      </form>
    </div>
  );
};
