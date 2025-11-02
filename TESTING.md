# Testing the Workflow

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Pull environment variables
vercel env pull

# 3. Run test
pnpm run test:manual
```

## Testing Methods

### Method 1: Direct Test Script (Easiest)

```bash
pnpm run test:manual
```

Shows step-by-step progress in terminal with all logs. Edit `test-workflow-manual.ts` to customize the prompt and repository.

### Method 2: Production API

Deploy and test the live API:

```bash
# Deploy
vercel --prod

# Test
curl -X POST https://your-app.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add README section",
    "repoUrl": "https://github.com/user/repo"
  }'

# Check status
curl https://your-app.vercel.app/api/agent?runId=<runId>
```

### Method 3: Vercel Dashboard (Best Visual Console)

1. Deploy: `vercel --prod`
2. Trigger workflow via API
3. View in **Vercel Dashboard → Workflows tab**
   - Step-by-step execution timeline
   - Detailed logs for each step
   - Error inspection and retry capabilities

### Method 4: Without Test File

You can test directly using the workflow function:

```typescript
import { codeModificationWorkflow } from './workflows/codeModification';

const result = await codeModificationWorkflow(
  "Your prompt here",
  "https://github.com/user/repo"
);

console.log(result);
```

## What You'll See

```
🚀 Starting Manual Workflow Test

Step 1: Initialize Sandbox
  → Cloning repository...
  ✓ Sandbox ready

Step 2: Analyze Repository
  → Analyzing structure...
  ✓ Files identified: app/page.tsx

Step 3: Execute Changes
  → Running AI agent...
  ✓ Changes committed

Step 4: Create Pull Request
  → Pushing to GitHub...
  ✓ PR created: https://github.com/user/repo/pull/1

✅ Workflow completed successfully!
```

## Prerequisites

Environment variables in `.env.local`:
```
GITHUB_TOKEN=your_token
OPENAI_API_KEY=your_key
VERCEL_OIDC_TOKEN=auto_pulled
```

## Troubleshooting

**"GITHUB_TOKEN not found"**  
→ Run `vercel env pull`

**"Repository URL not provided"**  
→ Ensure repoUrl is passed to the workflow

**Sandbox 403 error**  
→ Run `vercel env pull` to get VERCEL_OIDC_TOKEN

**PR creation fails**  
→ Verify GitHub token has repo + PR permissions

## Testing Checklist

- [ ] Test with simple homepage modification
- [ ] Test with README update
- [ ] Verify PR created on GitHub
- [ ] Check PR content matches prompt
- [ ] Test error handling (invalid repo)
- [ ] Deploy and test production endpoint
- [ ] View execution in Vercel Dashboard

## No Test File Needed?

**Yes, you can test without `test-workflow-manual.ts`:**

1. **Via API** - Deploy and use curl commands
2. **Via Dashboard** - Trigger and monitor in Vercel UI
3. **Direct Import** - Import and call the workflow function

The test file is just a convenience for local development. In production, workflows are triggered via the API endpoint.

