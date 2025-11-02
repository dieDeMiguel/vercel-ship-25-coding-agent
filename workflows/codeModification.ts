import { 
  initializeSandbox, 
  analyzeRepository,
  executeChanges,
  createPullRequest,
  notifyUser 
} from "./steps";

export async function codeModificationWorkflow(
  prompt: string, 
  repoUrl: string,
  userEmail?: string
) {
  "use workflow";

  // Step 1: Initialize sandbox with repo (returns only serializable data)
  const { repoUrl: validatedRepoUrl, repoInfo } = await initializeSandbox(repoUrl);
  
  // Step 2: Analyze repo structure (recreates sandbox internally)
  const { filesToModify, analysis } = await analyzeRepository(
    validatedRepoUrl, 
    prompt, 
    repoInfo
  );
  
  // Step 3: Execute the AI-driven changes (recreates sandbox internally)
  const { changes, branch } = await executeChanges(
    validatedRepoUrl,
    prompt,
    filesToModify
  );
  
  // Step 4: Create PR on GitHub (recreates sandbox internally)
  const { prUrl, prNumber } = await createPullRequest(
    validatedRepoUrl,
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
