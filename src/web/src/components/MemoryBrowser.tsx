// ============================================================
// Memory Browser — Tabbed view of all four memory tiers
// ============================================================

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../hooks/api';
import { HardDrive, Clock, BookOpen, Wrench, ChevronRight } from 'lucide-react';
import type { MemoryTab } from '../types';

const tabs: { id: MemoryTab; label: string; icon: typeof HardDrive }[] = [
  { id: 'working', label: 'Working', icon: HardDrive },
  { id: 'episodic', label: 'Episodic', icon: Clock },
  { id: 'semantic', label: 'Semantic', icon: BookOpen },
  { id: 'procedural', label: 'Procedural', icon: Wrench },
];

export default function MemoryBrowser() {
  const [activeTab, setActiveTab] = useState<MemoryTab>('working');
  const agentMemory = useStore((s) => s.agentMemory);
  const setAgentMemory = useStore((s) => s.setAgentMemory);

  useEffect(() => {
    api.getAgentMemory().then(setAgentMemory).catch(console.error);
  }, []);

  if (!agentMemory) {
    return (
      <div className="bg-cortex-card rounded-xl border border-cortex-border p-4">
        <p className="text-sm text-cortex-muted">Loading memory...</p>
      </div>
    );
  }

  return (
    <div className="bg-cortex-card rounded-xl border border-cortex-border">
      {/* Tabs */}
      <div className="flex border-b border-cortex-border">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'text-cortex-accent border-b-2 border-cortex-accent bg-cortex-accent/5'
                  : 'text-cortex-muted hover:text-cortex-text'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-3 max-h-[180px] overflow-y-auto">
        {activeTab === 'working' && (
          <div className="space-y-2">
            {agentMemory.working.length === 0 && (
              <p className="text-xs text-cortex-muted">No working memory entries.</p>
            )}
            {agentMemory.working.map((entry, i) => (
              <div key={i} className="text-xs bg-cortex-bg rounded p-2 border border-cortex-border">
                <div className="flex items-center gap-1 text-cortex-accent font-medium">
                  <ChevronRight className="w-3 h-3" />
                  {entry.key}
                </div>
                <p className="text-cortex-text mt-0.5 ml-4">{entry.value}</p>
                <p className="text-cortex-muted/60 mt-0.5 ml-4 text-[10px]">
                  {new Date(entry.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'episodic' && (
          <div className="space-y-2">
            {agentMemory.episodic.length === 0 && (
              <p className="text-xs text-cortex-muted">No episodic memories.</p>
            )}
            {agentMemory.episodic.map((event) => (
              <div key={event.id} className="text-xs bg-cortex-bg rounded p-2 border border-cortex-border">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      event.outcome === 'success' ? 'bg-cortex-success' :
                      event.outcome === 'failure' ? 'bg-cortex-error' : 'bg-cortex-info'
                    }`}
                  />
                  <span className="text-cortex-text flex-1">{event.summary}</span>
                </div>
                <p className="text-cortex-muted/60 mt-1 text-[10px]">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className="space-y-2">
            {agentMemory.semantic.length === 0 && (
              <p className="text-xs text-cortex-muted">No semantic knowledge.</p>
            )}
            {agentMemory.semantic.map((fact) => (
              <div key={fact.id} className="text-xs bg-cortex-bg rounded p-2 border border-cortex-border">
                <div className="flex items-center gap-2">
                  <span className="text-cortex-text">{fact.fact}</span>
                  <span className="text-cortex-muted/60 ml-auto whitespace-nowrap">
                    {Math.round(fact.confidence * 100)}%
                  </span>
                </div>
                <span className="text-[10px] text-cortex-accent/60">{fact.category}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'procedural' && (
          <div className="space-y-2">
            {agentMemory.procedural.length === 0 && (
              <p className="text-xs text-cortex-muted">No procedural skills recorded.</p>
            )}
            {agentMemory.procedural.map((skill) => (
              <div key={skill.id} className="text-xs bg-cortex-bg rounded p-2 border border-cortex-border">
                <div className="flex items-center gap-2">
                  <span className="text-cortex-accent font-medium">{skill.skillName}</span>
                  <span className="text-cortex-muted/60 ml-auto">
                    Used {skill.usageCount}x
                  </span>
                </div>
                <p className="text-cortex-text mt-0.5 text-[11px]">{skill.notes}</p>
                <p className="text-cortex-muted/60 text-[10px] mt-0.5">
                  Last: {new Date(skill.lastUsed).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}