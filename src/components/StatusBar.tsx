import React from 'react';
import { Activity, Server, FileText, CheckCircle2, Clock } from 'lucide-react';
import { AuditLog } from '../types/asi';

interface StatusBarProps {
  scannerStatus: string;
  validatorStatus: string;
  gateEngineStatus: string;
  queueCompletionPercent: number;
  latestLog?: AuditLog;
  totalLogCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  scannerStatus,
  validatorStatus,
  gateEngineStatus,
  queueCompletionPercent,
  latestLog,
  totalLogCount
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dadce0] text-[#5f6368] text-xs px-4 py-2 z-40 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Module Statuses */}
      <div className="flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span className="text-[#202124] font-medium">Scanner:</span>
          <span className="font-mono text-[11px] text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#ceead6] font-semibold">
            {scannerStatus}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span className="text-[#202124] font-medium">Validator:</span>
          <span className="font-mono text-[11px] text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#ceead6] font-semibold">
            {validatorStatus}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span className="text-[#202124] font-medium">Gate Engine:</span>
          <span className="font-mono text-[11px] text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#ceead6] font-semibold">
            {gateEngineStatus}
          </span>
        </div>
      </div>

      {/* Latest Persisted Audit Log Ticker */}
      <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-2 bg-[#f8f9fa] px-3 py-1 rounded border border-[#dadce0] overflow-hidden">
        <Activity className="w-3.5 h-3.5 text-[#b06000] shrink-0 animate-pulse" />
        <span className="text-[11px] font-mono text-[#202124] truncate">
          {latestLog ? `[${latestLog.module}] ${latestLog.message}` : '日志服务已就绪 (云端物理保存)'}
        </span>
      </div>

      {/* Queue & Audit Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>队列完成度:</span>
          <span className="font-mono text-[#1a73e8] font-bold">{queueCompletionPercent}%</span>
        </div>

        <div className="bg-[#f1f3f4] text-[#202124] px-2.5 py-0.5 rounded text-[11px] font-mono border border-[#dadce0] font-medium">
          审计记录: {totalLogCount} 条 (云端物理保存)
        </div>
      </div>
    </footer>
  );
};
