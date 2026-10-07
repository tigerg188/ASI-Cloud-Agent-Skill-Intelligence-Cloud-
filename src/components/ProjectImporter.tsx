import React, { useState } from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ProjectImporterProps {
  onSelectProject: (projectId: string) => void;
  onImportGithub: (url: string) => Promise<void>;
  onImportZip: (file: File) => Promise<void>;
  isLoading: boolean;
  activeProjectId: string;
}

export const ProjectImporter: React.FC<ProjectImporterProps> = ({
  onSelectProject,
  onImportGithub,
  onImportZip,
  isLoading,
  activeProjectId
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const benchmarkProjects = [
    {
      id: 'agent-plugins-example',
      name: 'Agent Plugins Example',
      repo: 'agentplugins/agent-plugins-example',
      badge: 'Agent Plugins 1.0.0 参考项目',
      description: '包含根 plugin.json、skills/migrate-agent-plugin/SKILL.md 与 mcp.json，是 Phase 1 标准对齐第一基准。',
      tags: ['plugin.json', 'SKILL.md', 'mcp.json', 'references']
    },
    {
      id: 'browser-use',
      name: 'Browser Use',
      repo: 'browser-use/browser-use',
      badge: '大型 Agent 项目',
      description: '包含 Python pyproject.toml、browser_use/ 核心模块、skills、scripts、tests、server.json 与 Dockerfile。',
      tags: ['pyproject.toml', 'server.json (MCP)', 'skills/', 'Dockerfile']
    },
    {
      id: 'open-webui',
      name: 'Open WebUI',
      repo: 'open-webui/open-webui',
      badge: '大型 Web/AI 应用项目',
      description: '包含前端 Svelte/Node package.json、Python 后端、多组件结构与服务入口，测试广度解析能力。',
      tags: ['package.json', 'pyproject.toml', 'src/', 'backend/', 'docker-compose']
    }
  ];

  const handleGithubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      onImportGithub(githubUrl.trim());
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImportZip(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-[#1e1f20] border border-[#2d2e31] p-5 rounded-xl text-[#e8eaed] shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#1a73e8]/20 border border-[#1a73e8]/40 rounded-lg text-[#8ab4f8]">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Phase 1：项目事实扫描与 Agent Plugins 1.0 契约对齐
            </h2>
            <p className="text-xs text-[#9aa0a6] mt-1 leading-relaxed">
              ASI-Cloud 第一层核心能力：准确知道一个外部 Agent/Skill 项目“实际上有什么”。
              项目结构、文件数量、组件路径完全来自 <span className="text-[#8ab4f8] font-semibold"> Node.js 纯程序化文件系统扫描</span>，
              严格遵守 <span className="text-[#f28b82] font-semibold">铁律一：模型不能制造事实</span>。
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Sample Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fdd663]" />
            第一阶段开源测试项目基准 (1-Click 测试驱动)
          </h3>
          <span className="text-xs text-[#9aa0a6]">点击即可载入并自动启动 Node.js 物理文件遍历</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benchmarkProjects.map((proj) => {
            const isSelected = activeProjectId === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1a73e8]/10 border-[#1a73e8] shadow-md ring-1 ring-[#1a73e8]'
                    : 'bg-[#1e1f20] border-[#2d2e31] hover:border-[#3c4043] hover:bg-[#282a2d]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#282a2d] text-[#8ab4f8] border border-[#3c4043]">
                      {proj.badge}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-[#81c995] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 当前载入
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white">{proj.name}</h4>
                  <p className="text-xs font-mono text-[#9aa0a6] mt-0.5">{proj.repo}</p>
                  <p className="text-xs text-[#bdc1c6] mt-2 leading-normal">{proj.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2d2e31]">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {proj.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono bg-[#131314] text-[#e8eaed] px-1.5 py-0.5 rounded border border-[#3c4043]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    disabled={isLoading}
                    className={`w-full py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-[#1a73e8] text-white hover:bg-[#185abc]'
                        : 'bg-[#282a2d] text-[#e8eaed] hover:bg-[#3c4043] border border-[#3c4043]'
                    }`}
                  >
                    {isLoading && isSelected ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>扫描中...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isSelected ? '重新物理扫描' : '载入此基准项目'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GitHub URL & ZIP Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Import */}
        <div className="bg-[#1e1f20] border border-[#2d2e31] p-5 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#8ab4f8]" />
            导入任意 GitHub 仓库 (URL)
          </h3>
          <p className="text-xs text-[#9aa0a6]">
            输入 GitHub 仓库地址，ASI-Cloud 将自动建立物理本地节点并触发扫描。
          </p>

          <form onSubmit={handleGithubSubmit} className="space-y-2">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/agentplugins/agent-plugins-example"
              className="w-full bg-[#131314] border border-[#3c4043] focus:border-[#1a73e8] text-xs text-[#e8eaed] p-2.5 rounded-lg font-mono outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !githubUrl.trim()}
              className="w-full py-2 bg-[#1a73e8] hover:bg-[#185abc] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>导入并建立 Fact Model</span>
            </button>
          </form>
        </div>

        {/* ZIP Upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all ${
            dragActive 
              ? 'border-[#1a73e8] bg-[#1a73e8]/10' 
              : 'border-[#3c4043] bg-[#1e1f20] hover:border-[#5f6368]'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-[#8ab4f8] mb-2" />
          <h3 className="text-sm font-bold text-white">ZIP 压缩包直接上传</h3>
          <p className="text-xs text-[#9aa0a6] mt-1">
            拖拽或点击上传本地 Agent / Skill 项目 ZIP 文件
          </p>

          <label className="mt-3 inline-block px-4 py-1.5 bg-[#282a2d] hover:bg-[#3c4043] text-xs font-semibold text-[#e8eaed] rounded-lg border border-[#3c4043] cursor-pointer transition-colors">
            选择 ZIP 文件
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImportZip(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
