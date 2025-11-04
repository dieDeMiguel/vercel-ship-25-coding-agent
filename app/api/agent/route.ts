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

interface ErrorResponse {
  error: string;
  errorType?: "validation" | "auth" | "sandbox" | "network" | "github" | "workflow" | "unknown";
  errorCode?: string;
  suggestions?: string[];
}

// Helper to categorize errors
function categorizeError(error: Error | unknown): { type: string; suggestions: string[]; code: string } {
  const errorStr = String(error);
  
  // Auth/Token errors
  if (errorStr.includes("401") || errorStr.includes("Unauthorized") || errorStr.includes("invalid_grant")) {
    return {
      type: "auth",
      code: "INVALID_TOKEN",
      suggestions: [
        "Verify your GitHub token is still valid",
        "Regenerate a new token at github.com/settings/tokens",
        "Check that your token has repo permissions"
      ]
    };
  }
  
  // Sandbox initialization (403 = quota/permission)
  if (errorStr.includes("403") || errorStr.includes("Forbidden") || errorStr.includes("quota")) {
    return {
      type: "sandbox",
      code: "SANDBOX_QUOTA",
      suggestions: [
        "You may have hit the sandbox quota limit",
        "Try again in a few minutes",
        "Contact Vercel support if quota persists"
      ]
    };
  }
  
  // Sandbox initialization (400 = OIDC/config)
  if (errorStr.includes("400") || errorStr.includes("OIDC")) {
    return {
      type: "sandbox",
      code: "SANDBOX_CONFIG",
      suggestions: [
        "Sandbox environment is not properly configured",
        "This is a platform issue - contact Vercel support",
        "Try a different repository"
      ]
    };
  }
  
  // Network/timeout errors
  if (errorStr.includes("timeout") || errorStr.includes("ECONNREFUSED") || errorStr.includes("ETIMEDOUT")) {
    return {
      type: "network",
      code: "NETWORK_TIMEOUT",
      suggestions: [
        "Check your internet connection",
        "Try again - the service may be temporarily unavailable",
        "Check Vercel status page at status.vercel.com"
      ]
    };
  }
  
  // GitHub API errors
  if (errorStr.includes("GitHub") || errorStr.includes("repository") || errorStr.includes("branch")) {
    return {
      type: "github",
      code: "GITHUB_API",
      suggestions: [
        "Verify the repository URL is correct and publicly accessible",
        "Ensure you have push permissions to the repository",
        "Check that the token hasn't been revoked"
      ]
    };
  }
  
  // Retryable workflow errors
  if (errorStr.includes("RetryableError") || errorStr.includes("Max retries")) {
    return {
      type: "workflow",
      code: "MAX_RETRIES",
      suggestions: [
        "The workflow exceeded maximum retry attempts",
        "Try again with a simpler task",
        "Check repository accessibility and permissions"
      ]
    };
  }
  
  // Default
  return {
    type: "unknown",
    code: "UNKNOWN_ERROR",
    suggestions: [
      "Check the error details below",
      "Verify all inputs are correct",
      "Try again or contact support"
    ]
  };
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as WorkflowRequest;
  const { prompt, repoUrl, userEmail, githubToken } = body;

  // Validate required fields
  if (!prompt || !prompt.trim()) {
    return new Response(
      JSON.stringify({
        error: "Instruction cannot be empty",
        errorType: "validation",
        errorCode: "EMPTY_PROMPT",
        suggestions: ["Enter a detailed instruction for what you want to modify"]
      } as ErrorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!repoUrl || !repoUrl.trim()) {
    return new Response(
      JSON.stringify({
        error: "Repository URL is required",
        errorType: "validation",
        errorCode: "EMPTY_REPO_URL",
        suggestions: ["Provide a valid GitHub repository URL"]
      } as ErrorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validate GitHub URL format
  if (!repoUrl.includes("github.com")) {
    return new Response(
      JSON.stringify({
        error: "Invalid repository URL",
        errorType: "validation",
        errorCode: "INVALID_REPO_FORMAT",
        suggestions: [
          "Use a GitHub repository URL (e.g., https://github.com/username/repo)",
          "Repository must be publicly accessible",
          "Ensure the URL is correctly formatted"
        ]
      } as ErrorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!githubToken || !githubToken.trim()) {
    return new Response(
      JSON.stringify({
        error: "GitHub token is required",
        errorType: "auth",
        errorCode: "EMPTY_TOKEN",
        suggestions: [
          "Provide a valid GitHub Personal Access Token",
          "Generate one at github.com/settings/tokens",
          "Token needs repo permissions (read/write)"
        ]
      } as ErrorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log(`[WORKFLOW] Starting workflow for: ${repoUrl}`);
    console.log(`[WORKFLOW] Task: ${prompt}`);
    
    // Start the workflow using workflow/api
    const { runId } = await start(
      codeModificationWorkflow,
      [prompt, repoUrl, userEmail || "", githubToken]
    );
    
    console.log(`[WORKFLOW] Workflow started successfully with runId: ${runId}`);
    
    return new Response(
      JSON.stringify({
        runId,
        message: `Workflow started successfully! We're initializing the sandbox and analyzing your repository. This typically takes 1-3 minutes.`
      } as WorkflowResponse),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[WORKFLOW] Workflow failed:", error);
    
    const errorInfo = categorizeError(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        error: errorMessage || "Failed to start workflow",
        errorType: errorInfo.type,
        errorCode: errorInfo.code,
        suggestions: errorInfo.suggestions
      } as ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

