import { codingAgent } from "../utils/agent";

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt }: { prompt: string } = body;

  try {
    const result = await codingAgent(prompt);
    return new Response(JSON.stringify({ result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
