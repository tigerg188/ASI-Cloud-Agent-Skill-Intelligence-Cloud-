/**
 * ASI-Cloud (Agent/Skill Intelligence Cloud)
 * Data Model Definitions V3.0 (Updated with Task Management & Artifact Export)
 */

export type DataSourceLevel = 
  | 'FACT'
  | 'AUTHOR_EXPLICIT'
  | 'USER_CONFIRMED'
  | 'INFERENCE'
  | 'RUNTIME_RESULT'
  | 'MODEL_ASSESSMENT';

export type ExecutionStatus = 
  | 'PENDING'
  | 'READY'
  | 'BLOCKED'
  | 'RUNNING'
  | 'PAUSED'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'SKIPPED'
  | 'NOT_APPLICABLE'
  | 'WAITING_USER';

export interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  sizeBytes: number;
  extension: string;
  hash: string;
  source: DataSourceLevel;
  isSymlink: boolean;
  isEscaped: boolean;
}

export interface DirectoryNode {
  name: string;
  path: string;
  type: 'directory' | 'file';
  children?: DirectoryNode[];
  sizeBytes?: number;
  hash?: string;
  source: DataSourceLevel;
}

export interface PluginManifest {
  schema?: string;
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  repository?: string;
  keywords?: string[];
  rawContent?: string;
  source: DataSourceLevel;
  validationStatus: 'VALID' | 'INVALID' | 'MISSING';
  errors: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  path: string;
  skillMdPath: string;
  hasSkillMd: boolean;
  hasReferences: boolean;
  referencesList: string[];
  frontmatter?: Record<string, any>;
  valid: boolean;
  errors: string[];
  source: DataSourceLevel;
}

export interface McpServerConfig {
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  type?: string;
}

export interface McpManifest {
  path: string;
  exists: boolean;
  servers: McpServerConfig[];
  valid: boolean;
  errors: string[];
  source: DataSourceLevel;
}

export interface FactModel {
  projectId: string;
  projectName: string;
  sourceType: 'BENCHMARK_SAMPLE' | 'GITHUB' | 'ZIP_UPLOAD' | 'CUSTOM_CREATE';
  sourceLocation: string;
  importTime: string;
  commitVersion: string;
  
  filesManifest: FileItem[];
  directoryTree: DirectoryNode;
  fileStats: {
    totalFiles: number;
    totalDirectories: number;
    totalSizeBytes: number;
    fileTypesCount: Record<string, number>;
  };

  pluginManifest: PluginManifest;
  skills: SkillItem[];
  mcp: McpManifest;
  dependencies: {
    language: string;
    configFile: string;
    items: string[];
  }[];
  scripts: string[];
  documentation: string[];
  candidateEntries: string[];

  packageBoundaryPassed: boolean;
  packageBoundaryErrors: string[];

  createdAt: string;
}

export interface TaskInputFile {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  contentBase64?: string;
  contentText?: string;
  uploadedAt: string;
}

export interface TaskNode {
  id: string;
  nodeIndex: number;
  title: string;
  description: string;
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  outputArtifactText?: string;
  evidenceHash?: string;
  logs: string[];
}

export interface TaskArtifact {
  id: string;
  title: string;
  summary: string;
  fullContentMarkdown: string;
  nodeId?: string;
  nodeIndex?: number;
  isFinalAggregate: boolean;
  createdAt: string;
  evidenceHash: string;
  dataPoints: Record<string, any>;
}

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  userInstruction: string;
  status: ExecutionStatus;
  inputFiles: TaskInputFile[];
  nodes: TaskNode[];
  artifacts: TaskArtifact[];
  createdAt: string;
  updatedAt: string;
  currentStepIndex: number;
  rollbackHistory: {
    timestamp: string;
    targetNodeIndex: number;
    reason: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SCAN' | 'EVIDENCE' | 'GATE_CHECK' | 'WARN' | 'ERROR' | 'EXECUTION';
  module: string;
  message: string;
  details?: any;
  sourceTag: DataSourceLevel;
  latencyMs?: number;
}

export interface ModelCallMetric {
  id: string;
  timestamp: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'SUCCESS' | 'RATE_LIMITED' | 'FAILED';
  error?: string;
}

export interface ModelUsageConfig {
  modelId: string;
  displayName: string;
  dailyTokenLimit: number;
  dailyTokensUsed: number;
  dailyCallsLimit: number;
  dailyCallsUsed: number;
  minIntervalMs: number;
  lastCallTimestamp: number;
  isFreeEligible: boolean;
}

export interface Gate1CheckItem {
  id: string;
  code: string;
  title: string;
  description: string;
  passed: boolean;
  evidenceHashes: string[];
  details: string;
  sourceTag: DataSourceLevel;
}

export interface Gate1Report {
  projectId: string;
  timestamp: string;
  passedAll: boolean;
  totalChecks: number;
  passedCount: number;
  checks: Gate1CheckItem[];
  verificationEvidence: {
    scannedFileCount: number;
    scannedSkillsCount: number;
    pluginJsonValid: boolean;
    mcpValid: boolean;
    zeroGeminiInjectedComponents: boolean;
    zeroPreSetBusinessLogic: boolean;
    traceabilityHash: string;
  };
}

export type ExportFormat = 'MD' | 'TXT' | 'DOC' | 'PDF' | 'EXCEL' | 'PPT' | 'JSON';
