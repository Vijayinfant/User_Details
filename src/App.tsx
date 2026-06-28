import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Filter, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import type { User, FilterOptions, SortOptions, SortKey } from './types';
import { fetchUsers, createUser, updateUser, deleteUser } from './services/api';
import { mapToFrontendUser, mapToBackendUser } from './utils/mapping';
import { UserTable } from './components/UserTable';
import { UserForm } from './components/UserForm';
import { FilterPopup } from './components/FilterPopup';
import { DeleteConfirm } from './components/DeleteConfirm';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import './App.css';

export const App: React.FC = () => {
  // Core user state initialized from localStorage
  const [users, setUsers] = useState<User[]>(() => {
    const localData = localStorage.getItem('swa_users');
    return localData ? JSON.parse(localData) : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return localStorage.getItem('swa_users') === null;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
  });

  // Sorting state
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    key: 'id',
    direction: 'asc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helpers
  const showToast = (text: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial user loading & Reload merge strategy
  const loadUsers = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchUsers();
      const mapped = data.map(mapToFrontendUser);
      
      const localData = localStorage.getItem('swa_users');
      if (localData !== null) {
        const currentLocalUsers: User[] = JSON.parse(localData);
        
        // 1. Keep local additions (ID > 10)
        const additions = currentLocalUsers.filter((u) => u.id > 10);
        
        // 2. Keep all API users (restoring any that were deleted locally), and preserve any local edits
        const processedApi = mapped.map((apiUser) => {
          const localVersion = currentLocalUsers.find((localUser) => localUser.id === apiUser.id);
          return localVersion ? localVersion : apiUser;
        });
          
        const merged = [...processedApi, ...additions];
        setUsers(merged);
        localStorage.setItem('swa_users', JSON.stringify(merged));
      } else {
        setUsers(mapped);
        localStorage.setItem('swa_users', JSON.stringify(mapped));
      }
    } catch (err: any) {
      const localData = localStorage.getItem('swa_users');
      if (localData !== null) {
        setUsers(JSON.parse(localData));
        showToast(`API error. Loaded from offline cache.`, 'error');
      } else {
        const errMsg = err.message || 'Unknown network error';
        setApiError(errMsg);
        showToast(`Failed to load users: ${errMsg}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // CRUD handlers
  const handleSaveUser = async (userData: Omit<User, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (userToEdit) {
        // Edit flow
        const updatedUser: User = { ...userToEdit, ...userData };
        const backendPayload = mapToBackendUser(updatedUser);
        await updateUser(userToEdit.id, backendPayload);
        
        // Update local state and localStorage
        setUsers((prev) => {
          const nextUsers = prev.map((u) => (u.id === userToEdit.id ? updatedUser : u));
          localStorage.setItem('swa_users', JSON.stringify(nextUsers));
          return nextUsers;
        });
        showToast(`Successfully updated user "${userData.firstName} ${userData.lastName}"`, 'success');
      } else {
        // Create flow
        const dummyUser: User = { id: 0, ...userData };
        const backendPayload = mapToBackendUser(dummyUser);
        await createUser(backendPayload);
        
        // Calculate a unique local ID to prevent duplication clashes
        const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id), 10) + 1 : 11;
        const newUser: User = {
          ...userData,
          id: nextId,
        };

        // Add to local state and localStorage
        setUsers((prev) => {
          const nextUsers = [...prev, newUser];
          localStorage.setItem('swa_users', JSON.stringify(nextUsers));
          return nextUsers;
        });
        showToast(`Successfully added user "${userData.firstName} ${userData.lastName}"`, 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      const action = userToEdit ? 'update' : 'add';
      showToast(`Failed to ${action} user: ${err.message || 'API Error'}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteUser(userToDelete.id);
      
      // Update local state and localStorage
      setUsers((prev) => {
        const nextUsers = prev.filter((u) => u.id !== userToDelete.id);
        localStorage.setItem('swa_users', JSON.stringify(nextUsers));
        return nextUsers;
      });
      showToast(`Successfully deleted user "${userToDelete.firstName} ${userToDelete.lastName}"`, 'success');
      setIsDeleteConfirmOpen(false);
    } catch (err: any) {
      showToast(`Failed to delete user: ${err.message || 'API Error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUserClick = (user: User) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleAddUserClick = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  // Filter & Search & Sort computation
  const handleSort = (key: SortKey) => {
    setSortOptions((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        key,
        direction: 'asc',
      };
    });
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset page on filter
  };

  const handleResetFilters = () => {
    setFilters({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const removeFilterKey = (key: keyof FilterOptions) => {
    setFilters((prev) => ({
      ...prev,
      [key]: '',
    }));
    setCurrentPage(1);
  };

  // Determine active filtering badges
  const activeFiltersList = useMemo(() => {
    const list: Array<{ key: keyof FilterOptions; label: string; value: string }> = [];
    if (filters.firstName) list.push({ key: 'firstName', label: 'First Name', value: filters.firstName });
    if (filters.lastName) list.push({ key: 'lastName', label: 'Last Name', value: filters.lastName });
    if (filters.email) list.push({ key: 'email', label: 'Email', value: filters.email });
    if (filters.department) list.push({ key: 'department', label: 'Dept', value: filters.department });
    return list;
  }, [filters]);

  // Compute filtered & sorted users
  const processedUsers = useMemo(() => {
    let result = [...users];

    // 1. Apply Global Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.id.toString().includes(query) ||
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.department.toLowerCase().includes(query)
      );
    }

    // 2. Apply Popup Field Filters
    if (filters.firstName.trim()) {
      const fName = filters.firstName.toLowerCase().trim();
      result = result.filter((u) => u.firstName.toLowerCase().includes(fName));
    }
    if (filters.lastName.trim()) {
      const lName = filters.lastName.toLowerCase().trim();
      result = result.filter((u) => u.lastName.toLowerCase().includes(lName));
    }
    if (filters.email.trim()) {
      const email = filters.email.toLowerCase().trim();
      result = result.filter((u) => u.email.toLowerCase().includes(email));
    }
    if (filters.department.trim()) {
      const dept = filters.department.toLowerCase().trim();
      result = result.filter((u) => u.department.toLowerCase().includes(dept));
    }

    // 3. Apply Sorting
    const { key, direction } = sortOptions;
    result.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, filters, sortOptions]);

  // Compute paginated slice
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedUsers.slice(startIndex, startIndex + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  // Pagination bounds checking
  const totalPages = Math.max(Math.ceil(processedUsers.length / pageSize), 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Stats computation
  const stats = useMemo(() => {
    const deptSet = new Set(users.map((u) => u.department));
    return {
      total: users.length,
      filtered: processedUsers.length,
      departments: deptSet.size,
    };
  }, [users, processedUsers]);

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="app-header">
        <div className="brand-section">
          <Users size={32} className="brand-icon" />
          <div className="app-title">
            <h1>User Directory</h1>
            <p className="app-subtitle">Manage workspace personnel database and roles</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-icon-only"
            onClick={loadUsers}
            disabled={isLoading}
            title="Reload user records"
            aria-label="Reload users"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} style={{ animation: isLoading ? 'pulse 1.5s infinite' : 'none' }} />
          </button>
          <button className="btn btn-primary" onClick={handleAddUserClick}>
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </header>

      {/* API Error Alert Banner */}
      {apiError && !isLoading && (
        <div
          className="glass"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.05)',
          }}
          role="alert"
        >
          <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div style={{ flexGrow: 1 }}>
            <span style={{ fontWeight: 600 }}>API Connection Error:</span> {apiError}. Changes made will compile offline.
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={loadUsers}>
            Retry Connect
          </button>
        </div>
      )}

      {/* Dashboard Stats */}
      <section className="stats-bar">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper primary">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Staff</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper success">
            <Filter size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Filtered Results</span>
            <span className="stat-value">{stats.filtered}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper primary" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.15)' }}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Departments</span>
            <span className="stat-value">{stats.departments}</span>
          </div>
        </div>
      </section>

      {/* Control Toolbar */}
      <section className="toolbar-section glass">
        <div className="search-filter-group">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, name, email or department..."
            />
          </div>
          <div className="filter-popup-container">
            <button
              className={`btn btn-secondary ${activeFiltersList.length > 0 ? 'btn-primary' : ''}`}
              style={activeFiltersList.length > 0 ? { background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.3)' } : {}}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              data-testid="filter-toggle-btn"
            >
              <Filter size={16} /> Filters
            </button>
            <FilterPopup
              currentFilters={filters}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </div>

        <div className="toolbar-controls">
          <div className="limit-select-wrapper">
            <span>Show:</span>
            <select
              className="limit-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              data-testid="page-size-select"
            >
              <option value={10}>10 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
            </select>
          </div>
        </div>
      </section>

      {/* Active Filter Badges */}
      {activeFiltersList.length > 0 && (
        <div className="active-filters">
          <span className="filter-title">Active Filters:</span>
          {activeFiltersList.map((f) => (
            <span key={f.key} className="filter-badge" data-testid={`filter-badge-${f.key}`}>
              {f.label}: <strong>{f.value}</strong>
              <button
                className="filter-badge-remove"
                onClick={() => removeFilterKey(f.key)}
                aria-label={`Remove filter for ${f.label}`}
              >
                &times;
              </button>
            </span>
          ))}
          <button className="clear-all-filters" onClick={handleResetFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* Responsive Users Grid Table */}
      <main style={{ flexGrow: 1 }}>
        <UserTable
          users={paginatedUsers}
          isLoading={isLoading}
          sortOptions={sortOptions}
          onSort={handleSort}
          onEdit={handleEditUserClick}
          onDelete={handleDeleteUserClick}
        />
      </main>

      {/* Pagination Bar */}
      {!isLoading && processedUsers.length > 0 && (
        <section className="pagination-section">
          <div className="page-status">
            Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, processedUsers.length)}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, processedUsers.length)}</strong> of{' '}
            <strong>{processedUsers.length}</strong> records
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              &gt;
            </button>
          </div>
        </section>
      )}

      {/* Add / Edit Form Modal */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        userToDelete={userToDelete}
        isSubmitting={isSubmitting}
      />

      {/* Feedback Toast Alerts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
