import { start } from "workflow/api";
import { codeModificationWorkflow } from "../../../workflows/codeModification";

interface WorkflowRequest {
  prompt: string;
  repoUrl: string;
  userEmail?: string;
  githubToken: string;
}

interface WorkflowResponse {
  runId: string;
  message: string;
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as WorkflowRequest;
  const { prompt, repoUrl, userEmail, githubToken } = body;

  // Validate required fields
  if (!prompt || !repoUrl) {
    return new Response(
      JSON.stringify({
        error: "prompt and repoUrl are required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!githubToken) {
    return new Response(
      JSON.stringify({
        error: "githubToken is required for creating PRs and pushing changes"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Start the workflow using workflow/api
    // ✅ FIX: Use array syntax for arguments (like contact-agent)
    // ✅ FIX: Pass empty string instead of undefined for userEmail to avoid serialization issues
    const { runId } = await start(
      codeModificationWorkflow,
      [prompt, repoUrl, userEmail || "", githubToken]
    );
    
    console.log(`Workflow started with runId: ${runId}`);
    
    return new Response(
      JSON.stringify({
        runId,
        message: `Workflow started. Track progress in Vercel Dashboard under Workflows tab.`
      } as WorkflowResponse),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to start workflow:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

