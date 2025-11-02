import { 
  initializeSandbox, 
  analyzeRepository,
  executeChanges,
  createPullRequest,
  notifyUser 
} from "./steps.js";

export async function codeModificationWorkflow(
  prompt: string, 
  repoUrl: string,
  userEmail?: string
) {
  "use workflow";

  // Step 1: Initialize sandbox with repo
  const { sandbox, repoInfo } = await initializeSandbox(repoUrl);
  
  // Step 2: Analyze repo structure (determine what files need changing)
  const { filesToModify, analysis } = await analyzeRepository(
    sandbox, 
    prompt, 
    repoInfo
  );
  
  // Step 3: Execute the AI-driven changes
  const { changes, branch } = await executeChanges(
    sandbox,
    prompt,
    filesToModify
  );
  
  // Step 4: Create PR on GitHub
  const { prUrl, prNumber } = await createPullRequest(
    sandbox,
    repoUrl,
    branch,
    changes
  );
  
  // Step 5: Optional - notify user (with retry logic built-in)
  if (userEmail) {
    await notifyUser({
      email: userEmail,
      prUrl,
      changes,
      status: 'completed'
    });
  }

  return { 
    success: true, 
    prUrl, 
    prNumber, 
    changes,
    analysis 
  };
}
