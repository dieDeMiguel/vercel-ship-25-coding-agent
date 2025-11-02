# Workflow SDK Migration

This project has been transformed from direct execution to **Vercel Workflow SDK** architecture.

## What Changed

### Before (Direct Execution)
```
POST /api/agent → Waits for completion → Returns result
```
- Single function execution
- 10 second timeout limit
- No retries on failure
- No state persistence

### After (Workflow SDK)
```
POST /api/agent → Returns runId (HTTP 202) → Track in Dashboard
```
- 5-step workflow with automatic state management
- Async execution (doesn't block the API response)
- Automatic retries with exponential backoff
- **Full observability in Vercel Workflows Dashboard**
- Long-running execution (up to 5 minutes per step)

## Workflow Steps

1. **Initialize Sandbox** - Clone repository and setup environment
2. **Analyze Repository** - Determine which files to modify
3. **Execute Changes** - Run AI agent to make modifications
4. **Create Pull Request** - Push changes and create GitHub PR
5. **Notify User** - Send notification (optional)

## Key Advantages

| Feature | Before | After |
|---------|--------|-------|
| **Timeout Risk** | High (10s limit) | None (unlimited) |
| **Retries** | Manual | Automatic |
| **State** | Lost on failure | Persisted |
| **Observability** | Limited logs | Full dashboard |
| **Type Safety** | Partial | 100% TypeScript |

## File Structure

```
workflows/
├── codeModification.ts   # Main workflow orchestrator
└── steps.ts              # Individual step implementations

api/
└── agent.ts              # Workflow API endpoints (POST/GET)
```

## Environment Variables

Required in `.env.local`:
```
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_key
VERCEL_OIDC_TOKEN=auto_pulled_by_vercel_cli
```

## Dependencies

- `workflow: ^4.0.1-beta.2` - Vercel Workflow SDK
- `@vercel/sandbox: ^0.0.10` - Sandbox environment
- `ai: ^5.0.86` - AI SDK for agent logic
- `zod: ^4.1.12` - Schema validation

## API Usage

### Execute Workflow
```bash
curl -X POST https://your-app.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add README section",
    "repoUrl": "https://github.com/user/repo",
    "userEmail": "you@example.com"
  }'
```

Response (HTTP 202):
```json
{
  "runId": "run_abc123xyz",
  "message": "Workflow started. Track progress in Vercel Dashboard under Workflows tab."
}
```

**Track Progress:**
- Go to Vercel Dashboard → Your Project → **Workflows** tab
- Find your workflow run by `runId`
- View real-time step execution
- See detailed logs and errors
- Check final PR URL when complete

## Deployment

```bash
# Install dependencies
pnpm install

# Deploy to production
vercel --prod

# View workflows in Vercel Dashboard
# Project → Workflows tab
```

## Benefits Summary

✓ **Reliability** - Automatic retries prevent transient failures  
✓ **Scalability** - Handle long-running git operations  
✓ **Observability** - Debug with step-by-step execution logs  
✓ **State Persistence** - Resume from last successful step  
✓ **Production Ready** - Enterprise-grade error handling

