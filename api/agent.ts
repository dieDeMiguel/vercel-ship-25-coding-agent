import { codeModificationWorkflow } from "../workflows/codeModification.js";

interface WorkflowRequest {
  prompt: string;
  repoUrl: string;
  userEmail?: string;
}

interface WorkflowResponse {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  changes?: any;
  analysis?: any;
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as WorkflowRequest;
  const { prompt, repoUrl, userEmail } = body;

  // Validate required fields
  if (!prompt || !repoUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "prompt and repoUrl are required"
      } as WorkflowResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Execute the workflow directly
    const result = await codeModificationWorkflow(prompt, repoUrl, userEmail);
    
    console.log(`Workflow completed successfully`);
    
    return new Response(
      JSON.stringify(result as WorkflowResponse),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Workflow failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      } as WorkflowResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}