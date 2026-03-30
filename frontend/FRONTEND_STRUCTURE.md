# AutoScale Frontend - Complete File Structure

## New Files Created

### Configuration Files
- `tailwind.config.js` - Tailwind CSS configuration with custom colors and animations
- `postcss.config.js` - PostCSS configuration for Tailwind
- `.env.example` - Environment variables template (if needed)

### Component Files
```
src/components/
├── Card.tsx              - Card and StatCard components for containers
├── Badge.tsx             - Badge components (default, severity, status)
├── Table.tsx             - Generic, reusable table component with sorting
├── Sidebar.tsx           - Fixed navigation sidebar with active state
├── Topbar.tsx            - Top navigation with search and profile
└── index.ts              - Component barrel exports
```

### Layout Files
```
src/layout/
├── AppLayout.tsx         - Main app wrapper combining Sidebar + Topbar + content
└── index.ts              - Layout exports
```

### Page Files
```
src/pages/
├── Dashboard.tsx         - Home page with metrics, charts, team overview
├── Issues.tsx            - Issues list page with filters and table
├── IssueDetail.tsx       - Individual issue detail with SLA timer and timeline
├── Report.tsx            - Report issue form with file upload
└── index.ts              - Page exports
```

### Service Files
```
src/services/
├── api.ts                - TypeScript API service for backend communication
└── index.ts              - Service exports and type exports
```

### Style Files
- `src/App.css` - Application-specific CSS with animations
- `src/index.css` - Global styles with Tailwind directives

### Main Application Files
- `src/App.tsx` - React Router setup with all routes
- `src/main.tsx` - Application entry point
- `index.html` - HTML template

### Updated Files
- `package.json` - Added dependencies (Tailwind, PostCSS, React Router, etc.)
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript configuration

## File Purposes

### Components

**Card.tsx**
- `Card`: Glass-styled container with hover effects
- `StatCard`: Display metric with label, value, icon, and trend

**Badge.tsx**
- `Badge`: Customizable badge with severity/status variants
- `StatusBadge`: Auto-styled status badge
- `SeverityBadge`: Auto-colored severity badge

**Table.tsx**
- Generic table component for displaying data
- Supports custom render functions for columns
- Click handlers for rows
- Empty state support

**Sidebar.tsx**
- Fixed navigation with three items: Dashboard, Issues, Report
- Active state indication with gradient
- Platform status indicator

**Topbar.tsx**
- Search bar for issues (UI only)
- User profile section
- Responsive layout

### Layouts

**AppLayout.tsx**
- Combines Sidebar, Topbar, and main content area
- Proper spacing and z-indexing
- Reusable wrapper for all pages

### Pages

**Dashboard.tsx**
- StatCards for key metrics
- Resolution timeline chart (static data)
- Team overview grid
- Quick actions section
- Recent issues feed with filters

**Issues.tsx**
- Filterable issue list
- Severity and status dropdowns
- Search input
- Generic table with mock data
- Click rows to navigate to detail

**IssueDetail.tsx**
- Issue information display
- Severity and status badges
- SLA countdown timer (circular progress)
- Activity timeline with events
- Action buttons (Resolve, Extend, Comment)
- Escalation status indicators

**Report.tsx**
- Form with validation
- Team selection dropdown
- Description textarea with character count
- File upload with drag & drop
- File list display with sizes
- Submit button with loading state
- Success/error messages with auto-dismiss
- Tips section for users

### Services

**api.ts**
- Centralized API client
- TypeScript interfaces for Issue and ReportIssuePayload
- Methods: getIssues, getIssue, reportIssue, updateIssueStatus
- Error handling with console logging
- FormData support for file uploads

## Key Features Implemented

### UI/UX
- ✅ Dark theme with glass morphism panels
- ✅ Gradient accents (purple→blue, blue→cyan)
- ✅ Smooth hover animations (scale, opacity transitions)
- ✅ Responsive sidebar navigation
- ✅ Search functionality (UI)
- ✅ Filter dropdowns for severity and status
- ✅ Circular SLA countdown timer

### Functionality
- ✅ React Router navigation between 4 pages
- ✅ Issue list filtering by severity and status
- ✅ Click-through navigation to issue details
- ✅ Form submission with FormData and file upload
- ✅ Loading and success/error states
- ✅ Mock data throughout for demo
- ✅ Activity timeline with history items
- ✅ Team overview cards with stats

### Code Quality
- ✅ Full TypeScript support
- ✅ Type-safe API service
- ✅ Reusable components
- ✅ Component barrel exports
- ✅ Proper error handling
- ✅ ESLint configuration
- ✅ Production-ready build output

## Design Tokens

### Colors (Tailwind)
- Primary: Indigo (#6366f1) / Purple (#8b5cf6)
- Accent: Blue (#3b82f6) / Cyan (#06b6d4)
- Background: Dark (#0f0f10)
- Text: White / Gray spectrum

### Spacing & Sizing
- Border radius: 2xl (16px) for cards
- Padding: 6px scale (4, 6, 8, 12, 16, 24, 32px)
- Sidebar width: 256px (w-64)
- Topbar height: 64px (h-16)

### Animations
- Hover scale: 1.02 for buttons
- Transition duration: 200ms
- Keyframes: fadeIn, slideInLeft, slideInUp, pulse

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Visit http://localhost:5174

4. Navigate between pages using sidebar

5. Try reporting an issue (form connects to backend)

## API Integration

The frontend connects to:
```
https://autoescalation-framework-production.up.railway.app/api
```

Endpoints:
- POST /issues - Create new issue (used in Report page)
- GET /issues - List all issues
- GET /issues/:id - Get single issue
- PATCH /issues/:id - Update status

File uploads use FormData with multipart encoding.

## Build Output

Production build (`npm run build`) outputs to:
- `dist/index.html` - Main HTML
- `dist/assets/index-*.js` - JavaScript bundle (~243KB raw, ~75KB gzip)
- `dist/assets/index-*.css` - CSS bundle (~18KB raw, ~4.5KB gzip)

Total size: ~79KB gzipped (excellent performance)
