import React, { useState } from 'react';
import { 
  FactModel, 
  DataSourceLevel, 
  FileItem, 
  DirectoryNode 
} from '../types/asi';
import { 
  Layers, 
  Folder, 
  FileCode, 
  Hash, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Code,
  FileText,
  Terminal,
  Cpu,
  AlertTriangle
} from 'lucide-react';

interface FactModelViewerProps {
  factModel: FactModel | null;
  isLoading: boolean;
}

export const FactModelViewer: React.FC<FactModelViewerProps> = ({
  factModel,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'files' | 'json'>('overview');
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-xl p-12 text-center text-[#5f6368] space-y-3 shadow-xs">
        <div className="w-8 h-8 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-[#202124]">Node.js 程序化物理文件系统遍历中...</p>
        <p className="text-xs">计算 SHA-256 哈希、Package Boundary 校验与 Fact Model 构建</p>
      </div>
    );
  }

  if (!factModel) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-xl p-8 text-center text-[#5f6368] shadow-xs">
        <AlertTriangle className="w-8 h-8 text-[#b06000] mx-auto mb-2" />
        <p className="text-sm text-[#202124] font-semibold">尚未载入或扫描项目</p>
        <p className="text-xs mt-1">请在“项目与导入管理”页面选择项目或导入 GitHub 仓库以建立 Fact Model。</p>
      </div>
    );
  }

  const renderTag = (level: DataSourceLevel) => {
    const map: Record<DataSourceLevel, { bg: string; text: string; border: string }> = {
      FACT: { bg: 'bg-[#e8f0fe]', text: 'text-[#1a73e8]', border: 'border-[#aecbfa]' },
      AUTHOR_EXPLICIT: { bg: 'bg-[#e6f4ea]', text: 'text-[#137333]', border: 'border-[#ceead6]' },
      USER_CONFIRMED: { bg: 'bg-[#fef7e0]', text: 'text-[#b06000]', border: 'border-[#feefc3]' },
      INFERENCE: { bg: 'bg-[#f3e8fd]', text: 'text-[#9334e6]', border: 'border-[#d7aefb]' },
      RUNTIME_RESULT: { bg: 'bg-[#e0f7fa]', text: 'text-[#007b83]', border: 'border-[#80deea]' },
      MODEL_ASSESSMENT: { bg: 'bg-[#fce8e6]', text: 'text-[#c5221f]', border: 'border-[#fad2cf]' },
    };
    const style = map[level] || map.FACT;
    return (
      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
        {level}
      </span>
    );
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(factModel, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTreeNode = (node: DirectoryNode, depth = 0) => {
    return (
      <div key={node.path} style={{ paddingLeft: `${depth * 16}px` }} className="py-1">
        <div className="flex items-center justify-between text-xs hover:bg-[#f1f3f4] px-2 py-1 rounded transition-colors group">
          <div className="flex items-center gap-2">
            {node.type === 'directory' ? (
              <Folder className="w-4 h-4 text-[#1a73e8] shrink-0" />
            ) : (
              <FileCode className="w-4 h-4 text-[#5f6368] shrink-0" />
            )}
            <span className={node.type === 'directory' ? 'font-bold text-[#202124]' : 'font-mono text-[#3c4043]'}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {node.sizeBytes !== undefined && (
              <span className="font-mono text-[11px] text-[#5f6368]">{node.sizeBytes} B</span>
            )}
            {node.hash && (
              <span className="font-mono text-[10px] text-[#70757a]">
                {node.hash.substring(0, 10)}...
              </span>
            )}
            {renderTag(node.source)}
          </div>
        </div>

        {node.children && node.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#202124]">{factModel.projectName}</h2>
            {renderTag('FACT')}
          </div>
          <p className="text-xs text-[#5f6368] font-mono mt-1">
            Project ID: {factModel.projectId} • Scanned at: {new Date(factModel.createdAt).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleCopyJson}
          className="px-3.5 py-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] border border-[#dadce0] text-xs font-semibold text-[#202124] rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '已复制 JSON' : '复制 Fact Model JSON'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5f6368]">
            <span>物理文件总数</span>
            {renderTag('FACT')}
          </div>
          <div className="text-xl font-bold font-mono text-[#202124]">{factModel.fileStats.totalFiles} 个</div>
          <p className="text-[11px] text-[#1a73e8]">容量: {(factModel.fileStats.totalSizeBytes / 1024).toFixed(1)} KB</p>
        </div>

        <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5f6368]">
            <span>Plugin 规范状态</span>
            {renderTag('AUTHOR_EXPLICIT')}
          </div>
          <div className={`text-base font-bold font-mono ${
            factModel.pluginManifest.validationStatus === 'VALID' ? 'text-[#137333]' : 'text-[#c5221f]'
          }`}>
            {factModel.pluginManifest.validationStatus}
          </div>
          <p className="text-[11px] text-[#5f6368]">Name: {factModel.pluginManifest.name || 'N/A'}</p>
        </div>

        <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5f6368]">
            <span>发现 Skills 数量</span>
            {renderTag('AUTHOR_EXPLICIT')}
          </div>
          <div className="text-xl font-bold font-mono text-[#137333]">{factModel.skills.length} 个</div>
          <p className="text-[11px] text-[#5f6368]">路径: skills/*/</p>
        </div>

        <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5f6368]">
            <span>Package Boundary 校验</span>
            {renderTag('FACT')}
          </div>
          <div className={`text-base font-bold font-mono ${
            factModel.packageBoundaryPassed ? 'text-[#137333]' : 'text-[#c5221f]'
          }`}>
            {factModel.packageBoundaryPassed ? 'PASSED (安全)' : 'FAILED (越界)'}
          </div>
          <p className="text-[11px] text-[#5f6368]">逃逸审计通过</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden shadow-xs">
        <div className="flex border-b border-[#dadce0] bg-[#f8f9fa] px-3 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'overview' ? 'bg-white text-[#1a73e8] border-t border-x border-[#dadce0]' : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            概览与候选入口
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'tree' ? 'bg-white text-[#1a73e8] border-t border-x border-[#dadce0]' : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            目录树 (Directory Tree)
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'files' ? 'bg-white text-[#1a73e8] border-t border-x border-[#dadce0]' : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            文件 Manifest & SHA-256
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'json' ? 'bg-white text-[#1a73e8] border-t border-x border-[#dadce0]' : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            原始 fact_model.json
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#202124] mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#1a73e8]" />
                  自动挖掘的候选运行入口 (Candidate Entries)
                  {renderTag('FACT')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {factModel.candidateEntries.length > 0 ? (
                    factModel.candidateEntries.map(entry => (
                      <span key={entry} className="font-mono text-xs bg-[#e8f0fe] text-[#1a73e8] px-2.5 py-1 rounded border border-[#aecbfa] font-semibold">
                        {entry}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#5f6368]">未找到标准入口文件</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#202124] mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#1a73e8]" />
                  解析依赖声明 (Dependencies)
                  {renderTag('AUTHOR_EXPLICIT')}
                </h4>
                <div className="space-y-2">
                  {factModel.dependencies.map((dep, idx) => (
                    <div key={idx} className="bg-[#f8f9fa] p-3 rounded-lg border border-[#dadce0] text-xs">
                      <div className="font-bold text-[#1a73e8]">{dep.language} ({dep.configFile})</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {dep.items.map(item => (
                          <span key={item} className="font-mono text-[11px] bg-white text-[#202124] px-2 py-0.5 rounded border border-[#dadce0]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0] font-mono max-h-96 overflow-y-auto">
              {renderTreeNode(factModel.directoryTree)}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#f8f9fa] text-[#5f6368] border-b border-[#dadce0]">
                  <tr>
                    <th className="p-2">文件路径</th>
                    <th className="p-2">类型</th>
                    <th className="p-2">大小 (Bytes)</th>
                    <th className="p-2">SHA-256 哈希散列</th>
                    <th className="p-2">数据来源</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dadce0]">
                  {factModel.filesManifest.map((f, i) => (
                    <tr key={i} className="hover:bg-[#f8f9fa]">
                      <td className="p-2 text-[#202124] font-bold">{f.path}</td>
                      <td className="p-2 text-[#5f6368]">{f.extension}</td>
                      <td className="p-2 text-[#3c4043]">{f.sizeBytes}</td>
                      <td className="p-2 text-[#1a73e8] text-[11px]">{f.hash}</td>
                      <td className="p-2">{renderTag(f.source)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'json' && (
            <pre className="bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0] font-mono text-xs text-[#137333] max-h-96 overflow-y-auto">
              {JSON.stringify(factModel, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
