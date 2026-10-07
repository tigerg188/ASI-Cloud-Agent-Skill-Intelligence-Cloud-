import React, { useState } from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Check, 
  FolderPlus, 
  ArrowRight,
  Folder,
  Layers,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ProjectManagerProps {
  projects: any[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, description: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onImportGithub: (url: string) => Promise<void>;
  onImportZip: (file: File) => Promise<void>;
  isLoading: boolean;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onImportGithub,
  onImportZip,
  isLoading
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleGithubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      onImportGithub(githubUrl.trim());
      setGithubUrl('');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjName.trim()) {
      await onCreateProject(newProjName.trim(), newProjDesc.trim());
      setNewProjName('');
      setNewProjDesc('');
      setShowCreateModal(false);
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
      {/* Intro Header */}
      <div className="bg-white border border-[#dadce0] p-6 rounded-xl text-[#202124] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#1a73e8]" />
            项目与事实结构中心 (Project & Fact Registry)
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            选择项目以载入对应的物理事实模型（Fact Model）。系统预设的 4 个基准项目名称只读固定，不可删除。
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新建自定义 Agent/Skill 项目</span>
        </button>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#dadce0] p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#1a73e8]">
              <FolderPlus className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#202124]">新建 Agent/Skill 项目</h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#3c4043] block mb-1">项目标识 / 名称 (只读创建)</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="my-custom-plugin"
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] text-xs text-[#202124] p-2.5 rounded-lg outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3c4043] block mb-1">项目描述说明</label>
                <textarea
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="此项目的核心功能与任务适配目标..."
                  rows={3}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] text-xs text-[#202124] p-2.5 rounded-lg outline-none resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#f1f3f4] text-xs font-semibold text-[#5f6368] rounded-lg hover:bg-[#e8eaed]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a73e8] text-xs font-semibold text-white rounded-lg hover:bg-[#1557b0]"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub & ZIP Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Import */}
        <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#1a73e8]" />
            导入 GitHub 仓库 (URL)
          </h3>
          <p className="text-xs text-[#5f6368]">
            输入 GitHub 仓库地址，ASI-Cloud 将自动建立物理文件节点并进行格式扫描。
          </p>

          <form onSubmit={handleGithubSubmit} className="space-y-2">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/agentplugins/agent-plugins-example"
              className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] text-xs text-[#202124] p-2.5 rounded-lg font-mono outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !githubUrl.trim()}
              className="w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
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
              ? 'border-[#1a73e8] bg-[#e8f0fe]' 
              : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-[#1a73e8] mb-2" />
          <h3 className="text-sm font-bold text-[#202124]">ZIP 项目压缩包上传</h3>
          <p className="text-xs text-[#5f6368] mt-1">
            拖拽或点击上传本地 Agent / Skill 项目 ZIP 文件
          </p>

          <label className="mt-3 inline-block px-4 py-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-xs font-semibold text-[#202124] rounded-lg border border-[#dadce0] cursor-pointer transition-colors shadow-xs">
            选择本地 ZIP 文件
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

      {/* Projects List Section */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1a73e8]" />
            项目列表 ({projects.length} 个)
          </h3>
          <span className="text-[11px] text-[#5f6368]">点击卡片即可切换为当前物理激活项目</span>
        </div>

        <div className="divide-y divide-[#dadce0]">
          {projects.length > 0 ? (
            projects.map((proj) => {
              const isSelected = activeProjectId === proj.id;
              const summary = proj.factModelSummary;
              const isProtected = proj.isProtected;

              return (
                <div
                  key={proj.id}
                  className={`p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-[#e8f0fe]/50 border-l-4 border-l-[#1a73e8]' : 'hover:bg-[#f8f9fa]'
                  }`}
                >
                  <div 
                    onClick={() => onSelectProject(proj.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-[220px]"
                  >
                    <Folder className={`w-5 h-5 ${isSelected ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        {/* Name is fixed, read-only font-bold text */}
                        <h4 className="font-bold text-sm text-[#202124] select-text">{proj.name}</h4>

                        {isSelected && (
                          <span className="text-[10px] bg-[#1a73e8] text-white px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            当前激活
                          </span>
                        )}

                        {isProtected && (
                          <span className="text-[10px] bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#1a73e8]" />
                            预设基准项目 (只读受保护)
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[#5f6368] mt-0.5">ID: {proj.id}</p>
                    </div>
                  </div>

                  {summary && (
                    <div className="flex items-center gap-2 text-xs text-[#5f6368] font-mono">
                      <span className="bg-[#f1f3f4] px-2.5 py-1 rounded border border-[#dadce0]">
                        文件: {summary.totalFiles} 个
                      </span>
                      <span className="bg-[#f1f3f4] px-2.5 py-1 rounded border border-[#dadce0]">
                        Skills: {summary.skillsCount} 个
                      </span>
                    </div>
                  )}

                  {/* Actions Column: No Trash Icon for Protected Projects, and Button is "选择激活" / "当前激活" */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      disabled={isLoading}
                      className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isSelected 
                          ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]' 
                          : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-xs'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>当前激活</span>
                        </>
                      ) : (
                        <>
                          <span>选择激活项目</span>
                        </>
                      )}
                    </button>

                    {/* Trash Button strictly hidden/disabled for protected benchmark projects */}
                    {!isProtected && (
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] rounded text-xs font-semibold border border-[#fad2cf] transition-colors"
                        title="删除自定义项目"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#5f6368] text-xs">
              暂无项目。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
