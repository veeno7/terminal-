# 02 - The Cognition Loop

The Cognition Loop is the fundamental operational cycle of CortexForge. Unlike a standard request-response chatbot, CortexForge operates in a persistent loop, continuously processing information, making decisions, and acting upon its environment.

## The Five-Stage Cycle

The heartbeat of the agent consists of five distinct stages that execute sequentially within a single "thought" cycle:

### 1. Perception
The agent monitors various input channels to update its awareness of the environment.
- **Inbound Streams**: User messages, system alerts, scheduled triggers, and webhook events.
- **Environment Scanning**: Checking for changes in connected services (e.g., a new email, a failed build).
- **Internal Sensation**: Monitoring resource limits (token usage, battery/compute) and emotional/motivational state.

### 2. Reasoning
The agent processes perceived data through its current cognitive context.
- **Context Synthesis**: Combining new perceptions with **Working Memory**.
- **Intent Analysis**: Determining what needs to be done. Is there a new goal? Has an existing goal changed?
- **State Introspection**: Checking identity, preferences, and long-term goals to ensure alignment.

### 3. Planning
High-level intents are translated into executable steps.
- **Goal Decomposition**: Breaking a goal into a Task Dependency Graph.
- **Resource Allocation**: Choosing which skills are needed.
- **Strategy Selection**: Deciding whether to act immediately, research first, or wait for more information.

### 4. Execution
The agent performs the planned actions.
- **Skill Invocation**: Calling external APIs, running scripts, or interacting with the filesystem.
- **Parallel Execution**: Managing multiple non-blocking tasks simultaneously.
- **Tool Feedback**: Capturing the raw output and status (success/failure) of the action.

### 5. Reflection
The agent evaluates the results of its actions.
- **Outcome Assessment**: Did the execution move the agent closer to the goal?
- **Memory Consolidation**: Saving the experience to **Episodic Memory**.
- **Self-Correction**: Identifying errors in reasoning or planning and updating the internal strategy for the next loop.

---

## Persistent Operation & "Aliveness"

CortexForge is designed to run indefinitely as a background service. It exhibits behaviors that simulate a "living" system:

### 1. The Heartbeat (Active Loop)
When a goal is active, the loop runs at high frequency, reacting to every perception and tool output.

### 2. Idle State & Background Reflection
When no active tasks exist, the agent does not simply stop. It enters a "Low-Power Reflection" mode:
- **Environmental Curiosity**: It periodically checks its environment (e.g., "Is there any new news in my research field?") without being asked.
- **Self-Optimization**: It reviews its own recent logs to find efficiency gains.

### 3. The "Sleep" Cycle (Memory Consolidation)
Periodically (or when compute resources are cheap), the agent enters a "Dream" state:
- **Pruning**: Removing redundant episodic memories.
- **Synthesis**: Moving important episodic patterns into **Semantic Memory**.
- **Refinement**: "Compiling" successful execution paths into **Procedural Memory**.
- **Self-Report**: Generating a "Morning Briefing" for the owner summarizing what it learned while they were away.

## Dual-Model Reasoning Strategy
The loop dynamically selects its LLM backend based on task complexity:
- **Reflexive Actions (Groq)**: Low-latency responses, simple tool calls, and perception filtering.
- **Deep Deliberation (OpenAI)**: Complex planning, structural reflection, and architectural decisions.

## Concurrency & Interrupts

### Concurrency Model
The core loop is single-threaded to maintain cognitive consistency, but it manages an asynchronous **Task Pool**.
- The loop can initiate multiple "background" tasks (e.g., a long-running data crawl).
- Subsequent loops check the status of these tasks during the **Perception** phase.

### Interrupt Handling
High-priority events (e.g., a "STOP" command from the user) can trigger an **Immediate Interrupt**.
- The current execution is paused or aborted safely.
- The **Reasoning** phase is bypassed to jump straight to a dedicated **Emergency Plan**.

## Decision Logic: Act vs. Wait vs. Explore
The agent uses a "Curiosity vs. Utility" heuristic:
- **Act**: High confidence in the plan and clear path to the goal.
- **Wait**: Dependency on external feedback or time-based trigger.
- **Explore**: Low confidence or missing information; triggers a research or trial-and-error sub-goal.
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
