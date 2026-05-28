// ============================================================
// App — Main layout with sidebar navigation
// ============================================================

import { MessageSquare, LayoutDashboard, Settings, Brain } from 'lucide-react';
import { useStore } from './store/useStore';
import ChatInterface from './components/ChatInterface';
import BrainDashboard from './components/BrainDashboard';
import SettingsPanel from './components/SettingsPanel';

const navItems = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'dashboard' as const, label: 'Brain', icon: LayoutDashboard },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function App() {
  const { activeView, setActiveView } = useStore();

  return (
    <div className="h-full w-full flex bg-cortex-bg">
      {/* Sidebar */}
      <nav className="w-16 lg:w-56 flex-shrink-0 bg-cortex-surface border-r border-cortex-border flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center lg:justify-start lg:px-4 border-b border-cortex-border">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-brain-400 brain-glow" />
            <span className="hidden lg:inline font-semibold text-sm">CortexForge</span>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 py-2 space-y-1 px-2 lg:px-3">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-brain-600/20 text-brain-400 border border-brain-500/20'
                    : 'text-cortex-muted hover:text-cortex-text hover:bg-cortex-card'
                }`}
              >
                <ItemIcon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status indicator */}
        <div className="p-3 border-t border-cortex-border hidden lg:block">
          <div className="flex items-center gap-2 text-xs text-cortex-muted">
            <span className="w-2 h-2 rounded-full bg-cortex-success animate-pulse" />
            Operational
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {activeView === 'chat' && <ChatInterface />}
        {activeView === 'dashboard' && <BrainDashboard />}
        {activeView === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}