// ============================================================
// Brain Dashboard — Full view combining all agent visualizations
// ============================================================

import CognitionStageIndicator from './CognitionStageIndicator';
import TaskDAG from './TaskDAG';
import MemoryBrowser from './MemoryBrowser';
import AgentStateDashboard from './AgentStateDashboard';
import { useWebSocket } from '../hooks/useWebSocket';

export default function BrainDashboard() {
  // Start WebSocket connection for real-time updates
  useWebSocket();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cortex-success animate-pulse" />
        Brain Dashboard
      </h2>

      {/* Cognition Cycle */}
      <CognitionStageIndicator />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column — Task DAG */}
        <div className="lg:col-span-2">
          <TaskDAG />
        </div>

        {/* Right column — Agent State */}
        <div>
          <AgentStateDashboard />
        </div>
      </div>

      {/* Memory Browser — full width */}
      <MemoryBrowser />
    </div>
  );
}