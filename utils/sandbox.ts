// Sandbox uses your  OIDC token to authenticate

import { Sandbox } from "@vercel/sandbox";
import ms from "ms";

export const createSandbox = async (repoUrl: string) => {
  const sandbox = await Sandbox.create({
    source: {
      url: repoUrl,
      type: "git",
    },
    resources: { vcpus: 2 },
    timeout: ms("5m"), // Increased from 1m to 5m for git operations
    ports: [3000],
    runtime: "node22",
  });

  return sandbox;
};

export const readFile = async (sandbox: Sandbox, path: string) => {
  console.log(`Reading file: ${path}`);
  const result = await sandbox.runCommand("cat", [path]);
  const data = await result.output();
  console.log(`File read successfully: ${path} ${data}`);
  return { path, content: data.toString() };
};

export const listFiles = async (sandbox: Sandbox, path: string | null) => {
  const targetPath = path && path.length > 0 ? path : ".";
  console.log(`Listing files in: ${targetPath}`);
  const result = await sandbox.runCommand("ls", ["-la", targetPath]);
  const results = await result.output();
  console.log(`Files listed successfully for: ${targetPath}\n${results}`);
  return results.toString();
};

export const editFile = async (
  sandbox: Sandbox,
  path: string,
  old_str: string,
  new_str: string,
) => {
  console.log(`Editing file: ${path}`);
  // Read the file content using sandbox
  const result = await sandbox
    .runCommand("cat", [path])
    .catch(() => ({ output: () => "" }));
  const content = await result.output();
  const contentStr = content.toString();

  const updatedContent = contentStr.replace(old_str, new_str);
  if (contentStr === updatedContent && old_str !== new_str) {
    console.log(`String "${old_str}" not found in file ${path}`);
    return { error: `String "${old_str}" not found in file` };
  }

  // Write the updated content back using sandbox writeFiles method
  await sandbox.writeFiles([
    {
      path: path,
      stream: Buffer.from(updatedContent, "utf8"),
    },
  ]);
  console.log(`File edited successfully: ${path}`);
  // Get and print the updated file content
  const updatedResult = await sandbox.runCommand("cat", [path]);
  const updatedFileContent = await updatedResult.output();
  console.log(`Updated file content for ${path}:\n${updatedFileContent}`);
  return { success: true };
};

