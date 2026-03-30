# Component API Reference

## Card Components

### Card
Glass-styled container for content.

```tsx
import { Card } from '@/components';

<Card 
  className="custom-class"
  onClick={() => console.log('clicked')}
  hover={true}
>
  Content here
</Card>
```

**Props:**
- `children` (ReactNode) - Content to display
- `className?` (string) - Additional CSS classes
- `onClick?` () => void - Click handler
- `hover?` (boolean) - Enable hover effects (default: true)

### StatCard
Display a metric with label, value, icon, and trend.

```tsx
import { StatCard } from '@/components';

<StatCard
  label="Active Issues"
  value={14}
  icon="⚠️"
  trend={{ value: 12, positive: false }}
/>
```

**Props:**
- `label` (string) - Metric label
- `value` (string | number) - Metric value
- `icon?` (ReactNode) - Icon to display
- `trend?` { value: number; positive: boolean } - Trend indicator
- `className?` (string) - Additional CSS classes

---

## Badge Components

### Badge
Customizable badge with multiple variants.

```tsx
import { Badge } from '@/components';

<Badge 
  label="Critical"
  variant="critical"
  size="md"
/>
```

**Props:**
- `label` (string) - Badge text
- `variant?` ('default' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'info')
- `size?` ('sm' | 'md')
- `className?` (string)

### StatusBadge
Auto-styled status badge.

```tsx
<StatusBadge status="in-progress" />
// Displays: "In Progress" with warning colors
```

**Props:**
- `status` ('open' | 'in-progress' | 'resolved' | 'pending' | 'blocked')
- `className?` (string)

### SeverityBadge
Auto-colored severity badge.

```tsx
<SeverityBadge severity="high" />
// Displays: "High" with orange colors
```

**Props:**
- `severity` ('critical' | 'high' | 'medium' | 'low')
- `className?` (string)

---

## Table Component

### Table
Generic, reusable table for displaying data.

```tsx
import { Table } from '@/components';

interface Issue {
  id: string;
  title: string;
  severity: string;
}

<Table
  data={issues}
  columns={[
    { 
      key: 'title', 
      label: 'Title',
      width: '50%'
    },
    { 
      key: 'severity',
      label: 'Severity',
      width: '20%',
      render: (value) => <SeverityBadge severity={value} />
    }
  ]}
  onRowClick={(row) => navigate(`/issues/${row.id}`)}
  emptyState={<p>No issues</p>}
/>
```

**Props:**
- `data` (T[]) - Array of items
- `columns` (Column<T>[]) - Column definitions
- `onRowClick?` (row: T) => void - Row click handler
- `className?` (string)
- `emptyState?` (ReactNode) - Empty state UI

**Column Type:**
```tsx
interface Column<T> {
  key: keyof T;              // Object key
  label: string;             // Column header
  render?: (value: any, row: T) => React.ReactNode;  // Custom render
  width?: string;            // CSS width
}
```

---

## Navigation Components

### Sidebar
Fixed navigation sidebar.

```tsx
import { Sidebar } from '@/components';

<Sidebar />
// Automatically uses React Router for navigation
// Shows active state for current route
```

**Features:**
- Three navigation items: Dashboard, Issues, Report
- Active state indication with gradient
- Platform status indicator
- Fixed positioning (w-64)

### Topbar
Top navigation bar with search and profile.

```tsx
import { Topbar } from '@/components';

<Topbar 
  title="Issues"
  showSearch={true}
/>
```

**Props:**
- `title?` (string) - Page title
- `showSearch?` (boolean) - Show search input (default: true)

---

## Layout Component

### AppLayout
Wrapper combining Sidebar, Topbar, and content area.

```tsx
import { AppLayout } from '@/layout';

<AppLayout 
  title="My Page"
  showSearch={false}
>
  <p>Page content here</p>
</AppLayout>
```

**Props:**
- `children` (ReactNode) - Page content
- `title?` (string) - Page title for topbar
- `showSearch?` (boolean) - Show search in topbar

---

## Services

### apiService
Centralized API client for backend communication.

