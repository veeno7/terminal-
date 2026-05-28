// ============================================================
// Agent State Dashboard — Vitals, Motivation, Identity
// ============================================================

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../hooks/api';
import { Activity, Heart, Zap, Cpu, Signal, Target } from 'lucide-react';

/** Circular gauge component */
function Gauge({ value, max = 100, label, color = '#6366f1' }: { value: number; max?: number; label: string; color?: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1a1a2e" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-fill"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center mt-1">
        <span className="text-lg font-bold text-cortex-text">{Math.round(value)}</span>
        <span className="text-[9px] text-cortex-muted uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

/** Token usage bar */
function TokenBar({ used, limit, percent }: { used: number; limit: number; percent: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-cortex-muted">Token Budget</span>
        <span className="text-cortex-text font-mono">
          {(used / 1000).toFixed(1)}k / {(limit / 1000).toFixed(0)}k
        </span>
      </div>
      <div className="h-2 rounded-full bg-cortex-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: percent > 80 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#22c55e',
          }}
        />
      </div>
    </div>
  );
}

export default function AgentStateDashboard() {
  const agentState = useStore((s) => s.agentState);
  const setAgentState = useStore((s) => s.setAgentState);

  useEffect(() => {
    api.getAgentState().then(setAgentState).catch(console.error);
  }, []);

  if (!agentState) {
    return (
      <div className="bg-cortex-card rounded-xl border border-cortex-border p-4">
        <p className="text-sm text-cortex-muted">Loading agent state...</p>
      </div>
    );
  }

  const { identity, vitals, motivation, activeGoals } = agentState;

  return (
    <div className="bg-cortex-card rounded-xl border border-cortex-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-cortex-muted uppercase tracking-wider">
        Agent State
      </h3>

      {/* Identity */}
      <div className="bg-cortex-bg rounded-lg p-3 border border-cortex-border">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-cortex-accent" />
          <span className="text-sm font-medium">{identity.name}</span>
        </div>
        <p className="text-xs text-cortex-muted mb-1">{identity.baseDirective}</p>
        <p className="text-xs text-cortex-muted/60">{identity.tone}</p>
      </div>

      {/* Motivational Gauges */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-cortex-warning" />
          <span className="text-xs font-medium text-cortex-muted uppercase tracking-wider">Motivational State</span>
        </div>
        <div className="flex justify-around">
          <div className="relative flex flex-col items-center">
            <Gauge value={motivation.curiosity} color="#3b82f6" label="Curiosity" />
          </div>
          <div className="relative flex flex-col items-center">
            <Gauge value={motivation.urgency} color="#f59e0b" label="Urgency" />
          </div>
          <div className="relative flex flex-col items-center">
            <Gauge value={motivation.focus} color="#22c55e" label="Focus" />
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Activity className="w-3.5 h-3.5 text-cortex-info" />
          <span className="text-xs font-medium text-cortex-muted uppercase tracking-wider">Vitals</span>
        </div>

        <TokenBar used={vitals.tokenUsage.used} limit={vitals.tokenUsage.limit} percent={vitals.tokenUsage.percent} />

        {/* API Health */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Signal className="w-3 h-3" />
            <span className="text-cortex-muted">Groq:</span>
            <span className={vitals.apiHealth.groq === 'ok' ? 'text-cortex-success' : 'text-cortex-error'}>
              {vitals.apiHealth.groq}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Signal className="w-3 h-3" />
            <span className="text-cortex-muted">OpenAI:</span>
            <span className={vitals.apiHealth.openai === 'ok' ? 'text-cortex-success' : 'text-cortex-error'}>
              {vitals.apiHealth.openai}
            </span>
          </div>
        </div>

        {/* Memory */}
        <div className="flex items-center gap-1.5 text-xs">
          <Cpu className="w-3 h-3 text-cortex-muted" />
          <span className="text-cortex-muted">Memory:</span>
          <span className="text-cortex-text font-mono">
            {(vitals.memoryUsage.heapUsed / 1024 / 1024).toFixed(0)}MB / {(vitals.memoryUsage.heapTotal / 1024 / 1024).toFixed(0)}MB
          </span>
        </div>

        {/* Uptime */}
        <div className="flex items-center gap-1.5 text-xs">
          <Target className="w-3 h-3 text-cortex-muted" />
          <span className="text-cortex-muted">Uptime:</span>
          <span className="text-cortex-text">
            {Math.floor(vitals.uptime / 3600)}h {Math.floor((vitals.uptime % 3600) / 60)}m
          </span>
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h4 className="text-xs font-medium text-cortex-muted uppercase tracking-wider mb-2">
          Active Goals ({activeGoals.length})
        </h4>
        <div className="space-y-2">
          {activeGoals.map((goal) => (
            <div key={goal.id} className="bg-cortex-bg rounded-lg p-2.5 border border-cortex-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cortex-text truncate">{goal.description}</p>
                  <span
                    className={`text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded-full ${
                      goal.priority === 'critical'
                        ? 'bg-cortex-error/20 text-cortex-error'
                        : goal.priority === 'high'
                        ? 'bg-cortex-warning/20 text-cortex-warning'
                        : 'bg-cortex-info/20 text-cortex-info'
                    }`}
                  >
                    {goal.priority}
                  </span>
                </div>
                <span className="text-xs font-mono text-cortex-muted whitespace-nowrap">
                  {goal.progress}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-cortex-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%`, background: '#6366f1' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}