// Utility to track workflow status by monitoring workflow lifecycle
// This runs separately from the workflow itself to avoid serialization issues

import { updateWorkflowStep, setWorkflowError, completeWorkflow } from "@/lib/workflow-status";

// Store original console.error to intercept workflow errors
const originalConsoleError = console.error;
let errorInterceptorInstalled = false;

// Install error interceptor once
function installErrorInterceptor() {
  if (errorInterceptorInstalled) return;
  errorInterceptorInstalled = true;
  
  console.error = function(...args: any[]) {
    // Call original console.error
    originalConsoleError.apply(console, args);
    
    // Check if this is a workflow error
    const errorStr = args.join(" ");
    
    // Detect workflow failures
    if (errorStr.includes("FatalError while running") || errorStr.includes("Encountered `Error`")) {
      // Extract runId from error message
      const runIdMatch = errorStr.match(/wrun_[\w]+/);
      if (runIdMatch) {
        const runId = runIdMatch[0];
        
        // Extract error message
        let errorMessage = "Workflow failed";
        if (errorStr.includes("RetryableError:")) {
          const errorMatch = errorStr.match(/RetryableError: (.+?)(?:\n|$)/);
          if (errorMatch) errorMessage = errorMatch[1];
        } else if (errorStr.includes("FatalError:")) {
          const errorMatch = errorStr.match(/FatalError: (.+?)(?:\n|$)/);
          if (errorMatch) errorMessage = errorMatch[1];
        }
        
        // Update workflow status
        const failedStep = detectFailedStep(errorMessage);
        console.log(`[WORKFLOW-TRACKER] Detected workflow failure for ${runId}: ${errorMessage}`);
        setWorkflowError(runId, errorMessage, failedStep);
      }
    }
  };
}

// Monitor workflow by polling and checking for errors
export async function monitorWorkflow(runId: string) {
  // Install error interceptor to catch workflow failures
  installErrorInterceptor();
  
  // Start monitoring after a short delay
  setTimeout(async () => {
    await trackWorkflowProgress(runId);
  }, 1000);
}

async function trackWorkflowProgress(runId: string) {
  // This function will monitor the workflow's progress
  // We update steps optimistically but watch for failures
  
  const stepSequence = [
    { id: "initializeSandbox", delay: 500, timeout: 10000 }, // 10s timeout for init
    { id: "analyzeRepository", delay: 5000, timeout: 15000 }, // 15s timeout
    { id: "executeChanges", delay: 8000, timeout: 60000 }, // 60s timeout for AI changes
    { id: "createPullRequest", delay: 35000, timeout: 30000 }, // 30s timeout for PR
  ];

  const { getWorkflowStatus } = await import("@/lib/workflow-status");
  
  for (let i = 0; i < stepSequence.length; i++) {
    const step = stepSequence[i];
    await new Promise(resolve => setTimeout(resolve, step.delay));
    
    // Check if workflow has already failed
    const status = getWorkflowStatus(runId);
    if (status?.status === "failed") {
      console.log(`[WORKFLOW-TRACKER] Workflow ${runId} already failed, stopping monitoring`);
      break;
    }
    
    // Mark current step as running
    updateWorkflowStep(runId, step.id, "running");
    
    // Set timeout to detect if step hangs
    const timeoutId = setTimeout(() => {
      const currentStatus = getWorkflowStatus(runId);
      if (currentStatus?.status === "running") {
        // Check if step is still running after timeout
        const currentStep = currentStatus.steps.find(s => s.id === step.id);
        if (currentStep?.status === "running") {
          console.warn(`[WORKFLOW-TRACKER] Step ${step.id} exceeded timeout, may have failed`);
          // Don't mark as failed here as it might just be slow
        }
      }
    }, step.timeout);
    
    // Clean up timeout if we move to next step
    setTimeout(() => clearTimeout(timeoutId), step.timeout + step.delay);
  }
  
  // After all steps, check final status
  setTimeout(() => {
    const finalStatus = getWorkflowStatus(runId);
    if (finalStatus?.status === "running") {
      // If still running after all steps, assume it completed
      console.log(`[WORKFLOW-TRACKER] Workflow ${runId} appears to have completed`);
      completeWorkflow(runId);
    }
  }, 5000); // Wait 5s after last step
}

// Parse error messages to determine which step failed
export function detectFailedStep(errorMessage: string): string | undefined {
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes("sandbox") || lowerError.includes("403") || lowerError.includes("initialization")) {
    return "initializeSandbox";
  } else if (lowerError.includes("analyz") || lowerError.includes("repository") || lowerError.includes("structure")) {
    return "analyzeRepository";
  } else if (lowerError.includes("changes") || lowerError.includes("execute") || lowerError.includes("modification")) {
    return "executeChanges";
  } else if (lowerError.includes("pr") || lowerError.includes("pull request") || lowerError.includes("github")) {
    return "createPullRequest";
  }
  
  return undefined;
}

// Call this when workflow fails to update status
export function handleWorkflowError(runId: string, error: Error) {
  const errorMessage = error.message;
  const failedStep = detectFailedStep(errorMessage);
  
  console.error(`[WORKFLOW-TRACKER] Workflow ${runId} failed:`, errorMessage);
  console.error(`[WORKFLOW-TRACKER] Failed step: ${failedStep || "unknown"}`);
  
  setWorkflowError(runId, errorMessage, failedStep);
}

// Call this when workflow completes successfully
export function handleWorkflowSuccess(runId: string) {
  console.log(`[WORKFLOW-TRACKER] Workflow ${runId} completed successfully`);
  completeWorkflow(runId);
}

