import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Badge, SeverityBadge, StatusBadge } from '../components/Badge';
import { Icons } from '../components/Icons';

interface IssueRow {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

export const Issues: React.FC = () => {
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const mockIssues: IssueRow[] = [
    {
      id: '1',
      title: 'Database Connection Timeout',
      severity: 'critical',
      status: 'in-progress',
      createdAt: '2024-01-15 09:30 AM',
    },
    {
      id: '2',
      title: 'API Rate Limiting Issue',
      severity: 'high',
      status: 'open',
      createdAt: '2024-01-15 08:15 AM',
    },
    {
      id: '3',
      title: 'Memory Leak in Cache Service',
      severity: 'high',
      status: 'in-progress',
      createdAt: '2024-01-15 07:45 AM',
    },
    {
      id: '4',
      title: 'Slack Notification Delays',
      severity: 'medium',
      status: 'open',
      createdAt: '2024-01-14 04:20 PM',
    },
    {
      id: '5',
      title: 'Dashboard Performance Regression',
      severity: 'medium',
      status: 'resolved',
      createdAt: '2024-01-14 02:10 PM',
    },
    {
      id: '6',
      title: 'Email Template Formatting',
      severity: 'low',
      status: 'open',
      createdAt: '2024-01-14 10:30 AM',
    },
    {
      id: '7',
      title: 'Documentation Update Needed',
      severity: 'low',
      status: 'resolved',
      createdAt: '2024-01-13 03:15 PM',
    },
    {
      id: '8',
      title: 'SSL Certificate Expiration Check',
      severity: 'high',
      status: 'in-progress',
      createdAt: '2024-01-13 11:20 AM',
    },
  ];

  const filteredIssues = mockIssues.filter((issue) => {
    const severityMatch = filterSeverity === 'all' || issue.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
    return severityMatch && statusMatch;
  });

  const columns = [
    {
      key: 'title' as const,
      label: 'Title',
      width: '40%',
    },
    {
      key: 'severity' as const,
      label: 'Severity',
      width: '15%',
      render: (value: IssueRow['severity']) => (
        <SeverityBadge severity={value} />
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '15%',
      render: (value: IssueRow['status']) => (
        <StatusBadge status={value} />
      ),
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      width: '20%',
    },
  ];

  return (
    <AppLayout title="Issues">
      <div className="space-y-6 animate-slideIn">
        {/* Filters */}
        <Card className="bg-neutral-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Severity
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Issues Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Issues & Alerts</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Badge label={`Total: ${filteredIssues.length}`} />
          </div>
          <Table<IssueRow>
            data={filteredIssues}
            columns={columns}
            onRowClick={(row) => navigate(`/issues/${row.id}`)}
            emptyState={
              <div className="text-center py-12">
                <p className="text-neutral-500">No issues found</p>
              </div>
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
};
