import React, { useState } from 'react';
import { TaskItem, TaskNode, TaskArtifact, ExportFormat, TaskInputFile } from '../types/asi';
import { exportArtifactToFile } from '../utils/exportArtifacts';
import { 
  PlaySquare, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCode, 
  Send, 
  Plus, 
  Layers,
  FileCheck,
  CheckSquare,
  Square,
  Archive
} from 'lucide-react';

interface TaskExecutionManagerProps {
  tasks: TaskItem[];
  selectedProjectId: string;
  onCreateTask: (title: string, userInstruction: string, inputFiles: TaskInputFile[]) => Promise<void>;
  onExecuteTask: (taskId: string) => Promise<void>;
  onPauseTask: (taskId: string) => Promise<void>;
  onRollbackTask: (taskId: string, targetNodeIndex: number) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  isLoading: boolean;
}

export const TaskExecutionManager: React.FC<TaskExecutionManagerProps> = ({
  tasks,
  selectedProjectId,
  onCreateTask,
  onExecuteTask,
  onPauseTask,
  onRollbackTask,
  onDeleteTask,
  isLoading
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [userInstruction, setUserInstruction] = useState('');
  const [inputFiles, setInputFiles] = useState<TaskInputFile[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(tasks[0] || null);

  // Batch Export Checkbox State
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);
  const [batchFormat, setBatchFormat] = useState<string>('md');
  const [isExportingBatch, setIsExportingBatch] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const contentText = event.target?.result as string;
          setInputFiles(prev => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              sizeBytes: file.size,
              type: file.type || 'text/plain',
              contentText: contentText ? contentText.substring(0, 1000) : '',
              uploadedAt: new Date().toISOString()
            }
          ]);
        };
        reader.readAsText(file);
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInstruction.trim()) {
      await onCreateTask(taskTitle.trim() || '通用技能适配运行任务', userInstruction.trim(), inputFiles);
      setTaskTitle('');
      setUserInstruction('');
      setInputFiles([]);
      setShowCreateModal(false);
    }
  };

  const handleToggleTaskCheck = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    if (checkedTaskIds.length === tasks.length) {
      setCheckedTaskIds([]);
    } else {
      setCheckedTaskIds(tasks.map(t => t.id));
    }
  };

  const handleBatchExportZip = async () => {
    if (checkedTaskIds.length === 0) return;
    setIsExportingBatch(true);

    try {
      const res = await fetch('/api/tasks/batch-export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          taskIds: checkedTaskIds,
          preferredFormat: batchFormat
        })
      });

      const data = await res.json();
      if (data.zipBase64) {
        const link = document.createElement('a');
        link.href = data.zipBase64;
        link.download = data.filename || `batch_artifacts_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert('批量导出失败: ' + err);
    } finally {
      setIsExportingBatch(false);
    }
  };

  const activeTask = selectedTask ? (tasks.find(t => t.id === selectedTask.id) || tasks[0] || null) : (tasks[0] || null);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-[#dadce0] p-6 rounded-xl text-[#202124] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <PlaySquare className="w-5 h-5 text-[#1a73e8]" />
            任务指令执行与成果管理中心 (Task Execution & Artifact Hub)
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            输入用户指令、上传输入数据文件、执行任务节点、进行勾选批量打包导出（ZIP 压缩包）。
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新建任务指令与节点流程</span>
        </button>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#dadce0] p-6 rounded-xl max-w-xl w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#1a73e8]">
              <Send className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#202124]">新建运行任务与输入指令</h3>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#3c4043] block mb-1">任务名称</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="例如：Agent 插件迁移评估与成果生成"
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] text-xs text-[#202124] p-2.5 rounded-lg outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3c4043] block mb-1">
                  用户指令输入窗口 (User Command Instruction Window) *
                </label>
                <textarea
                  value={userInstruction}
                  onChange={(e) => setUserInstruction(e.target.value)}
                  placeholder="请输入对 Agent/Skill 项目的具体调优、推理或适配目标指令..."
                  rows={4}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] text-xs text-[#202124] p-3 rounded-lg outline-none resize-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3c4043] block mb-1">
                  用户附件文件上传 (User Input Files)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-xs font-semibold text-[#202124] rounded-lg border border-[#dadce0] cursor-pointer flex items-center gap-2 shadow-xs">
                    <Upload className="w-4 h-4 text-[#1a73e8]" />
                    <span>上传任务参考文件 (TXT, CSV, PDF, MD)</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <span className="text-xs text-[#5f6368]">已选择 {inputFiles.length} 个文件</span>
                </div>

                {inputFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {inputFiles.map(f => (
                      <div key={f.id} className="text-[11px] font-mono text-[#1a73e8] bg-[#e8f0fe] p-1.5 rounded flex justify-between items-center">
                        <span>• {f.name} ({(f.sizeBytes / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="px-5 py-2 bg-[#1a73e8] text-xs font-semibold text-white rounded-lg hover:bg-[#1557b0]"
                >
                  确认新建任务
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Execution Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List Column with Checkboxes & Batch Export Bar */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-2">
              <span>项目任务队列 ({tasks.length})</span>
            </h3>

            {tasks.length > 0 && (
              <button
                onClick={handleSelectAllTasks}
                className="text-[11px] text-[#1a73e8] hover:underline font-semibold flex items-center gap-1"
              >
                {checkedTaskIds.length === tasks.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>{checkedTaskIds.length === tasks.length ? '取消全选' : '全选'}</span>
              </button>
            )}
          </div>

          {/* Batch Export Bar (批量导出压缩包控制栏) */}
          {checkedTaskIds.length > 0 && (
            <div className="bg-[#e8f0fe] border border-[#aecbfa] p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-[#1a73e8] font-bold">
                <span>已勾选 {checkedTaskIds.length} 个任务</span>
                <select
                  value={batchFormat}
                  onChange={(e) => setBatchFormat(e.target.value)}
                  className="bg-white text-[11px] text-[#202124] border border-[#dadce0] px-2 py-0.5 rounded outline-none font-mono"
                >
                  <option value="md">Markdown (.md)</option>
                  <option value="doc">Word (.doc)</option>
                  <option value="txt">TXT (.txt)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>

              <button
                onClick={handleBatchExportZip}
                disabled={isExportingBatch}
                className="w-full py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{isExportingBatch ? '打包压缩中...' : '批量合并导出为 ZIP 压缩包'}</span>
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {tasks.length > 0 ? (
              tasks.map(t => {
                const isSelected = activeTask?.id === t.id;
                const isChecked = checkedTaskIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected ? 'bg-[#e8f0fe] border-[#1a73e8]' : 'bg-[#f8f9fa] border-[#dadce0] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    <button
                      onClick={(e) => handleToggleTaskCheck(t.id, e)}
                      className="mt-0.5 text-[#1a73e8] hover:scale-110 transition-transform shrink-0"
                    >
                      {isChecked ? <CheckSquare className="w-4 h-4 fill-current text-[#1a73e8]" /> : <Square className="w-4 h-4 text-[#70757a]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-[#202124] truncate">{t.title}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          t.status === 'VERIFIED' ? 'bg-[#e6f4ea] text-[#137333]' :
                          t.status === 'RUNNING' ? 'bg-[#e8f0fe] text-[#1a73e8]' :
                          t.status === 'PAUSED' ? 'bg-[#fef7e0] text-[#b06000]' : 'bg-[#f1f3f4] text-[#5f6368]'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5f6368] mt-1 line-clamp-2">{t.userInstruction}</p>
                      <div className="text-[10px] text-[#70757a] mt-2 font-mono flex justify-between">
                        <span>成果: {t.artifacts.length} 个</span>
                        <span>{new Date(t.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-[#5f6368] text-xs">
                当前项目暂无任务，点击“新建任务指令”开始运行。
              </div>
            )}
          </div>
        </div>

        {/* Selected Task Execution Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {activeTask ? (
            <>
              {/* Task Header & Controls */}
              <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dadce0] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                      <span>{activeTask.title}</span>
                      <span className="text-xs font-mono bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded">
                        {activeTask.status}
                      </span>
                    </h3>
                    <p className="text-xs text-[#5f6368] mt-0.5 font-mono">ID: {activeTask.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTask.status !== 'RUNNING' && (
                      <button
                        onClick={() => onExecuteTask(activeTask.id)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>项目运行 / 执行</span>
                      </button>
                    )}

                    {activeTask.status === 'RUNNING' && (
                      <button
                        onClick={() => onPauseTask(activeTask.id)}
                        className="px-3.5 py-1.5 bg-[#fef7e0] hover:bg-[#feefc3] text-[#b06000] text-xs font-semibold rounded-lg border border-[#fce8e6] flex items-center gap-1.5 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>暂停执行</span>
                      </button>
                    )}

                    <button
                      onClick={() => onRollbackTask(activeTask.id, 1)}
                      className="px-3 py-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] text-xs font-semibold rounded-lg border border-[#dadce0] flex items-center gap-1 transition-colors"
                      title="回滚到初始节点 1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>回滚</span>
                    </button>

                    <button
                      onClick={() => onDeleteTask(activeTask.id)}
                      className="p-1.5 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] text-xs font-semibold rounded-lg border border-[#fad2cf] transition-colors"
                      title="删除任务"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#f8f9fa] p-3 rounded-lg border border-[#dadce0]">
                  <div className="text-xs font-bold text-[#3c4043] mb-1">用户表达指令:</div>
                  <p className="text-xs text-[#202124] leading-relaxed font-sans">{activeTask.userInstruction}</p>
                </div>

                {/* Nodes Execution Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1a73e8]" />
                    任务节点流程与推导状态 (Nodes Workflow)
                  </h4>

                  <div className="space-y-2">
                    {activeTask.nodes.map(node => (
                      <div key={node.id} className="bg-[#f8f9fa] border border-[#dadce0] p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-[#202124]">
                            <span className="w-5 h-5 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-[11px] flex items-center justify-center">
                              {node.nodeIndex}
                            </span>
                            <span>{node.title}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            node.status === 'VERIFIED' ? 'bg-[#e6f4ea] text-[#137333]' :
                            node.status === 'RUNNING' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'
                          }`}>
                            {node.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#5f6368]">{node.description}</p>

                        {node.outputArtifactText && (
                          <div className="bg-white p-3 rounded border border-[#dadce0] text-xs text-[#202124] font-mono leading-relaxed max-h-40 overflow-y-auto">
                            {node.outputArtifactText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Artifact Export Hub */}
              <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#1a73e8]" />
                    任务成果单独与汇总多格式导出 (Multi-Format Artifact Export)
                  </h3>
                  <span className="text-xs text-[#5f6368]">支持 Word、Excel、PDF、PPT、TXT、MD、JSON</span>
                </div>

                <div className="space-y-3">
                  {activeTask.artifacts.length > 0 ? (
                    activeTask.artifacts.map(art => (
                      <div key={art.id} className="bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-lg space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              art.isFinalAggregate 
                                ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]' 
                                : 'bg-[#e8f0fe] text-[#1a73e8] border border-[#aecbfa]'
                            }`}>
                              {art.isFinalAggregate ? '总成果汇总' : `节点 #${art.nodeIndex} 成果`}
                            </span>
                            <h4 className="font-bold text-xs text-[#202124]">{art.title}</h4>
                          </div>

                          <div className="text-[11px] font-mono text-[#5f6368]">
                            Hash: {art.evidenceHash.substring(0, 12)}...
                          </div>
                        </div>

                        <p className="text-xs text-[#5f6368]">{art.summary}</p>

                        {/* Export Format Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#dadce0]">
                          <span className="text-xs font-semibold text-[#3c4043] self-center">格式导出:</span>
                          {(['MD', 'TXT', 'DOC', 'PDF', 'EXCEL', 'PPT', 'JSON'] as ExportFormat[]).map(fmt => (
                            <button
                              key={fmt}
                              onClick={() => exportArtifactToFile(art, fmt)}
                              className="px-2.5 py-1 bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] text-[#3c4043] border border-[#dadce0] text-[11px] font-mono font-bold rounded transition-colors shadow-2xs"
                            >
                              .{fmt.toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-[#5f6368] text-xs">
                      尚未产生节点成果，请点击上方的“项目运行/执行”生成各阶段成果。
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#dadce0] p-8 rounded-xl text-center text-[#5f6368]">
              请从左侧选择任务或点击“新建任务指令”开启新运行流程。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
