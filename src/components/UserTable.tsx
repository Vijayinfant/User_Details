import React from 'react';
import { Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Users } from 'lucide-react';
import type { User, SortOptions, SortKey } from '../types';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  sortOptions: SortOptions;
  onSort: (key: SortKey) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  sortOptions,
  onSort,
  onEdit,
  onDelete,
}) => {
  const renderSortIcon = (key: SortKey) => {
    if (sortOptions.key !== key) {
      return <ArrowUpDown size={14} className="sort-icon" />;
    }
    return sortOptions.direction === 'asc' ? (
      <ChevronUp size={14} className="sort-icon active" />
    ) : (
      <ChevronDown size={14} className="sort-icon active" />
    );
  };

  if (isLoading) {
    return (
      <div className="table-container glass" data-testid="table-loading-skeleton">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Department</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="skeleton-row">
                <td><div className="skeleton-text id"></div></td>
                <td><div className="skeleton-text name"></div></td>
                <td><div className="skeleton-text name"></div></td>
                <td><div className="skeleton-text email"></div></td>
                <td><div className="skeleton-text dept"></div></td>
                <td><div className="skeleton-text actions"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="table-container glass" data-testid="table-empty-state">
        <div className="empty-state">
          <Users size={48} className="empty-state-icon" />
          <h3>No users found</h3>
          <p>No user records matched your criteria. Try adjusting your search query or filters, or create a new user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container glass" data-testid="user-table">
      <table>
        <thead>
          <tr>
            <th className="sortable-th" onClick={() => onSort('id')}>
              <div className="th-content">
                ID {renderSortIcon('id')}
              </div>
            </th>
            <th className="sortable-th" onClick={() => onSort('firstName')}>
              <div className="th-content">
                First Name {renderSortIcon('firstName')}
              </div>
            </th>
            <th className="sortable-th" onClick={() => onSort('lastName')}>
              <div className="th-content">
                Last Name {renderSortIcon('lastName')}
              </div>
            </th>
            <th className="sortable-th" onClick={() => onSort('email')}>
              <div className="th-content">
                Email {renderSortIcon('email')}
              </div>
            </th>
            <th className="sortable-th" onClick={() => onSort('department')}>
              <div className="th-content">
                Department {renderSortIcon('department')}
              </div>
            </th>
            <th style={{ width: '100px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td className="user-id-col">{user.id}</td>
              <td className="user-name-cell">{user.firstName}</td>
              <td className="user-name-cell">{user.lastName}</td>
              <td>{user.email}</td>
              <td>
                <span className="user-dept-badge">{user.department}</span>
              </td>
              <td>
                <div className="action-buttons-cell">
                  <button
                    className="btn btn-icon-only btn-action-edit"
                    onClick={() => onEdit(user)}
                    title="Edit user details"
                    aria-label={`Edit user ${user.firstName} ${user.lastName}`}
                    data-testid={`edit-btn-${user.id}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-icon-only btn-action-delete"
                    onClick={() => onDelete(user)}
                    title="Delete user"
                    aria-label={`Delete user ${user.firstName} ${user.lastName}`}
                    data-testid={`delete-btn-${user.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
