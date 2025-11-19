import { NextRequest, NextResponse } from "next/server";
import {
  updateWorkflowStatus,
  updateWorkflowStep,
  setWorkflowError,
  completeWorkflow,
} from "@/lib/workflow-status";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, action, stepId, status, error } = body;

    if (!runId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: runId and action" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "updateStep":
        if (!stepId || !status) {
          return NextResponse.json(
            { error: "Missing stepId or status" },
            { status: 400 }
          );
        }
        result = updateWorkflowStep(runId, stepId, status, error);
        break;

      case "setError":
        if (!error) {
          return NextResponse.json(
            { error: "Missing error message" },
            { status: 400 }
          );
        }
        result = setWorkflowError(runId, error, stepId);
        break;

      case "complete":
        result = completeWorkflow(runId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[WORKFLOW-STATUS] Error updating status:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update status",
      },
      { status: 500 }
    );
  }
}

