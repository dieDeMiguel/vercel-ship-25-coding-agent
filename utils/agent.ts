import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod/v4";
import { type Sandbox } from "@vercel/sandbox";
import {
  createPR, 
  createSandbox,
  editFile,
  listFiles,
  readFile,
} from "./sandbox";

export async function codingAgent(prompt: string, repoUrl?: string) {
  console.log("repoUrl:", repoUrl);
  let sandbox: Sandbox | undefined;

  const result = await generateText({
    model: "openai/gpt-4.1",
    prompt,
    system:
      "You are a coding agent. You will be working with js/ts projects. Your responses must be concise. If you make changes to the codebase, be sure to run the create_pr tool once you are done.", 
    stopWhen: stepCountIs(10),
    tools: {
      read_file: tool({
        description:
          "Read the contents of a given relative file path. Use this when you want to see what's inside a file. Do not use this with directory names.",
        inputSchema: z.object({
          path: z
            .string()
            .describe("The relative path of a file in the working directory."),
        }),
        execute: async ({ path }) => {
          try {
            if (!sandbox) {
              if (!repoUrl) {
                return { path, error: "Repository URL not provided" };
              }
              sandbox = await createSandbox(repoUrl);
            }
            const output = await readFile(sandbox, path);
            return { path, output };
          } catch (error) {
            const err = error as Error;
            console.error(`Error reading file at ${path}:`, err.message);
            return { path, error: err.message };
          }
        },
      }),
      list_files: tool({
        description:
          "List files and directories at a given path. If no path is provided, lists files in the current directory.",
        inputSchema: z.object({
          path: z
            .string()
            .nullable()
            .describe(
              "Optional relative path to list files from. Defaults to current directory if not provided.",
            ),
        }),
        execute: async ({ path }) => {
          if (path === ".git" || path === "node_modules") {
            return { error: "You cannot read the path: ", path };
          }
          try {
            if (!sandbox) {
              if (!repoUrl) {
                return { path, error: "Repository URL not provided" };
              }
              sandbox = await createSandbox(repoUrl);
            }
            const output = await listFiles(sandbox, path);
            return { path, output };
          } catch (e) {
            const err = e as Error;
            console.error(`Error listing files:`, err.message);
            return { error: err.message };
          }
        },
      }),
      edit_file: tool({
        description:
          "Make edits to a text file. Replaces 'old_str' with 'new_str' in the given file. 'old_str' and 'new_str' MUST be different from each other. If the file specified with path doesn't exist, it will be created.",
        inputSchema: z.object({
          path: z.string().describe("The path to the file"),
          old_str: z
            .string()
            .describe(
              "Text to search for - must match exactly and must only have one match exactly",
            ),
          new_str: z.string().describe("Text to replace old_str with"),
        }),
        execute: async ({ path, old_str, new_str }) => {
          try {
            if (!sandbox) {
              if (!repoUrl) {
                return { path, error: "Repository URL not provided" };
              }
              sandbox = await createSandbox(repoUrl);
            }
            await editFile(sandbox, path, old_str, new_str);
            return { success: true };
          } catch (e) {
            const err = e as Error;
            console.error(`Error editing file ${path}:`, err.message);
            return { error: err.message };
          }
        },
      }),
      create_pr: tool({
        description:
          "Create a pull request with the current changes. This will add all files, commit changes, push to a new branch, and create a PR using GitHub's REST API. Use this as the final step when making changes.", 
        inputSchema: z.object({
          title: z.string().describe("The title of the pull request"), 
          body: z.string().describe("The body/description of the pull request"), 
          branch: z 
            .string() 
            .nullable() 
            .describe(
              "The name of the branch to create (defaults to a generated name)", 
            ), 
        }), 
        execute: async ({ title, body, branch }) => {
          try {
            if (!sandbox) sandbox = await createSandbox(repoUrl!);
            const result = await createPR(sandbox, repoUrl!, {
              title, 
              body, 
              branch, 
            });
            
            if (result.error) {
              console.error(`Error creating PR:`, result.error);
              return { error: result.error };
            }
            
            console.log(`PR created successfully: ${result.pr_url}`);
            return { success: true, linkToPR: result.pr_url }; 
          } catch (error) {
            const err = error as Error;
            console.error(`Error creating PR:`, err.message);
            return { error: err.message };
          }
        }, 
      }), 
    },
  });

  if (sandbox) {
    await sandbox.stop();
  }

  return { response: result.text };
}