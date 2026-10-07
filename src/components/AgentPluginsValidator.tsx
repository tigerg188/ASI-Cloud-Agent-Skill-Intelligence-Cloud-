import React from 'react';
import { FactModel } from '../types/asi';
import { 
  FileCode2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  Server, 
  ShieldCheck, 
  Terminal,
  ExternalLink
} from 'lucide-react';

interface AgentPluginsValidatorProps {
  factModel: FactModel | null;
}

export const AgentPluginsValidator: React.FC<AgentPluginsValidatorProps> = ({ factModel }) => {
  if (!factModel) {
    return (
      <div className="bg-white border border-[#dadce0] p-8 rounded-xl text-center text-[#5f6368] shadow-xs">
        请先选择并扫描项目，以执行 Agent Plugins 1.0 契约对齐校验。
      </div>
    );
  }

  const { pluginManifest, skills, mcp, packageBoundaryPassed, packageBoundaryErrors } = factModel;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-[#1a73e8]" />
            Agent Plugins 1.0.0 规范契约校验
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            校验插件根目录 plugin.json、skills/*/SKILL.md 声明规范与根目录 MCP 配置文件合法性。
          </p>
        </div>

        <a
          href="https://agentplugins.org"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#1a73e8] hover:underline flex items-center gap-1 font-mono font-semibold"
        >
          <span>Agent Plugins 1.0 Spec</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid of 3 core pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: plugin.json */}
        <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202124] font-mono">1. plugin.json (根配置文件)</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                pluginManifest.validationStatus === 'VALID'
                  ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                  : 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]'
              }`}>
                {pluginManifest.validationStatus === 'VALID' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                {pluginManifest.validationStatus}
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-[#202124]">
              <div><span className="text-[#5f6368]">Name:</span> <span className="font-mono font-bold text-[#1a73e8]">{pluginManifest.name || '未定义'}</span></div>
              <div><span className="text-[#5f6368]">Version:</span> <span className="font-mono">{pluginManifest.version || '未定义'}</span></div>
              <div><span className="text-[#5f6368]">Author:</span> <span className="font-mono">{pluginManifest.author || '未定义'}</span></div>
              <div><span className="text-[#5f6368]">Description:</span> <span className="text-[#3c4043] block mt-0.5">{pluginManifest.description || '无描述'}</span></div>
            </div>
          </div>

          {pluginManifest.errors.length > 0 && (
            <div className="bg-[#fce8e6] border border-[#fad2cf] p-2.5 rounded text-[11px] text-[#c5221f] space-y-1">
              <span className="font-bold">契约错误/提醒:</span>
              <ul className="list-disc list-inside">
                {pluginManifest.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Pillar 2: skills directory and SKILL.md */}
        <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202124] font-mono">2. skills/ 目录与 SKILL.md</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#e6f4ea] text-[#137333] border border-[#ceead6] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {skills.length} 个技能已对齐
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {skills.length > 0 ? (
                skills.map((s) => (
                  <div key={s.id} className="bg-[#f8f9fa] p-2.5 rounded border border-[#dadce0] text-xs">
                    <div className="font-bold text-[#1a73e8] font-mono">{s.name}</div>
                    <p className="text-[11px] text-[#5f6368] truncate">{s.skillMdPath}</p>
                    {s.hasReferences && (
                      <span className="text-[10px] text-[#b06000] bg-[#fef7e0] border border-[#feefc3] px-1.5 py-0.5 rounded mt-1 inline-block">
                        含 references ({s.referencesList.length} 个引证文件)
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#5f6368]">未找到符合 skills/*/SKILL.md 规范的技能。</div>
              )}
            </div>
          </div>
        </div>

        {/* Pillar 3: mcp.json */}
        <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202124] font-mono">3. MCP 配置文件 ({mcp.path})</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                mcp.exists 
                  ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                  : 'bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]'
              }`}>
                {mcp.exists ? '已找到 MCP 服务' : '未配置 MCP (可选)'}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {mcp.exists ? (
                mcp.servers.map((srv, idx) => (
                  <div key={idx} className="bg-[#f8f9fa] p-2.5 rounded border border-[#dadce0] font-mono">
                    <div className="text-[#137333] font-bold">{srv.name}</div>
                    <div className="text-[#5f6368] text-[11px] mt-0.5">
                      Command: {srv.command} {srv.args?.join(' ')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#5f6368]">
                  按 Agent Plugins 1.0 规范，mcp.json 为可选组件，缺失属于正常合法状态。
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Package Boundary Safety Inspection */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
            Package Boundary 安全校验 (路径越界审计)
          </h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            packageBoundaryPassed ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'
          }`}>
            {packageBoundaryPassed ? '边界安全校验通过' : '存在路径逃逸隐患'}
          </span>
        </div>

        <p className="text-xs text-[#5f6368]">
          Agent Plugins 1.0 规范要求包内路径绝对不能通过相对路径（如 ../../）或软链接逃逸离开插件根目录。
        </p>

        {packageBoundaryErrors.length > 0 ? (
          <div className="bg-[#fce8e6] border border-[#fad2cf] p-3 rounded text-xs text-[#c5221f] space-y-1 font-mono">
            {packageBoundaryErrors.map((err, i) => <div key={i}>• {err}</div>)}
          </div>
        ) : (
          <div className="bg-[#e6f4ea] p-3 rounded border border-[#ceead6] text-xs text-[#137333] font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>所有文件绝对路径经过 node fs.realpath 校验，完全收敛在插件根目录范围内。</span>
          </div>
        )}
      </div>
    </div>
  );
};
