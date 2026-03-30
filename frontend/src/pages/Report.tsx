import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { apiService } from '../services/api';

export const Report: React.FC = () => {
  const navigate = useNavigate();
  const [productTeam, setProductTeam] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const teams = [
    'Platform Team',
    'API Team',
    'Frontend Team',
    'DevOps Team',
    'Database Team',
    'Security Team',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('loading');
    setErrorMessage('');

    try {
      await apiService.reportIssue({
        productTeam,
        description,
        files: files.length > 0 ? files : undefined,
      });

      setSubmitState('success');
      setProductTeam('');
      setDescription('');
      setFiles([]);

      setTimeout(() => {
        navigate('/issues');
      }, 2000);
    } catch (error) {
      setSubmitState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit issue'
      );
      setTimeout(() => {
        setSubmitState('idle');
      }, 5000);
    }
  };

  return (
    <AppLayout title="Report Issue" showSearch={false}>
      <div className="max-w-2xl mx-auto space-y-6 animate-slideIn">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Report a New Issue</h1>
            <p className="text-neutral-600">
              Help us prioritize and resolve problems faster by providing detailed information.
            </p>
          </div>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Team */}
          <Card>
            <div>
              <label htmlFor="team" className="block text-sm font-semibold text-neutral-900 mb-3">
                Product Team <span className="text-red-500">*</span>
              </label>
              <select
                id="team"
                value={productTeam}
                onChange={(e) => setProductTeam(e.target.value)}
                required
                className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select a team
                </option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-2">
                Which team should handle this issue?
              </p>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-neutral-900 mb-3">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the issue in detail. Include steps to reproduce, expected behavior, and actual behavior."
                rows={6}
                className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 resize-none"
              />
              <p className="text-xs text-neutral-500 mt-2">
                {description.length} / 2000 characters
              </p>
            </div>
          </Card>

          {/* File Upload */}
          <Card>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Attachments
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    accept=".jpg,.jpeg,.png,.pdf,.txt,.csv,.json,.log"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                  >
                    <Icons.FileText className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        PNG, JPG, PDF, TXT, CSV, JSON, LOG (up to 10MB each)
                      </p>
                    </div>
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-neutral-700">
                      {files.length} file{files.length !== 1 ? 's' : ''} selected:
                    </p>
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200"
                      >
                        <div className="flex items-center gap-2">
                          <Icons.FileText className="w-4 h-4 text-primary-600" />
                          <div>
                            <p className="text-sm text-neutral-900 font-medium">{file.name}</p>
                            <p className="text-xs text-neutral-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Icons.XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Status Messages */}
          {submitState === 'success' && (
            <Card className="bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-3">
                <Icons.CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Issue submitted successfully!</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Redirecting to issues list...
                  </p>
                </div>
              </div>
            </Card>
          )}

          {submitState === 'error' && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <Icons.AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Failed to submit issue</p>
                  <p className="text-xs text-red-700 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitState === 'loading' || !productTeam || !description}
              className="flex-1 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-md-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitState === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">⟳</span>
                  Submitting...
                </span>
              ) : (
                'Submit Issue'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/issues')}
              className="flex-1 px-6 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-100 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Icons.AlertTriangle className="w-4 h-4" /> Pro Tips
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include screenshots or logs to help diagnose the issue faster</li>
              <li>• Provide step-by-step reproduction instructions</li>
              <li>• Specify the severity based on impact to users or business</li>
              <li>• Include any recent changes or deployments</li>
            </ul>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
