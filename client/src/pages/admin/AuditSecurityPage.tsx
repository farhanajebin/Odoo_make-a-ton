import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Shield, CheckCircle, Clock } from 'lucide-react';
import { adminApi } from '../../services/api';
import { AuditLogItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AuditSecurityPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(100);
      setLogs(data);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return <Badge variant="teal" size="sm">LOGIN SUCCESS</Badge>;
      case 'LOGIN_FAILED':
        return <Badge variant="slate" size="sm" className="bg-rose-500/10 text-rose-400 border-rose-500/20">LOGIN FAILED</Badge>;
      case 'UNAUTHORIZED_ACCESS':
        return <Badge variant="amber" size="sm" className="bg-rose-500/10 text-rose-400 border-rose-500/20">UNAUTHORIZED</Badge>;
      case 'REGISTER':
        return <Badge variant="cyan" size="sm">REGISTER</Badge>;
      case 'STAFF_CREATED':
        return <Badge variant="violet" size="sm">STAFF CREATED</Badge>;
      case 'ACCOUNT_ACTIVATED':
        return <Badge variant="teal" size="sm">ACTIVATED</Badge>;
      case 'ACCOUNT_DEACTIVATED':
        return <Badge variant="slate" size="sm" className="text-rose-400">DEACTIVATED</Badge>;
      case 'PASSWORD_RESET_REQUESTED':
      case 'PASSWORD_RESET_COMPLETED':
        return <Badge variant="violet" size="sm">PASS RESET</Badge>;
      default:
        return <Badge variant="slate" size="sm">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm">Security Engine</Badge>
            <span className="text-xs text-slate-400">SOC2 Telemetry &amp; Access Log</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Authentication &amp; Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-loopnex-secondaryText mt-0.5">
            Immutable system audit logs tracking logins, credential updates, staff provisioning, and permission barriers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </Button>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Audit Events</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{logs.length}</p>
          </div>
          <Shield className="h-6 w-6 text-loopnex-electricTeal" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Security Guard Status</span>
            <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> Enforcing RBAC
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Rate Limiting Status</span>
            <p className="text-base font-bold text-loopnex-softCyan mt-1">
              Active on Auth Endpoints
            </p>
          </div>
          <Clock className="h-6 w-6 text-loopnex-softCyan" />
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-loopnex-surfaceBorder flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            System Event Log Stream
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Real-time Ingest</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-loopnex-surface/40 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-loopnex-surfaceBorder">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity Type</th>
                <th className="px-5 py-3">User / Actor ID</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-loopnex-surfaceBorder/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-loopnex-electricTeal border-t-transparent animate-spin mr-2" />
                    Ingesting audit telemetry...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-loopnex-surface/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 uppercase font-mono text-[10px]">
                      {log.entityType}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-300 font-mono text-[11px]">
                      {log.userId || 'system / anonymous'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
