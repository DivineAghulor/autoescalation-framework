# AutoScale - Incident Management Platform Frontend

A production-ready, AI-powered incident escalation platform frontend built with React, TypeScript, Vite, Tailwind CSS, and React Router.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5174/`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Card.tsx            # Card & StatCard components
│   ├── Badge.tsx           # Badge, StatusBadge, SeverityBadge
│   ├── Table.tsx           # Generic table component
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Topbar.tsx          # Top navigation bar
│   └── index.ts            # Component exports
├── layout/
│   ├── AppLayout.tsx       # Main layout wrapper
│   └── index.ts            # Layout exports
├── pages/                  # Page components
│   ├── Dashboard.tsx       # Home dashboard
│   ├── Issues.tsx          # Issues list with filters
│   ├── IssueDetail.tsx     # Issue detail page
│   ├── Report.tsx          # Report issue form
│   └── index.ts            # Page exports
├── services/               # API & services
│   ├── api.ts              # API service with TypeScript
│   └── index.ts            # Service exports
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
├── App.css                 # App-specific styles
└── index.css               # Global styles & Tailwind
```

## 🎨 Design System

### Colors
- **Background**: Dark mode (#0f0f10)
- **Glass panels**: White with opacity (5-10%)
- **Gradients**: Purple→Blue for primary, Blue→Cyan for accent
- **Text**: White (primary), Gray (secondary)

### Components
- **StatCard**: Display key metrics with trends
- **Badge**: Status, severity, and custom badges
- **Table**: Generic, reusable data table
- **Card**: Glass-styled container
- **Sidebar**: Fixed navigation
- **Topbar**: Search and profile

## 🛣️ Pages

### Dashboard (/)
- Key metrics (Active Issues, Resolved Today, Avg Resolution Time)
- Resolution timeline chart
- Team overview
- Quick actions
- Recent issues feed

### Issues (/issues)
- Filterable issue list
- Severity and status filters
- Search functionality
- Click to view details

### Issue Detail (/issues/:id)
- Full issue information
- SLA countdown timer
- Action buttons (Resolve, Extend, Comment)
- Activity timeline
- Status and escalation tracking

### Report Issue (/report)
- Form validation
- Product team selection
- Issue description textarea
- Multiple file upload
- FormData submission to API
- Loading/success/error states

## 🔌 API Integration

### Backend URL
```
https://autoescalation-framework-production.up.railway.app
```

### Endpoints

**GET /api/issues**
- Fetch all issues

**GET /api/issues/:id**
- Fetch single issue

**POST /api/issues**
- Create new issue (FormData with files)

**PATCH /api/issues/:id**
- Update issue status

## 🎯 Features

✅ **Responsive Design** - Mobile-first, works on all devices
✅ **Dark Mode** - Premium dark theme
✅ **Glass Morphism** - Modern glass-effect panels
✅ **Smooth Animations** - Hover effects and transitions
✅ **Type Safety** - Full TypeScript support
✅ **File Upload** - Multiple file attachment support
✅ **Real-time SLA** - Countdown timer for issue resolution
✅ **Activity Timeline** - Issue history tracking
✅ **Form Validation** - Client-side validation
✅ **Error Handling** - Graceful error states

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **PostCSS** - CSS processing

## 📦 Dependencies

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^6.20.0"
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Environment Variables
Create a `.env` file if needed:
```
VITE_API_URL=https://autoescalation-framework-production.up.railway.app
```

## 📝 Notes

- All data in issues list is mock data for demonstration
- SLA timer is simulated with local state
- File uploads use FormData for proper multipart encoding
- All components are fully typed with TypeScript
- Tailwind CSS provides responsive utilities
- PostCSS handles autoprefixing

## 🎨 Customization

### Update Brand Colors
Edit `tailwind.config.js` color palette

### Change API URL
Update the `API_BASE_URL` in `src/services/api.ts`

### Modify Layout
Adjust sidebar width in `Sidebar.tsx` and `AppLayout.tsx` margins

## 🐛 Troubleshooting

**Port already in use**
```bash
npm run dev -- --port 3000
```

**Clear cache**
```bash
rm -rf node_modules .vite
npm install
```

**Build errors**
```bash
npm run build
```

## 📞 Support

For issues or questions, check the main project documentation.
