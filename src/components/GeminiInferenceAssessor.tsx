import React, { useState } from 'react';
import { FactModel } from '../types/asi';
import { Sparkles, Send, RefreshCw, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface GeminiInferenceAssessorProps {
  factModel: FactModel | null;
  onRunAssessment: (customQuestion: string) => Promise<any>;
  isLoading: boolean;
}

export const GeminiInferenceAssessor: React.FC<GeminiInferenceAssessorProps> = ({
  factModel,
  onRunAssessment,
  isLoading
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onRunAssessment(customPrompt);
    if (result) {
      setLastResult(result);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#b06000]" />
            AI 智能推断与评估 (Gemini Inference Assessment)
          </h2>
          <p className="text-xs text-[#5f6368] mt-1">
            Gemini 可以分析、推理、规划与评估，但不能制造事实。所有本模块生成内容均被严格标记为 <span className="text-[#9334e6] font-bold">INFERENCE</span> 或 <span className="text-[#c5221f] font-bold">MODEL_ASSESSMENT</span>。
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-[#f3e8fd] text-[#9334e6] border border-[#d7aefb] px-3 py-1 rounded-full">
          Server-Side @google/genai (gemini-3.8-flash)
        </span>
      </div>

      {/* Form Input */}
      <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#1a73e8]" />
          针对当前 Fact Model 发起 Gemini 智能推理
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="例如: 分析此 Agent 项目的迁移复杂度，并针对 SKILL.md 给出执行计划策略..."
            rows={3}
            className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] text-xs text-[#202124] p-3 rounded-lg font-sans outline-none resize-none"
          />

          <button
            type="submit"
            disabled={isLoading || !factModel}
            className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini 推理计算中...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>执行 AI 智能推断 (生成 INFERENCE 标记)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {lastResult && (
        <div className="bg-white border border-[#dadce0] p-5 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#202124]">Gemini 推理评估报告</span>
              <span className="text-[10px] font-mono font-bold bg-[#f3e8fd] text-[#9334e6] border border-[#d7aefb] px-2 py-0.5 rounded">
                INFERENCE
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#5f6368]">
              <span>耗时: {lastResult.latencyMs} ms</span>
              <span>Tokens: {lastResult.usage?.totalTokens}</span>
            </div>
          </div>

          <pre className="bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0] text-xs text-[#202124] font-sans leading-relaxed whitespace-pre-wrap overflow-x-auto">
            {lastResult.assessment}
          </pre>

          <div className="bg-[#fef7e0] border border-[#feefc3] p-2.5 rounded text-[11px] text-[#b06000] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>铁律一提醒：上述评估属于 Gemini 推断结论，绝不替换物理文件系统中的 FACT。</span>
          </div>
        </div>
      )}
    </div>
  );
};
