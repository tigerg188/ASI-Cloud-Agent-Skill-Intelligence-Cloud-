import React from 'react';
import { Gate1Report, Gate1CheckItem } from '../types/asi';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  Lock, 
  Hash, 
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface Gate1DashboardProps {
  report: Gate1Report | null;
  onRunGate1: () => Promise<void>;
  isLoading: boolean;
  selectedProjectId: string;
}

export const Gate1Dashboard: React.FC<Gate1DashboardProps> = ({
  report,
  onRunGate1,
  isLoading,
  selectedProjectId
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1a73e8]" />
              Gate 1：门控引擎与真实性审计
            </h2>
            {report && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                report.passedAll 
                  ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]' 
                  : 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]'
              }`}>
                {report.passedAll ? 'GATE 1 PASSED (准入通过)' : 'GATE 1 BLOCKED'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            Gate 1 不通过，严禁进入 Phase 2。系统必须严格验证真实项目事实，杜绝模型虚构证据。
          </p>
        </div>

        <button
          onClick={onRunGate1}
          disabled={isLoading}
          className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>测试审计运行中...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>重新执行 Gate 1 门控全量测试</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Card */}
      {report && (
        <div className="bg-white border border-[#dadce0] p-5 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 shadow-xs">
          <div>
            <div className="text-xs text-[#5f6368]">通过检查项</div>
            <div className="text-2xl font-bold font-mono text-[#202124] mt-1">
              <span className="text-[#137333]">{report.passedCount}</span> / {report.totalChecks}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#5f6368]">测试项目 ID</div>
            <div className="text-sm font-bold font-mono text-[#1a73e8] truncate mt-1">
              {report.projectId}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#5f6368]">提取文件样本</div>
            <div className="text-sm font-bold font-mono text-[#202124] mt-1">
              {report.verificationEvidence.scannedFileCount} 个文件
            </div>
          </div>

          <div>
            <div className="text-xs text-[#5f6368]">防伪散列指纹 (Trace Hash)</div>
            <div className="text-xs font-mono text-[#b06000] truncate mt-1">
              {report.verificationEvidence.traceabilityHash.substring(0, 16)}...
            </div>
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Gate 1 强制准入清单指标
          </h3>
          <span className="text-[11px] text-[#5f6368] font-mono">宁可明确拒绝，也绝不虚假成功</span>
        </div>

        <div className="divide-y divide-[#dadce0]">
          {report ? (
            report.checks.map((check) => (
              <div key={check.id} className="p-4 hover:bg-[#f8f9fa] transition-colors space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {check.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#c5221f] shrink-0" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                        <span>{check.title}</span>
                        <span className="text-[10px] font-mono bg-[#e8f0fe] text-[#1a73e8] px-1.5 py-0.5 rounded border border-[#aecbfa]">
                          {check.code}
                        </span>
                      </h4>
                      <p className="text-xs text-[#5f6368] mt-0.5">{check.description}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    check.passed ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'
                  }`}>
                    {check.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className="ml-8 bg-[#f8f9fa] p-3 rounded-lg border border-[#dadce0] text-xs font-mono space-y-1">
                  <div className="text-[#137333] font-semibold">{check.details}</div>
                  {check.evidenceHashes.length > 0 && (
                    <div className="text-[#5f6368] text-[11px] truncate">
                      证据哈希: {check.evidenceHashes.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#5f6368] text-xs">
              点击上方按钮执行 Gate 1 门控引擎全量自动化测试
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
