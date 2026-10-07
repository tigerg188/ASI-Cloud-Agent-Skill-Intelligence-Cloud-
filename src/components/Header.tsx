import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  FileCode2, 
  CheckCircle2, 
  Terminal, 
  BarChart3, 
  Sparkles, 
  FolderGit2, 
  Layers,
  PlaySquare
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  taskProgress: number;
  taskStepName: string;
  selectedProjectId: string;
  gate1Status: 'PASSED' | 'FAILED' | 'NOT_RUN';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  taskProgress,
  taskStepName,
  selectedProjectId,
  gate1Status
}) => {
  const tabs = [
    { id: 'projects', label: '项目与导入管理', icon: FolderGit2 },
    { id: 'tasks', label: '任务执行与成果管理', icon: PlaySquare },
    { id: 'factModel', label: '项目事实模型', icon: Layers },
    { id: 'plugins', label: 'Agent Plugins 契约', icon: FileCode2 },
    { id: 'gate1', label: 'Gate 1 门控引擎', icon: ShieldCheck },
    { id: 'logs', label: '运行日志与时间线', icon: Terminal },
    { id: 'modelDashboard', label: '大模型看板', icon: BarChart3 },
    { id: 'geminiAssess', label: 'AI 推断评估', icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-[#dadce0] text-[#202124] sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a73e8] text-white p-2 rounded-lg font-bold flex items-center justify-center shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-[#202124] tracking-wide flex items-center gap-2">
                ASI-Cloud
                <span className="text-[#1a73e8] bg-[#e8f0fe] font-semibold text-xs px-2 py-0.5 rounded border border-[#aecbfa]">
                  v3.0 Google Web Edition
                </span>
              </h1>
              <span className="text-[11px] bg-[#f1f3f4] text-[#5f6368] px-2.5 py-0.5 rounded-full font-mono border border-[#dadce0]">
                Agent / Skill 智能适配与真实运行平台
              </span>
            </div>
            <p className="text-xs text-[#5f6368] hidden sm:block mt-0.5">
              外部 Agent/Skill 项目物理适配 • 宁可明确拒绝，也绝不虚假成功
            </p>
          </div>
        </div>

        {/* Project & Gate Status Pills */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="bg-[#f8f9fa] border border-[#dadce0] px-3 py-1.5 rounded-md flex items-center gap-2 shadow-xs">
            <span className="text-[#5f6368]">当前项目:</span>
            <span className="font-mono text-[#1a73e8] font-bold">{selectedProjectId || '未选择项目'}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 font-semibold shadow-xs ${
            gate1Status === 'PASSED' 
              ? 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
              : gate1Status === 'FAILED'
              ? 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]'
              : 'bg-[#f1f3f4] border-[#dadce0] text-[#5f6368]'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Gate 1: {gate1Status === 'PASSED' ? '准入通过' : gate1Status === 'FAILED' ? '拦截未通过' : '待测试'}</span>
          </div>
        </div>
      </div>

      {/* Main Task Execution Progress Bar (当前任务执行状态进度条) */}
      <div className="bg-[#f8f9fa] border-t border-[#dadce0] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] animate-pulse"></span>
            <span className="text-[#1a73e8] font-semibold truncate">任务进度: {taskStepName}</span>
          </div>
          <div className="flex-1 bg-[#e8eaed] h-2.5 rounded-full overflow-hidden border border-[#dadce0]">
            <div 
              className="bg-[#1a73e8] h-full transition-all duration-300 rounded-full"
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
          <span className="font-mono text-[#202124] font-bold w-12 text-right">{taskProgress}%</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar border-t border-[#dadce0]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-[#1a73e8] text-[#1a73e8] bg-[#e8f0fe]/40'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
