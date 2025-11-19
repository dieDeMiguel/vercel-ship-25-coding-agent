import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getWorkflowStatus } from "@/lib/workflow-status";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  try {
    const status = getWorkflowStatus(runId);
    
    if (!status) {
      return NextResponse.json(
        { error: "Workflow run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("[WORKFLOW-STREAM] Error fetching workflow status:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch workflow status",
      },
      { status: 500 }
    );
  }
}

