// ============================================================
// Cognition Stage Indicator — Animated 5-stage brain cycle
// ============================================================

import { useStore } from '../store/useStore';
import { Brain, Eye, Cog, Map, Play, RotateCcw } from 'lucide-react';

const stages = [
  { id: 'perception' as const, label: 'Perception', icon: Eye, color: '#3b82f6', desc: 'Scanning environment & checking inputs' },
  { id: 'reasoning' as const, label: 'Reasoning', icon: Brain, color: '#6366f1', desc: 'Synthesizing context & analyzing intents' },
  { id: 'planning' as const, label: 'Planning', icon: Map, color: '#a855f7', desc: 'Decomposing goals into task DAG' },
  { id: 'execution' as const, label: 'Execution', icon: Play, color: '#22c55e', desc: 'Invoking skills & processing feedback' },
  { id: 'reflection' as const, label: 'Reflection', icon: RotateCcw, color: '#f59e0b', desc: 'Evaluating outcomes & consolidating' },
];

export default function CognitionStageIndicator() {
  const cognition = useStore((s) => s.cognition);

  const activeIndex = cognition
    ? stages.findIndex((s) => s.id === cognition.currentStage)
    : -1;

  return (
    <div className="bg-cortex-card rounded-xl border border-cortex-border p-4">
      <h3 className="text-sm font-semibold text-cortex-muted uppercase tracking-wider mb-4">
        Cognition Cycle
      </h3>

      {/* Stage Flow */}
      <div className="flex items-center justify-between gap-1">
        {stages.map((stage, idx) => {
          const StageIcon = stage.icon;
          const isActive = idx === activeIndex;
          const isPast = activeIndex >= 0 && idx < activeIndex;
          const isUpcoming = activeIndex >= 0 && idx > activeIndex;

          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`h-0.5 w-full -mb-3 transition-colors duration-500 ${
                    isPast ? 'bg-brain-500' : 'bg-cortex-border'
                  }`}
                />
              )}

              {/* Stage circle */}
              <div
                className={`cognition-stage relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'scale-110 shadow-lg animate-glow'
                    : isPast
                    ? 'bg-brain-500/30'
                    : 'bg-cortex-border/50'
                }`}
                style={{
                  border: `2px solid ${isActive ? stage.color : isPast ? `${stage.color}80` : '#2a2a3e'}`,
                }}
              >
                <StageIcon
                  className={`w-5 h-5 transition-all duration-500 ${
                    isActive
                      ? 'text-white'
                      : isPast
                      ? 'text-cortex-muted'
                      : 'text-cortex-muted/50'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-2 font-medium text-center transition-all duration-500 ${
                  isActive
                    ? 'text-cortex-text'
                    : isPast
                    ? 'text-cortex-muted'
                    : 'text-cortex-muted/40'
                }`}
              >
                {stage.label}
              </span>

              {/* Description (only on active) */}
              {isActive && (
                <span className="text-[9px] text-cortex-accent mt-0.5 text-center animate-fade-in leading-tight max-w-[80px]">
                  {stage.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Cycle count */}
      {cognition && (
        <div className="mt-3 pt-3 border-t border-cortex-border flex justify-between items-center text-xs text-cortex-muted">
          <span>Cycle #{cognition.cycleCount.toLocaleString()}</span>
          <span className={cognition.isIdle ? 'text-cortex-warning' : 'text-cortex-success'}>
            {cognition.isIdle ? '⚡ Idle' : '● Active'}
          </span>
        </div>
      )}
    </div>
  );
}