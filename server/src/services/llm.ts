import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { readConfig } from "./config";
import { logger } from "./logger";

const PROMPT_PATH = path.join(__dirname, "../../../prompt.md");

export async function summarize(messagesText: string, hoursBack: number): Promise<string> {
  const config = readConfig();
  const cli = config.LLM_CLI || "claude";
  const model = config.LLM_MODEL || "sonnet";

  // Read prompt template and inline messages directly
  const promptTemplate = fs.readFileSync(PROMPT_PATH, "utf-8");
  const prompt = promptTemplate
    .replace("{hours}", String(hoursBack))
    .replace("{messages}", messagesText);

  return runCli(cli, model, prompt);
}

function runCli(cli: string, model: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let args: string[];

    switch (cli) {
      case "claude":
        args = ["--model", model, "--print"];
        break;
      case "gemini":
        args = ["--model", model];
        break;
      case "qwen":
        args = ["--model", model];
        break;
      default:
        return reject(new Error(`Unsupported LLM CLI: ${cli}`));
    }

    const child = spawn(cli, args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 300000,
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data; });
    child.stderr.on("data", (data) => { stderr += data; });

    // All CLIs receive prompt via stdin
    child.stdin.write(prompt);
    child.stdin.end();

    child.on("error", (err) => {
      reject(new Error(`Failed to start ${cli}: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        logger.error("LLM", `stderr: ${stderr}`);
        reject(new Error(`LLM CLI exited with code ${code}: ${stderr.slice(0, 500)}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
