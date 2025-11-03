"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkflowProgress } from "@/components/workflow-progress";

interface WorkflowResult {
  runId: string;
  message: string;
  error?: string;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [instruction, setInstruction] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: instruction,
          repoUrl: repoUrl,
          userEmail: "",
          githubToken: githubToken,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setResult({ runId: "", message: "", error: data.error || "Failed to start workflow" });
        setLoading(false);
      } else {
        // Set runId immediately to show progress
        setCurrentRunId(data.runId);
        setResult(data);
        // Keep loading true until workflow completes
      }
    } catch (error) {
      setResult({
        runId: "",
        message: "",
        error: error instanceof Error ? error.message : "Failed to start workflow",
      });
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes("github.com");
    } catch {
      return false;
    }
  };

  const canSubmit = repoUrl && instruction && githubToken && isValidUrl(repoUrl) && !loading && !result;

  const handleReset = () => {
    setResult(null);
    setCurrentRunId(null);
    setLoading(false);
    setRepoUrl("");
    setInstruction("");
    setGithubToken("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-white">
            Vercel Workflow Agent
          </h1>
          <p className="text-sm text-gray-500 font-mono">
            AI-powered code modifications via workflows
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Repository URL Input */}
          <div className="space-y-2">
            <label
              htmlFor="repo-url"
              className="block text-xs font-medium text-gray-400 uppercase tracking-wider font-mono"
            >
              Repository URL
            </label>
            <input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className={cn(
                "w-full px-4 py-3 bg-[#111] border rounded-lg",
                "text-white placeholder:text-gray-600 font-mono text-sm",
                "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent",
                "transition-all duration-200",
                repoUrl && !isValidUrl(repoUrl) ? "border-red-500/50" : "border-[#333]"
              )}
              required
            />
            {repoUrl && !isValidUrl(repoUrl) && (
              <p className="text-xs text-red-400 font-mono">
                Please enter a valid GitHub repository URL
              </p>
            )}
          </div>

          {/* Instruction Input */}
          <div className="space-y-2">
            <label
              htmlFor="instruction"
              className="block text-xs font-medium text-gray-400 uppercase tracking-wider font-mono"
            >
              Instruction
            </label>
            <textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Add a footer component with dark mode support..."
              rows={4}
              className={cn(
                "w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg",
                "text-white placeholder:text-gray-600 font-mono text-sm",
                "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent",
                "transition-all duration-200 resize-none"
              )}
              required
            />
          </div>

          {/* GitHub Token Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="github-token"
                className="block text-xs font-medium text-gray-400 uppercase tracking-wider font-mono"
              >
                GitHub Token
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="GitHub token help"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm p-4 space-y-3">
                  <p className="font-semibold text-white">Set up GitHub Personal Access Token</p>
                  <ol className="space-y-2 text-xs list-decimal list-inside">
                    <li>Go to github.com/settings/personal-access-tokens</li>
                    <li>Click "Generate new token"</li>
                    <li>Give it a descriptive name</li>
                    <li>Set repository access to "All repositories"</li>
                    <li className="space-y-1">
                      <span>Add repository permissions:</span>
                      <ul className="list-disc list-inside pl-4 space-y-1">
                        <li>Issues: Read and write</li>
                        <li>Pull requests: Read and write</li>
                        <li>Contents: Read and write</li>
                      </ul>
                    </li>
                    <li>Click "Generate token"</li>
                    <li>Copy the token immediately</li>
                  </ol>
                </TooltipContent>
              </Tooltip>
            </div>
            <input
              id="github-token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="github_pat_33BNI6W4A0MeQIcWSnqF7a_Izxlvmo5IV..."
              className={cn(
                "w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg",
                "text-white placeholder:text-gray-600 font-mono text-sm",
                "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent",
                "transition-all duration-200"
              )}
              required
            />
            <p className="text-xs text-gray-500 font-mono">
              Required for creating PRs and pushing changes.{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white underline transition-colors"
              >
                Generate token →
              </a>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-white/20",
              canSubmit
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-[#111] text-gray-600 cursor-not-allowed border border-[#333]"
            )}
          >
            <span className="font-mono">Execute Workflow</span>
          </button>
        </form>

        {/* Workflow Progress */}
        {loading && currentRunId && (
          <div className="p-6 rounded-lg border border-[#333] bg-[#111] space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-[#333]">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-white font-mono">
                Workflow Running
              </span>
              <code className="ml-auto text-xs text-gray-500 font-mono">
                {currentRunId}
              </code>
            </div>
            <WorkflowProgress 
              runId={currentRunId}
              onComplete={() => setLoading(false)}
            />
          </div>
        )}

        {/* Result Display */}
        {!loading && result && (
          <div
            className={cn(
              "p-6 rounded-lg border space-y-3",
              result.error
                ? "bg-red-500/5 border-red-500/20"
                : "bg-[#111] border-[#333]"
            )}
          >
            {result.error ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-400">
                      Workflow Failed
                    </p>
                    <p className="text-xs text-red-300/80 font-mono">
                      {result.error}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors font-mono py-2 border border-[#333] rounded hover:border-red-500/50"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-400">
                      Workflow Started
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {result.message}
                    </p>
                  </div>
                </div>
                
                {result.runId && (
                  <div className="pt-3 border-t border-[#333] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                        Run ID
                      </span>
                      <code className="text-xs text-white font-mono bg-black px-2 py-1 rounded">
                        {result.runId}
                      </code>
                    </div>
                  </div>
                )}
                
                {!result.error && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors font-mono py-2 border border-[#333] rounded hover:border-[#555]"
                  >
                    Start New Workflow
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-600 font-mono">
            Powered by Vercel Workflows SDK
          </p>
        </div>
      </div>
    </main>
  );
}
