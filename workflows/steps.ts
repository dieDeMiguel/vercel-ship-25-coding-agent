import { FatalError, RetryableError } from "workflow";
import { 
  createSandbox, 
  listFiles, 
  createPR 
} from "../utils/sandbox";
import { codingAgent } from "../utils/agent";

interface AnalysisResult {
  prompt: string;
  repoInfo: string;
  rootStructure: string;
  suggestedFiles: string[];
  timestamp: string;
}

interface Changes {
  prompt: string;
  filesModified: string[];
  branch: string;
  timestamp: string;
  agentResponse: string;
}

interface NotificationData {
  email: string;
  prUrl: string;
  changes: Changes;
  status: string;
}

export async function initializeSandbox(repoUrl: string) {
  "use step";
  
  try {
    console.log(`Initializing sandbox for repository: ${repoUrl}`);
    const sandbox = await createSandbox(repoUrl);
    
    const repoInfoResult = await sandbox.runCommand("git", ["remote", "-v"]);
    const repoInfo = await repoInfoResult.output();
    
    console.log(`Sandbox initialized successfully`);
    console.log(`Repository info: ${repoInfo}`);
    
    // ✅ FIX: Only return serializable data (strings), not the Sandbox instance
    return { 
      repoUrl,  // Return the URL so we can recreate sandbox in next steps
      repoInfo: repoInfo.toString() 
    };
  } catch (error) {
    const err = error as Error;
    console.error(`Sandbox initialization failed: ${err.message}`);
    
    // If it's a 400 error (auth/quota issue), don't retry
    if (err.message.includes('400')) {
      throw new FatalError(
        `Sandbox initialization failed with 400 error. ` +
        `This is likely due to: ` +
        `1) Missing VERCEL_OIDC_TOKEN, ` +
        `2) Sandbox quota exceeded, or ` +
        `3) Invalid repository URL. ` +
        `Error: ${err.message}`
      );
    }
    
    // ✅ FIX: Use RetryableError to let SDK handle retries automatically
    throw new RetryableError(`Failed to initialize sandbox: ${err.message}`);
  }
}

