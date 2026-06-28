# Mock User Directory Web Application

A responsive, high-fidelity React + TypeScript SPA that integrates with the public `/users` endpoint of JSONPlaceholder to view, search, filter, sort, paginate, add, edit, and delete user records. The application utilizes a customized Vanilla CSS design system with HSL variables, glassmorphic layout elements, smooth CSS animations, and a mobile-responsive adaptive grid.

## 🚀 Setup & Run Instructions

Ensure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher recommended; v24.8.0 was used in development).

### 1. Install Dependencies
Clone the repository, navigate to the project directory, and install npm packages:
```bash
npm install
```

### 2. Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open your browser and navigate to the local URL (e.g. `http://localhost:5173`) displayed in the terminal.

### 3. Run Unit and Integration Tests
Execute the Vitest test suite to verify logical correctness and integration:
```bash
npm run test
```

### 4. Build for Production
Generate the compiled and optimized production assets in the `dist` directory:
```bash
npm run build
```

---

## 📁 Source Directory Structure

The source code is organized into modular directories following clean architecture guidelines:

```text
src/
├── assets/             # SVG/static visual assets
├── components/         # Modular React components
│   ├── __tests__/     # React testing files (App.test.tsx)
│   ├── DeleteConfirm  # Delete confirmation dialog modal
│   ├── FilterPopup    # Popover for advanced multi-field filtering
│   ├── Toast          # Toast container and notification alerts
│   ├── UserForm       # Add/Edit form validation modal
│   └── UserTable      # Responsive data grid with sorting controls
├── services/           # Service layer for network requests
│   └── api.ts         # JSONPlaceholder fetch requests with simulation fallback
├── styles/             # (Global stylesheet overrides)
├── types/              # Type definitions and interfaces
│   └── index.ts       # Shared TypeScript schemas
├── utils/              # Pure functions for mapping & validation
│   ├── __tests__/     # Test suites for utils
│   ├── mapping.ts     # Translates frontend/backend user representations
│   └── validation.ts  # Client-side input validation regex & checks
├── App.css             # Component-level styles, overlays, & mobile responsive layout
├── App.tsx             # Master page controller and state orchestrator
├── index.css           # Global resets, HSL theme colors, & scrollbar adjustments
├── main.tsx            # React application mount point
└── setupTests.ts       # Vitest setup incorporating @testing-library/jest-dom
```

---

## 💡 Technical Assumptions & Design Decoupling

### 1. Schema Mapping Layer (`src/utils/mapping.ts`)
JSONPlaceholder's `/users` endpoint does not natively support "First Name", "Last Name", or "Department". However, the project requirements specify these columns. We decoupled the backend representation from the frontend UI:
- **First Name & Last Name**: Decoupled from the backend's single `name` string by splitting it at the first whitespace. During creation or updates, these are rejoined to form a singular `name` field for the JSONPlaceholder API.
- **Department**: Decoupled from the backend's `company.name` field. During editing or posting, frontend `department` values are translated and sent nested under `company: { name: department }`.

### 2. Client-Side Simulation Fallbacks (`src/services/api.ts`)
JSONPlaceholder is a mock REST API. Operations like `POST`, `PUT`, or `DELETE` return simulated success responses but do not persist changes on their server.
Furthermore:
- Making a `PUT` or `DELETE` request for a user with ID > 10 (locally added users) results in an HTTP 404 from JSONPlaceholder.
- To prevent network failures from breaking the app, `src/services/api.ts` checks the User ID. For IDs `<= 10`, standard API calls are made. For IDs `> 10`, the service bypasses the API call, simulates a 300ms network delay, and resolves with a simulated response.
- The UI maintains a synchronized React state of active users, ensuring changes are immediately reflected in the table, pagination pages, and department statistics.

### 3. Pure Vanilla CSS Adaptive Grid
Rather than incorporating bulky CSS frameworks like Tailwind, the layout uses pure Vanilla CSS. The table layout dynamically refactors into interactive card items on viewports under 768px using CSS media queries and pseudo-element data labeling (`td::before`), preserving high UX standards on mobile screens.

---

## 🛠️ Developer Reflection & Key Challenges

### Challenges Faced
1. **JSONPlaceholder Local ID 404s**: Navigating the mock backend limitations was a major architectural decision. When a new user was added (returning ID 11), editing or deleting that same user caused the backend to throw 404. Decoupling the API service to detect ID indices (simulating network roundtrips for locally-created IDs) resolved this gracefully.
2. **Dynamic Multi-Field Filtering combined with Pagination**: Implementing pagination alongside multi-field filtering and global searches required careful coordination. If filters are applied, the current page must reset to `1` to avoid page-index out-of-bound errors. State changes are synchronized in `App.tsx` through computed React `useMemo` hooks.
3. **Vitest Mocking & Testing Double-Matches**: In testing, asserting the propagation of API connection errors created "multiple elements matched" exceptions. The test suite was refactored to verify warning logs using `getAllByText` to handle multiple instances of error logs appearing in both toast feeds and dashboard cards.

### Future Improvements (If Given More Time)
1. **Persistent LocalStorage**: Persist the local state changes in `localStorage` so that created, edited, and deleted users remain visible across browser page reloads.
2. **Custom Departments Dictionary**: Provide a dropdown for the department input field instead of a text field to avoid spelling inconsistencies (e.g. "HR" vs "Human Resources"), which affects filtering.
3. **Advanced Filter Logic Options**: Allow users to change filter operators (e.g., "Contains", "Starts with", "Exact Match") in the Filter Popup.
4. **Interactive Theme Toggle**: While the UI adapts to `prefers-color-scheme`, adding an explicit dark/light mode toggle switch on the header would improve manual personalization.
