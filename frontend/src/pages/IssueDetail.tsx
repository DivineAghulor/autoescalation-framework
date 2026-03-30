import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { Card } from '../components/Card';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import { Icons } from '../components/Icons';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export const IssueDetail: React.FC = () => {
  const { id: _issueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isResolving, setIsResolving] = useState(false);
  const [slaMinutesLeft, setSlaMinutesLeft] = useState(45);
  const [status, setStatus] = useState<'open' | 'in-progress' | 'resolved'>('in-progress');

  useEffect(() => {
    const interval = setInterval(() => {
      setSlaMinutesLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const auditLog: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-01-15 09:35 AM',
      action: 'Status Changed',
      actor: 'Sarah Chen',
      details: 'Changed from Open to In Progress',
    },
    {
      id: '2',
      timestamp: '2024-01-15 09:30 AM',
      action: 'Issue Created',
      actor: 'System',
      details: 'Issue reported by Platform Team',
    },
    {
      id: '3',
      timestamp: '2024-01-15 09:32 AM',
      action: 'Assignee Updated',
      actor: 'Manager Bot',
      details: 'Assigned to Database Team',
    },
    {
      id: '4',
      timestamp: '2024-01-15 09:33 AM',
      action: 'SLA Timer Started',
      actor: 'System',
      details: '60-minute SLA initiated',
    },
  ];

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('resolved');
    } finally {
      setIsResolving(false);
    }
  };

  const slaPercentage = (slaMinutesLeft / 60) * 100;
  const slaColor =
    slaPercentage > 50 ? 'text-emerald-600' : slaPercentage > 25 ? 'text-amber-600' : 'text-red-600';

  return (
    <AppLayout title="Issue Details">
      <div className="space-y-6 animate-slideIn">
        {/* Header */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-neutral-900 mb-3">
                  Database Connection Timeout
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <SeverityBadge severity="critical" />
                  <StatusBadge status={status} />
                  <span className="text-sm text-neutral-500">Issue #INCD-001</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/issues')}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <Icons.AlertCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Description</h2>
              <p className="text-neutral-600 leading-relaxed">
                The primary database connection is timing out intermittently, causing API requests
                to fail at random intervals. This issue began at approximately 09:15 AM UTC and
                affects approximately 15% of incoming traffic. The database instance is responsive
                when tested directly, suggesting a connection pool exhaustion or network issue.
              </p>
            </Card>

            {/* Key Details */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 font-semibold mb-2">Assigned To</p>
                  <p className="text-neutral-900">Database Team</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-semibold mb-2">Product Team</p>
                  <p className="text-neutral-900">Platform Team</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-semibold mb-2">Created By</p>
                  <p className="text-neutral-900">System</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-semibold mb-2">Created At</p>
                  <p className="text-neutral-900">2024-01-15 09:30 AM</p>
                </div>
              </div>
            </Card>

            {/* Audit Log */}
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {auditLog.map((log, idx) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary-400"></div>
                      {idx < auditLog.length - 1 && (
                        <div className="w-0.5 h-12 bg-neutral-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-neutral-900">{log.action}</p>
                        <span className="text-xs text-neutral-400">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{log.actor}</p>
                      {log.details && (
                        <p className="text-sm text-neutral-500 mt-2">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SLA Timer */}
            <Card>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">SLA Timer</h3>
              <div className="space-y-4">
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(slaPercentage / 100) * 440} 440`}
                      className={`transition-all duration-1000 ${slaColor}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-3xl font-bold ${slaColor}`}>{slaMinutesLeft}</p>
                    <p className="text-xs text-neutral-500">min left</p>
                  </div>
                </div>
                <p className="text-center text-xs text-neutral-500">
                  SLA: 60 minutes {slaPercentage > 0 ? '(ongoing)' : '(expired)'}
                </p>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleResolve}
                  disabled={isResolving || status === 'resolved'}
                  className="w-full px-4 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-md-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
                <button className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-all duration-200">
                  Extend Timer
                </button>
                <button className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-all duration-200">
                  Add Comment
                </button>
              </div>
            </Card>

            {/* Status Info */}
            <Card className="bg-neutral-50">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-neutral-600">Operations Team Notified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <span className="text-sm text-neutral-600">Slack Alert Sent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-neutral-600">Customer Email Queued</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
