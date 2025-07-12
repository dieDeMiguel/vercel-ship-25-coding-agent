import { codingAgent } from "../utils/agent";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const { prompt, repoUrl }: { prompt: string; repoUrl: string } = body;

  try {
    const { response } = await codingAgent(prompt, repoUrl);
    return new Response(JSON.stringify({ prompt, response, repoUrl }), {
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