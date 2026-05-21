# NodeAI Controller

Multi-Agent Task Router Dashboard - An AI command center for orchestrating multiple AI agents/providers.

## Overview

NodeAI Controller is a dashboard for controlling a multi-AI node agent system. Users send commands to a GPT Orchestrator which acts as the main controller, dividing tasks among multiple AI/provider/nodes.

### Features

- **Controller Chat Panel** - Send commands to GPT Orchestrator
- **AI Provider / Node Status** - Monitor GPT, Claude, DeepSeek, Kiro, Local Node, Artifact Renderer
- **Task Queue** - View and track task progress
- **Agent Flow Timeline** - Visual flow of agent execution
- **Work Result Panel** - Results from each agent
- **Final GPT Answer** - Aggregated final response
- **Activity Logs** - Real-time execution logs
- **Artifact Preview** - JSON plans, code snippets, reports

### Visual Style

**Theme:** Aqua Pulse Light - A soft, clean, mobile-first design with cyan/aqua accent colors.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- Framer Motion (animations)
- Zustand (state management)
- TanStack Query (ready for API integration)
- Zod (schema validation)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppHeader.tsx
│   ├── ControllerChat.tsx
│   ├── ProviderStatusGrid.tsx
│   ├── ProviderCard.tsx
│   ├── TaskQueue.tsx
│   ├── TaskCard.tsx
│   ├── AgentFlowTimeline.tsx
│   ├── WorkResultPanel.tsx
│   ├── FinalAnswerPanel.tsx
│   ├── ActivityLogs.tsx
│   ├── ArtifactPreview.tsx
│   ├── OrchestratorPlan.tsx
│   ├── StatusBadge.tsx
│   └── ProgressState.tsx
├── lib/
│   ├── mockAgents.ts
│   ├── mockTasks.ts
│   ├── mockResults.ts
│   ├── simulateControllerRun.ts
│   ├── theme.ts
│   └── utils.ts
├── store/
│   └── useControllerStore.ts
├── types/
│   └── index.ts
└── schemas/
    └── orchestratorSchema.ts
```

## Demo Mode

Currently uses mock data. The simulation runs when you click "Send to GPT Controller":

1. GPT Orchestrator receives command
2. Task plan is generated
3. Tasks are assigned to agents
4. Agents execute sequentially with progress
5. Results are collected
6. Final answer is displayed

## Future Integration

The architecture is prepared for real API backends:
- Zod schemas validate API responses
- Zustand store is ready for async actions
- TanStack Query can be wired to API endpoints
- No API keys stored in frontend

## Important Notes

- This is NOT a trading bot or radar coin tool
- This is an AI controller dashboard
- All data is mock for MVP phase
- API keys should only be stored on backend
