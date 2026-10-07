import React from 'react';
import { ModelUsageConfig, ModelCallMetric } from '../types/asi';
import { 
  BarChart3, 
  Cpu, 
  Zap, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface ModelDashboardProps {
  configs: Record<string, ModelUsageConfig>;
  metricsHistory: ModelCallMetric[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelDashboard: React.FC<ModelDashboardProps> = ({
  configs,
  metricsHistory,
  selectedModelId,
  onSelectModel
}) => {
  const currentConfig = configs[selectedModelId] || Object.values(configs)[0];

  const modelList = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: '推荐 / 默认', desc: '基础与综合推理、低延迟任务' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', tag: '高级推理', desc: '复杂代码解析与逻辑规划' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tag: '极速/高吞吐', desc: '高频规则预审与基础检索' },
    { id: 'gemini-3.5-transcribe', name: 'Gemini 3.5 Transcribe', tag: '多模态转录', desc: '静态音频/视频事实识别' }
  ];

  const modelCalls = metricsHistory.filter(m => m.modelId === selectedModelId);
  const successCalls = modelCalls.filter(m => m.status === 'SUCCESS').length;
  const avgLatency = modelCalls.length > 0 
    ? Math.round(modelCalls.reduce((acc, m) => acc + m.latencyMs, 0) / modelCalls.length)
    : 0;

  const maxCallLatency = Math.max(...metricsHistory.map(m => m.latencyMs), 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1a73e8]" />
            大模型流量看板与额度监控 (免费配额与频率保护)
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            记录每个模型当日 Token 使用量、API 额度、频次间隔限制与实时耗时分布。
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f8f9fa] p-1.5 rounded-lg border border-[#dadce0]">
          <span className="text-xs text-[#5f6368] pl-2 font-medium">当前模型:</span>
          <select
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-white text-xs font-bold text-[#1a73e8] px-3 py-1.5 rounded border border-[#dadce0] outline-none"
          >
            {modelList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.tag})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {modelList.map((m) => {
          const conf = configs[m.id];
          const isSelected = selectedModelId === m.id;
          const tokenPercent = conf ? Math.round((conf.dailyTokensUsed / conf.dailyTokenLimit) * 100) : 0;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative shadow-xs ${
                isSelected
                  ? 'bg-[#e8f0fe]/50 border-[#1a73e8] ring-1 ring-[#1a73e8]'
                  : 'bg-white border-[#dadce0] hover:border-[#1a73e8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f1f3f4] text-[#1a73e8]">
                  {m.tag}
                </span>
                <span className="text-[10px] text-[#137333] font-semibold bg-[#e6f4ea] px-1.5 py-0.5 rounded">免费可用</span>
              </div>

              <h3 className="font-bold text-xs text-[#202124] mt-2">{m.name}</h3>
              <p className="text-[11px] text-[#5f6368] mt-0.5">{m.desc}</p>

              {conf && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-[#3c4043] font-mono">
                    <span>Token 使用:</span>
                    <span>{conf.dailyTokensUsed} / {conf.dailyTokenLimit}</span>
                  </div>
                  <div className="bg-[#f1f3f4] h-1.5 rounded-full overflow-hidden border border-[#dadce0]">
                    <div 
                      className="bg-[#1a73e8] h-full rounded-full transition-all"
                      style={{ width: `${tokenPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Metrics Grid */}
      {currentConfig && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5f6368]">
              <span>当日 Token 消耗</span>
              <Zap className="w-3.5 h-3.5 text-[#b06000]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#202124]">
              {currentConfig.dailyTokensUsed} <span className="text-xs text-[#5f6368]">Tokens</span>
            </div>
            <p className="text-[11px] text-[#5f6368]">每日配额: {currentConfig.dailyTokenLimit}</p>
          </div>

          <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5f6368]">
              <span>API 调用次数</span>
              <Activity className="w-3.5 h-3.5 text-[#1a73e8]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#202124]">
              {currentConfig.dailyCallsUsed} <span className="text-xs text-[#5f6368]">次</span>
            </div>
            <p className="text-[11px] text-[#5f6368]">每日配额: {currentConfig.dailyCallsLimit} 次</p>
          </div>

          <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5f6368]">
              <span>安全调用频次间隔</span>
              <Clock className="w-3.5 h-3.5 text-[#137333]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#137333]">
              {currentConfig.minIntervalMs} <span className="text-xs text-[#5f6368]">ms / request</span>
            </div>
            <p className="text-[11px] text-[#5f6368]">频率平滑保护开启</p>
          </div>

          <div className="bg-white border border-[#dadce0] p-4 rounded-xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5f6368]">
              <span>平均响应延迟</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#9334e6]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#9334e6]">
              {avgLatency} <span className="text-xs text-[#5f6368]">ms</span>
            </div>
            <p className="text-[11px] text-[#137333]">成功率: {modelCalls.length > 0 ? Math.round((successCalls / modelCalls.length) * 100) : 100}%</p>
          </div>
        </div>
      )}

      {/* Visual Traffic & Latency SVG Chart */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1a73e8]" />
            可视化流量与请求耗时分布图表 (Real-time Visual Traffic & Latency)
          </h3>
          <span className="text-xs text-[#5f6368] font-mono">柱高代表响应时间 (ms)</span>
        </div>

        {metricsHistory.length > 0 ? (
          <div className="bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0] space-y-3">
            <div className="h-40 flex items-end gap-2 pt-6 px-2 overflow-x-auto">
              {metricsHistory.slice(0, 20).reverse().map((item, index) => {
                const heightPercent = Math.min(100, Math.max(15, Math.round((item.latencyMs / maxCallLatency) * 100)));
                return (
                  <div key={item.id} className="flex-1 flex flex-col items-center group relative min-w-[24px]">
                    <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-white border border-[#dadce0] text-[10px] text-[#202124] p-1 rounded z-20 whitespace-nowrap shadow-lg">
                      <span>{item.modelId}</span>
                      <span className="text-[#1a73e8] font-bold">{item.latencyMs} ms ({item.totalTokens} tokens)</span>
                    </div>

                    <div 
                      className={`w-full rounded-t transition-all ${
                        item.status === 'SUCCESS' ? 'bg-[#1a73e8] hover:bg-[#1557b0]' : 'bg-[#c5221f]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>

                    <span className="text-[9px] text-[#70757a] font-mono mt-1">#{index + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#5f6368] border-t border-[#dadce0] pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]"></span>
                  <span>成功调用 (Success)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c5221f]"></span>
                  <span>异常/限流 (Failed)</span>
                </span>
              </div>
              <span className="font-mono">采样最近 20 次请求</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#f8f9fa] p-8 text-center text-[#5f6368] text-xs rounded-lg border border-[#dadce0]">
            暂无 API 调用指标数据，可尝试在“AI 推断评估”或“任务执行”中触发模型推理。
          </div>
        )}
      </div>
    </div>
  );
};
