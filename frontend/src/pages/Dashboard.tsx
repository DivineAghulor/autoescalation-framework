import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { StatCard, Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Icons } from '../components/Icons';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeIssues: 14,
    resolvedToday: 8,
    avgResolutionTime: 45,
  });

  useEffect(() => {
    // Simulate data fetch delay
    const timer = setTimeout(() => {
      setStats({
        activeIssues: 14,
        resolvedToday: 8,
        avgResolutionTime: 45,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const teams = [
    { name: 'Platform Team', activeIssues: 5, avgTime: 32 },
    { name: 'API Team', activeIssues: 3, avgTime: 28 },
    { name: 'Frontend Team', activeIssues: 4, avgTime: 52 },
    { name: 'DevOps Team', activeIssues: 2, avgTime: 15 },
  ];

  const recentIssues = [
    { id: 1, title: 'Database Connection Timeout', severity: 'critical', status: 'in-progress' },
    { id: 2, title: 'API Rate Limiting Issue', severity: 'high', status: 'open' },
    { id: 3, title: 'Memory Leak in Cache', severity: 'high', status: 'in-progress' },
  ];

  return (
    <AppLayout title="Dashboard" showSearch={false}>
      <div className="space-y-8 animate-slideIn">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Active Issues"
            value={stats.activeIssues}
            icon={<Icons.AlertTriangle className="w-6 h-6 text-white" />}
            bgColor="purple"
            trend={{ value: 12, positive: false }}
          />
          <StatCard
            label="Resolved Today"
            value={stats.resolvedToday}
            icon={<Icons.CheckCircle className="w-6 h-6 text-white" />}
            bgColor="blue"
            trend={{ value: 24, positive: true }}
          />
          <StatCard
            label="Avg Resolution"
            value={`${stats.avgResolutionTime}m`}
            icon={<Icons.Hourglass className="w-6 h-6 text-white" />}
            bgColor="green"
            trend={{ value: 5, positive: true }}
          />
        </div>

        {/* Chart Preview */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Resolution Timeline</h3>
            <div className="h-64 flex items-end justify-around gap-2 p-4 bg-neutral-50 rounded-lg">
              {[65, 45, 50, 70, 55, 60, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-primary rounded-t-lg opacity-75 hover:opacity-100 transition-opacity duration-200"
                  style={{ height: `${height}%` }}
                  title={`${height}% resolved`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </Card>

        {/* Team Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams Card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Icons.Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Team Overview</h3>
            </div>
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{team.name}</p>
                    <p className="text-xs text-neutral-500">{team.activeIssues} active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">{team.avgTime}m</p>
                    <p className="text-xs text-neutral-500">avg time</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Icons.Plus className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/report')}
                className="w-full px-4 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-md-light transition-all duration-200 hover:scale-105"
              >
                Report New Issue
              </button>
              <button
                onClick={() => navigate('/issues')}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-all duration-200"
              >
                View All Issues
              </button>
              <button
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-all duration-200"
              >
                Export Report
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Issues</h3>
            <button
              onClick={() => navigate('/issues')}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
            >
              View All <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors duration-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{issue.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    label={issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    variant={issue.severity as any}
                    size="sm"
                  />
                  <Badge
                    label={issue.status === 'in-progress' ? 'In Progress' : 'Open'}
                    variant={issue.status === 'in-progress' ? 'warning' : 'info'}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
