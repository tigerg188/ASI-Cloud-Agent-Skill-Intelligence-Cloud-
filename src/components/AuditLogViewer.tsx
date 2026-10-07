import React, { useState } from 'react';
import { AuditLog } from '../types/asi';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Activity 
} from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
  onClearLogs: () => Promise<void>;
  onExportLogs: () => void;
  isLoading: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  onClearLogs,
  onExportLogs,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levelBadge = (level: AuditLog['level']) => {
    const map: Record<AuditLog['level'], { bg: string; text: string }> = {
      INFO: { bg: 'bg-[#e8f0fe] text-[#1a73e8]', text: 'INFO' },
      SCAN: { bg: 'bg-[#f3e8fd] text-[#9334e6]', text: 'SCAN' },
      EVIDENCE: { bg: 'bg-[#e0f7fa] text-[#007b83]', text: 'EVIDENCE' },
      GATE_CHECK: { bg: 'bg-[#e6f4ea] text-[#137333]', text: 'GATE_CHECK' },
      EXECUTION: { bg: 'bg-[#e8f0fe] text-[#1a73e8]', text: 'EXECUTION' },
      WARN: { bg: 'bg-[#fef7e0] text-[#b06000]', text: 'WARN' },
      ERROR: { bg: 'bg-[#fce8e6] text-[#c5221f]', text: 'ERROR' }
    };
    const style = map[level] || map.INFO;
    return (
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${style.bg}`}>
        {style.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#1a73e8]" />
            全方位全流程运行日志 (云端物理保存)
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            不得随浏览器刷新、重启而清空，已在服务器磁盘 audit_logs.json 中物理保存。内建完整时间线与性能监控审计记录。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportLogs}
            className="px-3.5 py-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] text-xs font-semibold text-[#202124] rounded-lg border border-[#dadce0] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出备份审计数据</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-1.5 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] text-xs font-semibold rounded-lg border border-[#fad2cf] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>手工清空重置</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#dadce0] p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#c5221f]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#202124]">确认重置清空持久化审计日志？</h3>
            </div>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              此操作将清空服务器物理保存的 audit_logs.json 审计日志文件。建议在重置前导出备份数据。
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-1.5 bg-[#f1f3f4] text-xs text-[#5f6368] rounded-lg hover:bg-[#e8eaed]"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  await onClearLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-1.5 bg-[#c5221f] text-xs text-white rounded-lg hover:bg-[#a50e0c] font-bold"
              >
                确认物理重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#dadce0] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#f8f9fa] px-3 py-1.5 rounded-lg border border-[#dadce0]">
          <Search className="w-4 h-4 text-[#5f6368]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索日志关键字、模块或句柄..."
            className="bg-transparent text-xs text-[#202124] outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-[#5f6368]" />
          <span className="text-[#5f6368]">级别过滤:</span>
          {['ALL', 'SCAN', 'EVIDENCE', 'GATE_CHECK', 'EXECUTION', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded font-mono font-semibold transition-colors ${
                selectedLevel === lvl
                  ? 'bg-[#1a73e8] text-white'
                  : 'bg-[#f1f3f4] text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden font-mono text-xs shadow-xs">
        <div className="p-3 bg-[#f8f9fa] border-b border-[#dadce0] text-[#5f6368] flex items-center justify-between font-sans">
          <span className="font-bold text-[#202124] text-xs">时间线审计追踪 ({filteredLogs.length} 条)</span>
          <span className="text-[11px]">按精确物理时间倒序显示</span>
        </div>

        <div className="divide-y divide-[#dadce0] max-h-[500px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-[#f8f9fa] transition-colors space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {levelBadge(log.level)}
                    <span className="text-[#1a73e8] font-bold">[{log.module}]</span>
                    <span className="text-[10px] text-[#70757a]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    {log.latencyMs !== undefined && (
                      <span className="text-[#b06000] bg-[#fef7e0] px-1.5 py-0.5 rounded border border-[#feefc3]">
                        耗时: {log.latencyMs} ms
                      </span>
                    )}
                    <span className="text-[#5f6368] bg-[#f1f3f4] px-1.5 py-0.5 rounded border border-[#dadce0]">
                      Source: {log.sourceTag}
                    </span>
                  </div>
                </div>

                <div className="text-[#202124] leading-relaxed pl-1 font-sans">{log.message}</div>

                {log.details && (
                  <pre className="text-[11px] text-[#137333] bg-[#f8f9fa] p-2 rounded border border-[#dadce0] overflow-x-auto mt-1 font-mono">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#5f6368]">没有匹配的审计日志记录</div>
          )}
        </div>
      </div>
    </div>
  );
};
