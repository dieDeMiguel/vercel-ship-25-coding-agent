import { start, getWorkflowRun } from "workflow";
import { codeModificationWorkflow } from "../workflows/codeModification";

interface WorkflowRequest {
  prompt: string;
  repoUrl: string;
  userEmail?: string;
}

interface WorkflowResponse {
  status: "started" | "error";
  runId?: string;
  message: string;
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as WorkflowRequest;
  const { prompt, repoUrl, userEmail } = body;

  // Validate required fields
  if (!prompt || !repoUrl) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: "prompt and repoUrl are required"
      } as WorkflowResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Start the workflow (returns immediately with run ID)
    const { runId } = await start(
      codeModificationWorkflow,
      [prompt, repoUrl, userEmail]
    );
    
    console.log(`Workflow started with runId: ${runId}`);
    
    return new Response(
      JSON.stringify({
        status: "started",
        runId,
        message: "Workflow initiated. Use the runId to check progress."
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
        status: "error",
        error: (error as Error).message
      } as WorkflowResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  
  if (!runId) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: "runId query parameter is required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get workflow run status from Vercel Workflow SDK
    const run = await getWorkflowRun(runId);
    
    return new Response(
      JSON.stringify(run),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}