// ============================================================
// Settings Panel — API keys, identity, skill toggles
// ============================================================

import { useState } from 'react';
import { Save, Key, User, ToggleLeft, ExternalLink } from 'lucide-react';

const mockSkills = [
  { id: 'git', name: 'Git Operations', category: 'DevOps', enabled: true },
  { id: 'docker', name: 'Docker Management', category: 'DevOps', enabled: true },
  { id: 'web-browse', name: 'Web Browsing', category: 'Research', enabled: true },
  { id: 'email', name: 'Email Integration', category: 'Communication', enabled: false },
  { id: 'slack', name: 'Slack Integration', category: 'Communication', enabled: false },
  { id: 'github', name: 'GitHub API', category: 'External', enabled: true },
  { id: 'deploy', name: 'Cloud Deploy', category: 'DevOps', enabled: true },
  { id: 'vector-db', name: 'Vector Database', category: 'AI/ML', enabled: false },
  { id: 'pdf-gen', name: 'PDF Generation', category: 'Documents', enabled: false },
  { id: 'tts', name: 'Text-to-Speech', category: 'Communication', enabled: false },
];

export default function SettingsPanel() {
  const [agentName, setAgentName] = useState('CortexForge');
  const [baseDirective, setBaseDirective] = useState('An autonomous software engineer and researcher');
  const [groqKey, setGroqKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [skills, setSkills] = useState(mockSkills);
  const [saved, setSaved] = useState(false);

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <User className="w-5 h-5 text-cortex-accent" />
        Settings
      </h2>

      {/* Agent Identity */}
      <section className="bg-cortex-card rounded-xl border border-cortex-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-cortex-muted uppercase tracking-wider">Agent Identity</h3>
        <div>
          <label className="text-xs text-cortex-muted block mb-1">Agent Name</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full bg-cortex-bg border border-cortex-border rounded-lg px-3 py-2 text-sm text-cortex-text focus:outline-none focus:border-brain-500"
          />
        </div>
        <div>
          <label className="text-xs text-cortex-muted block mb-1">Base Directive</label>
          <textarea
            value={baseDirective}
            onChange={(e) => setBaseDirective(e.target.value)}
            rows={2}
            className="w-full bg-cortex-bg border border-cortex-border rounded-lg px-3 py-2 text-sm text-cortex-text focus:outline-none focus:border-brain-500 resize-none"
          />
        </div>
      </section>

      {/* API Keys */}
      <section className="bg-cortex-card rounded-xl border border-cortex-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-cortex-muted uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5" />
          API Keys
        </h3>
        <div>
          <label className="text-xs text-cortex-muted block mb-1">Groq API Key (Reflexive Actions)</label>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-cortex-bg border border-cortex-border rounded-lg px-3 py-2 text-sm text-cortex-text focus:outline-none focus:border-brain-500"
          />
        </div>
        <div>
          <label className="text-xs text-cortex-muted block mb-1">OpenAI API Key (Deep Deliberation)</label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-cortex-bg border border-cortex-border rounded-lg px-3 py-2 text-sm text-cortex-text focus:outline-none focus:border-brain-500"
          />
        </div>
      </section>

      {/* Skill Toggles */}
      <section className="bg-cortex-card rounded-xl border border-cortex-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-cortex-muted uppercase tracking-wider flex items-center gap-1.5">
          <ToggleLeft className="w-3.5 h-3.5" />
          Skills
        </h3>
        <div className="space-y-1">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-cortex-bg/50 transition-colors"
            >
              <div>
                <span className="text-sm text-cortex-text">{skill.name}</span>
                <span className="text-xs text-cortex-muted ml-2">({skill.category})</span>
              </div>
              <button
                onClick={() => toggleSkill(skill.id)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  skill.enabled ? 'bg-brain-600' : 'bg-cortex-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    skill.enabled ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-brain-600 hover:bg-brain-500 text-white rounded-lg px-4 py-2.5 text-sm transition-all w-full justify-center"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}