```tsx
import { apiService } from '@/services';

// Get all issues
const issues = await apiService.getIssues();

// Get single issue
const issue = await apiService.getIssue('123');

// Report new issue
const newIssue = await apiService.reportIssue({
  productTeam: 'Platform Team',
  description: 'Issue description',
  files: [file1, file2]
});

// Update issue status
const updated = await apiService.updateIssueStatus('123', 'resolved');
```

**Methods:**
- `getIssues(): Promise<Issue[]>` - Get all issues
- `getIssue(id: string): Promise<Issue>` - Get single issue
- `reportIssue(payload: ReportIssuePayload): Promise<Issue>` - Create issue
- `updateIssueStatus(id: string, status: string): Promise<Issue>` - Update status

**Types:**
```tsx
interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  productTeam: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaMinutes: number;
  assignedTo?: string;
  tags?: string[];
}

interface ReportIssuePayload {
  productTeam: string;
  description: string;
  files?: File[];
}
```

---

## Pages

### Dashboard
Home page with metrics and overview.

```tsx
import { Dashboard } from '@/pages';

<Routes>
  <Route path="/" element={<Dashboard />} />
</Routes>
```

**Features:**
- StatCards for metrics
- Resolution timeline chart
- Team overview
- Quick actions
- Recent issues feed

### Issues
Issues list with filtering.

```tsx
import { Issues } from '@/pages';

<Routes>
  <Route path="/issues" element={<Issues />} />
</Routes>
```

**Features:**
- Severity filter
- Status filter
- Search
- Sortable table
- Click rows to view details

### IssueDetail
Individual issue detail page.

```tsx
import { IssueDetail } from '@/pages';

<Routes>
  <Route path="/issues/:id" element={<IssueDetail />} />
</Routes>
```

**Features:**
- Issue information
- SLA countdown timer
- Activity timeline
- Action buttons
- Status indicators

### Report
Report new issue form.

```tsx
import { Report } from '@/pages';

<Routes>
  <Route path="/report" element={<Report />} />
</Routes>
```

**Features:**
- Form validation
- Team selection
- File upload
- Loading/success/error states

---

## Styling with Tailwind

### Glass Effects
```tsx
// Glass panel
className="bg-glass-light backdrop-blur-glass border border-white/10"

// Glass hover
className="hover:bg-glass-light hover:border-white/20"
```

### Gradients
```tsx
// Primary gradient
className="bg-gradient-primary text-white"

// Accent gradient
className="bg-gradient-accent text-white"
```

### Animations
```tsx
// Slide in animation
className="animate-slideIn"

// With custom transitions
className="transition-all duration-200 hover:scale-105"
```

### Responsive
```tsx
// Mobile-first
className="md:flex lg:grid"

// Breakpoints
className="px-4 md:px-8 lg:px-12"
```

---

## Custom Hooks (Available)

```tsx
// Use navigation
const navigate = useNavigate();
navigate('/issues');

// Use route params
const { id } = useParams<{ id: string }>();

// Use location
const location = useLocation();
```

---

## Examples

### Complete Page Example
```tsx
import React from 'react';
import { AppLayout } from '@/layout';
import { Card, StatCard } from '@/components';
import { apiService } from '@/services';

export const MyPage: React.FC = () => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    apiService.getIssues().then(setData);
  }, []);

  return (
    <AppLayout title="My Page">
      <StatCard 
        label="Total Issues"
        value={data?.length || 0}
        icon="⚠️"
      />
      <Card className="mt-6">
        <p>Content here</p>
      </Card>
    </AppLayout>
  );
};
```

### Form with File Upload Example
```tsx
const [files, setFiles] = React.useState<File[]>([]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    setFiles(Array.from(e.target.files));
  }
};

return (
  <input
    type="file"
    multiple
    onChange={handleFileChange}
    accept=".pdf,.txt,.csv"
  />
);
```

### API Call with Error Handling
```tsx
const [loading, setLoading] = React.useState(false);
const [error, setError] = React.useState('');

const handleSubmit = async () => {
  setLoading(true);
  setError('');
  
  try {
    await apiService.reportIssue({
      productTeam: 'Platform',
      description: 'Issue'
    });
    // Success
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error');
  } finally {
    setLoading(false);
  }
};
```
