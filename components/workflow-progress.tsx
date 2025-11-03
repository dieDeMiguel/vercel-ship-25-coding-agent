"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number;
  startTime?: number;
}

interface WorkflowProgressProps {
  runId: string;
  onComplete?: () => void;
}

const WORKFLOW_STEPS = [
  { id: "initializeSandbox", name: "Initialize Sandbox", estimatedDuration: 5000 },
  { id: "analyzeRepository", name: "Analyze Repository", estimatedDuration: 3000 },
  { id: "executeChanges", name: "Execute AI Changes", estimatedDuration: 30000 },
  { id: "createPullRequest", name: "Create Pull Request", estimatedDuration: 15000 },
];

export function WorkflowProgress({ runId, onComplete }: WorkflowProgressProps) {
  const [steps, setSteps] = useState<Step[]>(
    WORKFLOW_STEPS.map((step) => ({
      ...step,
      status: "pending" as const,
    }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (currentStepIndex >= WORKFLOW_STEPS.length) {
      onComplete?.();
      return;
    }

    const currentStep = WORKFLOW_STEPS[currentStepIndex];
    const stepStartTime = Date.now();

    // Mark current step as running
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === currentStepIndex
          ? { ...step, status: "running", startTime: stepStartTime }
          : step
      )
    );

    // Simulate step completion after estimated duration
    const timer = setTimeout(() => {
      const duration = Date.now() - stepStartTime;
      
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStepIndex
            ? { ...step, status: "completed", duration }
            : step
        )
      );

      setCurrentStepIndex((prev) => prev + 1);
    }, currentStep.estimatedDuration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, onComplete]);

  const totalDuration = Date.now() - startTime;

  return (
    <div className="space-y-6">
      {/* Timeline Visual */}
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#333]" />
        
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isRunning = step.status === "running";
            const isPending = step.status === "pending";

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Status Indicator */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                      isCompleted && "border-green-500 bg-green-500/20",
                      isRunning && "border-blue-500 bg-blue-500/20 animate-pulse",
                      isPending && "border-[#333] bg-[#111]"
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
                  </div>
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0 pb-8">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-mono transition-colors",
                        isCompleted && "text-green-400",
                        isRunning && "text-blue-400",
                        isPending && "text-gray-500"
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
                  </div>

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

      {/* Summary */}
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
    </div>
  );
}

