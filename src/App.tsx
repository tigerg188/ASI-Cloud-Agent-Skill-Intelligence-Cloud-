/**
 * ASI-Cloud (Agent/Skill Intelligence Cloud)
 * Main Application Component V3.0 (Google Web Light Edition)
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { ProjectManager } from './components/ProjectManager';
import { TaskExecutionManager } from './components/TaskExecutionManager';
import { FactModelViewer } from './components/FactModelViewer';
import { AgentPluginsValidator } from './components/AgentPluginsValidator';
import { Gate1Dashboard } from './components/Gate1Dashboard';
import { AuditLogViewer } from './components/AuditLogViewer';
import { ModelDashboard } from './components/ModelDashboard';
import { GeminiInferenceAssessor } from './components/GeminiInferenceAssessor';
import { FactModel, AuditLog, Gate1Report, ModelUsageConfig, ModelCallMetric, TaskItem, TaskInputFile } from './types/asi';

export default function App() {
  const [activeTab, setActiveTab] = useState('projects');
  
  // Projects State
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [factModel, setFactModel] = useState<FactModel | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Audit Logs & Model Stats
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [modelConfigs, setModelConfigs] = useState<Record<string, ModelUsageConfig>>({});
  const [metricsHistory, setMetricsHistory] = useState<ModelCallMetric[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('gemini-3.8-flash');
  
  // Gate 1 Report
  const [gate1Report, setGate1Report] = useState<Gate1Report | null>(null);

  // Task & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [taskProgress, setTaskProgress] = useState(100);
  const [taskStepName, setTaskStepName] = useState('系统准备就绪');
  const [scannerStatus, setScannerStatus] = useState('Idle');
  const [validatorStatus, setValidatorStatus] = useState('Ready');
  const [gateEngineStatus, setGateEngineStatus] = useState('Idle');

  // Fetch Projects List
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects) {
        setProjectsList(data.projects);
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch (e) {}
  };

  // Fetch Tasks for Selected Project
  const fetchTasks = async (projectId: string) => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (e) {}
  };

  // Fetch Logs & Stats
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {}
  };

  const fetchModelStats = async () => {
    try {
      const res = await fetch('/api/model-stats');
      const data = await res.json();
      if (data.configs) setModelConfigs(data.configs);
      if (data.metricsHistory) setMetricsHistory(data.metricsHistory);
    } catch (e) {}
  };

  const fetchFactModel = async (projectId: string) => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/fact-model/${projectId}`);
      const data = await res.json();
      if (data.factModel) setFactModel(data.factModel);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProjects();
    fetchLogs();
    fetchModelStats();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchFactModel(selectedProjectId);
      fetchTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Handler: Select Project
  const handleSelectProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsLoading(true);
    setTaskProgress(30);
    setTaskStepName(`物理载入项目 [${projectId}]`);
    setScannerStatus('Scanning');

    try {
      const scanRes = await fetch(`/api/scan/${projectId}`, { method: 'POST' });
      setTaskProgress(70);
      const scanData = await scanRes.json();

      if (scanData.factModel) {
        setFactModel(scanData.factModel);
        setTaskProgress(90);
        setValidatorStatus('Validated');

        const gateRes = await fetch(`/api/gate1/verify/${projectId}`, { method: 'POST' });
        const gateData = await gateRes.json();
        if (gateData.report) {
          setGate1Report(gateData.report);
          setGateEngineStatus(gateData.report.passedAll ? 'Passed' : 'Blocked');
        }
      }

      setTaskProgress(100);
      setTaskStepName(`物理扫描与对齐完成`);
      fetchProjects();
      fetchTasks(projectId);
      fetchLogs();
      fetchModelStats();
    } catch (err) {
      setTaskStepName(`扫描中断`);
    } finally {
      setIsLoading(false);
      setScannerStatus('Idle');
    }
  };

  // Handler: Create Project
  const handleCreateProject = async (name: string, description: string) => {
    setIsLoading(true);
    setTaskProgress(30);
    setTaskStepName(`创建空白项目 [${name}]...`);

    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (data.projectId) {
        setSelectedProjectId(data.projectId);
        setFactModel(data.factModel);
        setTaskProgress(100);
        setTaskStepName(`新项目创建与建立完成`);
        fetchProjects();
        fetchTasks(data.projectId);
        fetchLogs();
      }
    } catch (e) {
      setTaskStepName(`创建项目失败`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (confirm(`确认要物理删除项目 [${projectId}] 吗？`)) {
      setIsLoading(true);
      try {
        await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        fetchProjects();
        if (selectedProjectId === projectId) {
          setSelectedProjectId('');
          setFactModel(null);
          setTasks([]);
        }
        fetchLogs();
      } catch (e) {} finally {
        setIsLoading(false);
      }
    }
  };

  // Handler: Import GitHub Repo
  const handleImportGithub = async (repoUrl: string) => {
    setIsLoading(true);
    setTaskProgress(30);
    setTaskStepName(`获取 GitHub 仓库...`);
    setScannerStatus('Importing');

    try {
      const res = await fetch('/api/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });
      const data = await res.json();
      if (data.projectId) {
        setSelectedProjectId(data.projectId);
        setFactModel(data.factModel);
        setTaskProgress(100);
        setTaskStepName(`GitHub 仓库导入完成`);
        fetchProjects();
        fetchTasks(data.projectId);
        fetchLogs();
        setActiveTab('factModel');
      }
    } catch (err) {
      setTaskStepName(`GitHub 导入失败`);
    } finally {
      setIsLoading(false);
      setScannerStatus('Idle');
    }
  };

  // Handler: Import ZIP Upload
  const handleImportZip = async (file: File) => {
    setIsLoading(true);
    setTaskProgress(25);
    setTaskStepName(`解压 ZIP 压缩包...`);
    setScannerStatus('Extracting');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const zipBase64 = e.target?.result as string;
        const res = await fetch('/api/import/zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipBase64, filename: file.name })
        });
        const data = await res.json();
        if (data.projectId) {
          setSelectedProjectId(data.projectId);
          setFactModel(data.factModel);
          setTaskProgress(100);
          setTaskStepName(`ZIP 文件提取与扫描完成`);
          fetchProjects();
          fetchTasks(data.projectId);
          fetchLogs();
          setActiveTab('factModel');
        }
        setIsLoading(false);
        setScannerStatus('Idle');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsLoading(false);
      setTaskStepName(`ZIP 导入失败`);
      setScannerStatus('Idle');
    }
  };

  // Handler: Tasks Engine
  const handleCreateTask = async (title: string, userInstruction: string, inputFiles: TaskInputFile[]) => {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, userInstruction, inputFiles })
      });
      const data = await res.json();
      if (data.task) {
        fetchTasks(selectedProjectId);
        fetchLogs();
      }
    } catch (e) {}
  };

  const handleExecuteTask = async (taskId: string) => {
    setIsLoading(true);
    setTaskProgress(40);
    setTaskStepName(`运行任务节点流程...`);

    try {
      const res = await fetch(`/api/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      const data = await res.json();
      if (data.task) {
        setTaskProgress(100);
        setTaskStepName(`任务节点执行与成果生成完毕`);
        fetchTasks(selectedProjectId);
        fetchLogs();
        fetchModelStats();
      }
    } catch (e) {
      setTaskStepName(`任务执行失败`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      fetchTasks(selectedProjectId);
      fetchLogs();
    } catch (e) {}
  };

  const handleRollbackTask = async (taskId: string, targetNodeIndex: number) => {
    try {
      await fetch(`/api/tasks/${taskId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId, targetNodeIndex })
      });
      fetchTasks(selectedProjectId);
      fetchLogs();
    } catch (e) {}
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}?projectId=${selectedProjectId}`, { method: 'DELETE' });
      fetchTasks(selectedProjectId);
      fetchLogs();
    } catch (e) {}
  };

  // Handler: Run Gate 1 Audit
  const handleRunGate1 = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    setGateEngineStatus('Running');
    setTaskProgress(40);
    setTaskStepName(`执行 Gate 1 门控全量测试...`);

    try {
      const res = await fetch(`/api/gate1/verify/${selectedProjectId}`, { method: 'POST' });
      const data = await res.json();
      if (data.report) {
        setGate1Report(data.report);
        setGateEngineStatus(data.report.passedAll ? 'Passed' : 'Blocked');
      }
      setTaskProgress(100);
      setTaskStepName(`Gate 1 测试完成`);
      fetchLogs();
    } catch (e) {
      setTaskStepName(`Gate 1 测试失败`);
      setGateEngineStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {}
  };

  const handleExportLogs = () => {
    window.open('/api/logs/export', '_blank');
  };

  const handleRunAssessment = async (customPrompt: string) => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    setTaskProgress(50);
    setTaskStepName(`发起 Gemini 智能推断...`);

    try {
      const res = await fetch('/api/gemini/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          promptCustom: customPrompt
        })
      });
      const data = await res.json();
      setTaskProgress(100);
      setTaskStepName(`Gemini 推理完成`);
      fetchLogs();
      fetchModelStats();
      return data;
    } catch (e) {
      setTaskStepName(`Gemini 推理失败`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] pb-16 font-sans flex flex-col">
      {/* Top Google Web Light Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskProgress={taskProgress}
        taskStepName={taskStepName}
        selectedProjectId={selectedProjectId}
        gate1Status={gate1Report ? (gate1Report.passedAll ? 'PASSED' : 'FAILED') : 'NOT_RUN'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'projects' && (
          <ProjectManager
            projects={projectsList}
            activeProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onImportGithub={handleImportGithub}
            onImportZip={handleImportZip}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskExecutionManager
            tasks={tasks}
            selectedProjectId={selectedProjectId}
            onCreateTask={handleCreateTask}
            onExecuteTask={handleExecuteTask}
            onPauseTask={handlePauseTask}
            onRollbackTask={handleRollbackTask}
            onDeleteTask={handleDeleteTask}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'factModel' && (
          <FactModelViewer
            factModel={factModel}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'plugins' && (
          <AgentPluginsValidator
            factModel={factModel}
          />
        )}

        {activeTab === 'gate1' && (
          <Gate1Dashboard
            report={gate1Report}
            onRunGate1={handleRunGate1}
            isLoading={isLoading}
            selectedProjectId={selectedProjectId}
          />
        )}

        {activeTab === 'logs' && (
          <AuditLogViewer
            logs={logs}
            onClearLogs={handleClearLogs}
            onExportLogs={handleExportLogs}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'modelDashboard' && (
          <ModelDashboard
            configs={modelConfigs}
            metricsHistory={metricsHistory}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
          />
        )}

        {activeTab === 'geminiAssess' && (
          <GeminiInferenceAssessor
            factModel={factModel}
            onRunAssessment={handleRunAssessment}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Fixed Bottom Google Web Light Status Bar */}
      <StatusBar
        scannerStatus={scannerStatus}
        validatorStatus={validatorStatus}
        gateEngineStatus={gateEngineStatus}
        queueCompletionPercent={taskProgress}
        latestLog={logs[0]}
        totalLogCount={logs.length}
      />
    </div>
  );
}