export const createPR = async (
  sandbox: Sandbox,
  repoUrl: string,
  prDetails: { title: string; body: string; branch: string | null },
) => {
  try {
    if (!process.env.GITHUB_TOKEN)
      throw new Error("GITHUB_TOKEN environment variable is required");

    const { title, body, branch } = prDetails;
    console.log(`Creating PR with title: ${title}, body: ${body}, branch: ${branch}`);

    const branchName = `${ branch || `feature/ai-changes` }-${Date.now()}`;

    // Setup git
    console.log("Setting up git configuration...");
    await sandbox.runCommand("git", [
      "config",
      "user.email",
      "ai-agent@example.com",
    ]);
    await sandbox.runCommand("git", ["config", "user.name", "AI Coding Agent"]);

    const authUrl = repoUrl!.replace(
      "https://github.com/",
      `https://${process.env.GITHUB_TOKEN}@github.com/`,
    );
    await sandbox.runCommand("git", ["remote", "set-url", "origin", authUrl]);

    // Create branch and commit changes
    console.log(`Creating and switching to branch: ${branchName}`);
    await sandbox.runCommand("git", ["checkout", "-b", branchName]);
    
    console.log("Adding files to git...");
    await sandbox.runCommand("git", [
      "add",
      ".",
      ":!*.tar",
      ":!*.tar.gz",
      ":!*.tar.bz2",
      ":!*.tar.xz",
      ":!*.tgz",
      ":!*.tbz",
      ":!*.tbz2",
      ":!*.txz",
    ]);

    // Check if there are changes to commit
    console.log("Checking for changes to commit...");
    const diffResult = await sandbox.runCommand("git", [
      "diff",
      "--cached",
      "--name-only",
    ]);
    const diffOutput = await diffResult.output();

    if (!diffOutput.toString().trim()) {
      console.log("No changes detected, creating minimal change...");
      // Create a minimal change if nothing to commit
      const timestamp = new Date().toISOString();
      await sandbox.runCommand("bash", [
        "-c",
        `echo "AI Agent Activity: ${timestamp}" > .ai-activity.md`,
      ]);
      await sandbox.runCommand("git", [
        "add",
        ".",
        ":!*.tar",
        ":!*.tar.gz",
        ":!*.tar.bz2",
        ":!*.tar.xz",
        ":!*.tgz",
        ":!*.tbz",
        ":!*.tbz2",
        ":!*.txz",
      ]);
    } else {
      console.log(`Changes detected in files: ${diffOutput.toString().trim()}`);
    }

    console.log("Committing changes...");
    await sandbox.runCommand("git", ["commit", "-m", title]);
    
    console.log(`Pushing to branch: ${branchName}`);
    try {
      const pushResult = await sandbox.runCommand("git", ["push", "origin", branchName]);
      const pushOutput = await pushResult.output();
      console.log(`Push result: ${pushOutput}`);
    } catch (pushError) {
      const err = pushError as Error;
      console.error(`Error during git push:`, err);
      throw new Error(`Failed to push branch: ${err.message}`);
    }

    // Create PR via GitHub API
    console.log("Creating PR via GitHub API...");
    const urlMatch = repoUrl!.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
    if (!urlMatch) throw new Error("Invalid GitHub repository URL");

    const [, owner, repo] = urlMatch;
    
    // Get the default branch of the repository
    console.log("Getting repository information...");
    let defaultBranch = "main"; // fallback
    try {
      const repoInfoResponse = await sandbox.runCommand("curl", [
        "-s",
        "-H",
        `Authorization: token ${process.env.GITHUB_TOKEN}`,
        "-H",
        "Accept: application/vnd.github.v3+json",
        `https://api.github.com/repos/${owner}/${repo}`,
      ]);
      const repoInfoOutput = await repoInfoResponse.output();
      const repoInfo = JSON.parse(repoInfoOutput.toString());
      defaultBranch = repoInfo.default_branch || "main";
      console.log(`Repository default branch: ${defaultBranch}`);
    } catch (repoInfoError) {
      console.warn(`Could not get repository info, using 'main' as default branch:`, repoInfoError);
    }
    
    const prData = { title, body, head: branchName, base: defaultBranch };
    
    console.log(`Creating PR for ${owner}/${repo} with data:`, prData);

    try {
      const response = await sandbox.runCommand("curl", [
        "-s",
        "-X",
        "POST",
        "-H",
        `Authorization: token ${process.env.GITHUB_TOKEN}`,
        "-H",
        "Accept: application/vnd.github.v3+json",
        "-H",
        "Content-Type: application/json",
        "-d",
        JSON.stringify(prData),
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
      ]);

      const responseOutput = await response.output();
      console.log(`GitHub API response: ${responseOutput}`);
      
      const result = JSON.parse(responseOutput.toString());

      if (result.html_url) {
        console.log(`PR created successfully: ${result.html_url}`);
        return {
          success: true,
          branch: branchName,
          pr_url: result.html_url,
          pr_number: result.number,
        };
      } else {
        console.error(`Failed to create PR. GitHub API response:`, result);
        throw new Error(result.message || "Failed to create PR");
      }
    } catch (apiError) {
      const err = apiError as Error;
      console.error(`Error during GitHub API call:`, err);
      throw new Error(`Failed to create PR via API: ${err.message}`);
    }
  } catch (error) {
    const err = error as Error;
    console.error(`Error in createPR:`, err);
    return { error: err.message };
  }
};