export async function analyzeRepository(
  repoUrl: string,
  prompt: string,
  repoInfo: string
) {
  "use step";
  
  try {
    console.log(`Analyzing repository structure for prompt: "${prompt}"`);
    
    // ✅ FIX: Recreate sandbox from repoUrl instead of receiving instance
    const sandbox = await createSandbox(repoUrl);
    
    // List root directory to understand project structure
    const rootFiles = await listFiles(sandbox, ".");
    
    // Determine likely files to modify based on prompt keywords
    const filesToModify = determineFilesToModify(prompt);
    
    const analysis: AnalysisResult = {
      prompt,
      repoInfo,
      rootStructure: rootFiles.toString(),
      suggestedFiles: filesToModify,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Repository analysis complete. Suggested files to modify:`, filesToModify);
    
    return { 
      filesToModify, 
      analysis 
    };
  } catch (error) {
    console.error(`Repository analysis failed: ${(error as Error).message}`);
    
    // Use RetryableError for transient failures
    if ((error as Error).message.includes('400')) {
      throw new FatalError(`Failed to analyze repository: ${(error as Error).message}`);
    }
    throw new RetryableError(`Failed to analyze repository: ${(error as Error).message}`);
  }
}

export async function executeChanges(
  repoUrl: string,
  prompt: string,
  filesToModify: string[]
) {
  "use step";
  
  try {
    console.log(`Executing AI-driven changes for: "${prompt}"`);
    console.log(`Target files: ${filesToModify.join(", ")}`);
    
    // ✅ FIX: Recreate sandbox from repoUrl
    const sandbox = await createSandbox(repoUrl);
    
    // Run the coding agent to determine and execute changes
    const { response } = await codingAgent(prompt);
    
    console.log(`AI agent response: ${response}`);
    
    // Commit the changes
    const branch = `ai-change-${Date.now()}`;
    
    try {
      await sandbox.runCommand("git", ["add", "."]);
      await sandbox.runCommand("git", ["commit", "-m", `AI: ${prompt.substring(0, 50)}`]);
      await sandbox.runCommand("git", ["checkout", "-b", branch]);
    } catch (gitError) {
      console.warn(`Git operations warning: ${(gitError as Error).message}`);
    }
    
    const changes: Changes = {
      prompt,
      filesModified: filesToModify,
      branch,
      timestamp: new Date().toISOString(),
      agentResponse: response
    };
    
    console.log(`Changes executed successfully on branch: ${branch}`);
    
    return { changes, branch };
  } catch (error) {
    console.error(`Change execution failed: ${(error as Error).message}`);
    
    // Use RetryableError for transient failures
    if ((error as Error).message.includes('400')) {
      throw new FatalError(`Failed to execute changes: ${(error as Error).message}`);
    }
    throw new RetryableError(`Failed to execute changes: ${(error as Error).message}`);
  }
}

export async function createPullRequest(
  repoUrl: string,
  branch: string,
  changes: Changes
) {
  "use step";
  
  try {
    console.log(`Creating pull request for branch: ${branch}`);
    
    // ✅ FIX: Recreate sandbox from repoUrl
    const sandbox = await createSandbox(repoUrl);
    
    const prDetails = {
      title: `AI Change: ${changes.prompt.substring(0, 60)}`,
      body: `Automated changes by coding agent.\n\nPrompt: ${changes.prompt}\n\nFiles modified: ${changes.filesModified.join(", ")}`,
      branch: branch
    };
    
    const result = await createPR(sandbox, repoUrl, prDetails);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    console.log(`Pull request created successfully: ${result.pr_url}`);
    
    return { 
      prUrl: result.pr_url, 
      prNumber: result.pr_number 
    };
  } catch (error) {
    console.error(`Pull request creation failed: ${(error as Error).message}`);
    
    // Use RetryableError for transient failures
    if ((error as Error).message.includes('400') || (error as Error).message.includes('authentication')) {
      throw new FatalError(`Failed to create PR: ${(error as Error).message}`);
    }
    throw new RetryableError(`Failed to create PR: ${(error as Error).message}`);
  }
}

export async function notifyUser(data: NotificationData) {
  "use step";
  
  try {
    console.log(`Sending notification to: ${data.email}`);
    
    const notification = {
      to: data.email,
      subject: "AI Coding Agent - Changes Complete",
      body: `
Your coding agent workflow has completed successfully!

Status: ${data.status}
Pull Request: ${data.prUrl}
Files Modified: ${data.changes.filesModified.join(", ")}

Review and merge your changes at the link above.
      `.trim(),
      timestamp: new Date().toISOString()
    };
    
    // In a real implementation, this would call Resend, SendGrid, or similar
    console.log(`Notification prepared:`, notification);
    
    return { 
      status: "sent", 
      notificationId: `notif_${Date.now()}` 
    };
  } catch (error) {
    console.error(`Notification failed: ${(error as Error).message}`);
    throw new FatalError(`Failed to notify user: ${(error as Error).message}`);
  }
}

// Helper function to determine which files to modify based on prompt
function determineFilesToModify(prompt: string): string[] {
  const promptLower = prompt.toLowerCase();
  const suggestedFiles: string[] = [];
  
  if (promptLower.includes("homepage") || promptLower.includes("page")) {
    suggestedFiles.push("app/page.tsx", "index.tsx", "pages/index.tsx");
  }
  
  if (promptLower.includes("component") || promptLower.includes("button")) {
    suggestedFiles.push("components/", "src/components/");
  }
  
  if (promptLower.includes("style") || promptLower.includes("css")) {
    suggestedFiles.push("styles/", "app/globals.css");
  }
  
  if (promptLower.includes("readme")) {
    suggestedFiles.push("README.md");
  }
  
  if (promptLower.includes("package") || promptLower.includes("dependency")) {
    suggestedFiles.push("package.json");
  }
  
  return suggestedFiles.length > 0 ? suggestedFiles : ["app/", "src/"];
}
