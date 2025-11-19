"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number;
  startTime?: number;
  error?: string;
}

interface WorkflowProgressProps {
  runId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const WORKFLOW_STEPS = [
  { id: "initializeSandbox", name: "Initialize Sandbox" },
  { id: "analyzeRepository", name: "Analyze Repository" },
  { id: "executeChanges", name: "Execute AI Changes" },
  { id: "createPullRequest", name: "Create Pull Request" },
];

interface WorkflowStatus {
  runId: string;
  status: string;
  error?: {
    message: string;
    step?: string;
  };
  steps?: Array<{
    id: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export function WorkflowProgress({ runId, onComplete, onError }: WorkflowProgressProps) {
  const [steps, setSteps] = useState<Step[]>(
    WORKFLOW_STEPS.map((step) => ({
      ...step,
      status: "pending" as const,
    }))
  );
  const [workflowStatus, setWorkflowStatus] = useState<string>("running");
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const fetchWorkflowStatus = async () => {
      try {
        const response = await fetch(`/api/workflow-stream/${runId}`);
        
        if (!response.ok) {
          console.error("Failed to fetch workflow status:", response.statusText);
          return;
        }

        const data: WorkflowStatus = await response.json();
        
        setWorkflowStatus(data.status);

        // Update steps based on workflow response
        if (data.steps && data.steps.length > 0) {
          setSteps((prevSteps) =>
            prevSteps.map((step) => {
              const workflowStep = data.steps?.find((s) => s.id === step.id);
              if (workflowStep) {
                return {
                  ...step,
                  status: workflowStep.status as Step["status"],
                  error: workflowStep.error,
                  startTime: workflowStep.startedAt ? new Date(workflowStep.startedAt).getTime() : undefined,
                  duration: workflowStep.completedAt && workflowStep.startedAt
                    ? new Date(workflowStep.completedAt).getTime() - new Date(workflowStep.startedAt).getTime()
                    : undefined,
                };
              }
              return step;
            })
          );
        }

        // Handle workflow completion
        if (data.status === "completed") {
          setIsCompleted(true);
          clearInterval(pollInterval);
          onComplete?.();
        }

        // Handle workflow failure
        if (data.status === "failed" || data.error) {
          setIsFailed(true);
          const errorMessage = data.error?.message || "Workflow failed";
          setWorkflowError(errorMessage);
          
          // Mark the failed step
          if (data.error?.step) {
            setSteps((prevSteps) =>
              prevSteps.map((step) =>
                step.id === data.error?.step
                  ? { ...step, status: "failed" as const, error: errorMessage }
                  : step
              )
            );
          }
          
          clearInterval(pollInterval);
          onError?.(errorMessage);
        }
      } catch (error) {
        console.error("Error polling workflow status:", error);
      }
    };

    // Initial fetch
    fetchWorkflowStatus();

    // Poll every 2 seconds
    pollInterval = setInterval(fetchWorkflowStatus, 2000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [runId, onComplete, onError]);

  const totalDuration = Date.now() - startTime;

  return (
    <div className="space-y-6">
      {/* Timeline Visual */}
      <div className="relative">
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isRunning = step.status === "running";
            const isPending = step.status === "pending";
            const isFailed = step.status === "failed";
            const isLastStep = index === steps.length - 1;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Vertical Line - only show if not the last step */}
                {!isLastStep && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#333]" />
                )}
                
                {/* Status Indicator */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                      isCompleted && "border-green-500 bg-green-500/20",
                      isRunning && "border-blue-500 bg-blue-500/20 animate-pulse",
                      isPending && "border-[#333] bg-[#111]",
                      isFailed && "border-red-500 bg-red-500/20"
                    )}
                  >
                    {isCompleted && (
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {isRunning && (
                      <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                    )}
                    {isPending && (
                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                    )}
                    {isFailed && (
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Step Info */}
                <div className={cn("flex-1 min-w-0", !isLastStep && "pb-8")}>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-mono transition-colors",
                        isCompleted && "text-green-400",
                        isRunning && "text-blue-400",
                        isPending && "text-gray-500",
                        isFailed && "text-red-400"
                      )}
                    >
                      {step.name}
                    </span>
                    {step.duration && (
                      <span className="text-xs text-gray-500 font-mono">
                        {(step.duration / 1000).toFixed(2)}s
                      </span>
                    )}
                    {isRunning && (
                      <span className="text-xs text-blue-400 font-mono animate-pulse">
                        Running...
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-xs text-red-400 font-mono">
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Error Message for Failed Step */}
                  {isFailed && step.error && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300 font-mono">
                      {step.error}
                    </div>
                  )}

                  {/* Progress Bar for Running Step */}
                  {isRunning && (
                    <div className="mt-2 h-1 bg-[#333] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-progress-bar" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Message */}
      {isCompleted && !isFailed && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-400">
                Workflow Completed Successfully!
              </h3>
              <p className="text-xs text-green-300/70 mt-1">
                All steps completed in {(totalDuration / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failure Message */}
      {isFailed && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-400">
                Workflow Failed
              </h3>
              {workflowError && (
                <p className="text-xs text-red-300/70 mt-1 font-mono">
                  {workflowError}
                </p>
              )}
              <p className="text-xs text-red-300/50 mt-2">
                Failed after {(totalDuration / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {!isCompleted && !isFailed && (
        <div className="flex items-center justify-between pt-4 border-t border-[#333]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-mono">
              Workflow in progress
            </span>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {(totalDuration / 1000).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
}

