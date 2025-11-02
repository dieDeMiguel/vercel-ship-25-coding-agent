# AI SDK 5 Coding Agent with Vercel Workflow SDK

Advanced coding agent built with AI SDK 5, Vercel AI Gateway, Vercel Sandbox, and Vercel Workflow SDK. It can read and modify GitHub repositories with automatic retries, state persistence, and full observability.

## Documentation

- **[WORKFLOW_MIGRATION.md](./WORKFLOW_MIGRATION.md)** - Migration guide and advantages
- **[TESTING.md](./TESTING.md)** - How to test the workflow

## Quick Start

### Prerequisites
- Vercel account
- GitHub Personal Access Token (with repo, issues, and pull request permissions)
- OpenAI API key

### Setup

1. Install the Vercel CLI: `npm i -g vercel`
2. Deploy this repo: Click "Deploy" button or `vercel --prod`
3. Clone the new repo locally: `git clone <repo-url>`
4. Link to Vercel project: `vercel link`
5. Pull environment variables: `vercel env pull`
6. Install dependencies: `pnpm install`
7. Start dev server: `vercel dev`

### Environment Variables

Set these in your `.env.local`:
```
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_key
```

## API Usage

### Start a Workflow

```bash
curl -X POST https://your-deployment.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add a footer to the homepage that says Built with AI",
    "repoUrl": "https://github.com/your-username/your-repo",
    "userEmail": "you@example.com"
  }'
```

Response:
```json
{
  "runId": "run_abc123xyz",
  "message": "Workflow started. Track progress in Vercel Dashboard under Workflows tab."
}
```

### Track Workflow Progress

Go to **Vercel Dashboard → Project → Workflows** tab to:
- See real-time execution of each step
- View detailed logs
- Monitor sandbox operations
- Check PR creation status

## Architecture

The coding agent uses a 5-step workflow:

1. **Initialize Sandbox** - Clone repository and setup environment
2. **Analyze Repository** - Determine files to modify based on prompt
3. **Execute Changes** - Run AI agent to make modifications
4. **Create Pull Request** - Push changes and create PR on GitHub
5. **Notify User** - Send completion notification (optional)

Each step includes automatic retries, comprehensive error handling, and state persistence.

## Features

- Automatic retries with exponential backoff
- State persistence across step failures
- Full observability in Vercel dashboard
- No timeout constraints for long-running operations
- Type-safe TypeScript implementation
- Comprehensive error logging
- Support for custom notifications

## Workflow Benefits

| Feature | Benefit |
|---------|---------|
| Automatic Retries | No more manual re-runs on transient failures |
| State Persistence | Resume workflows from last successful step |
| Step Observability | Debug exactly where workflows fail |
| No Timeouts | Handle long-running git operations |
| Scalability | Manage thousands of concurrent workflows |

## Project Structure

```
vercel-ship-25-coding-agent/
├── api/
│   └── agent.ts              # Workflow API endpoints
├── workflows/
│   ├── codeModification.ts   # Main workflow definition
│   └── steps.ts              # Individual step implementations
├── utils/
│   ├── agent.ts              # AI agent logic
│   ├── sandbox.ts            # Sandbox operations
│   └── test.ts               # Test utilities
├── WORKFLOW_API.md           # API documentation
├── MIGRATION_GUIDE.md        # Transformation details
└── package.json              # Dependencies
```

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Please follow existing code style and include tests.

## License

ISC

## Resources

- [Vercel Workflow SDK Docs](https://vercel.com/docs/workflows)
- [Vercel Sandbox Docs](https://vercel.com/docs/sandbox)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [GitHub API Reference](https://docs.github.com/en/rest) 