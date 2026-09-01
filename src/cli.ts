import "dotenv/config";
import readline from "node:readline";
import { randomUUID } from "node:crypto";

import { assistantAgent } from "./agents/assistant.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const threadId = randomUUID();
const resourceId = "cli-user";

let shuttingDown = false;

function shutdown(): void {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log("\n\nGoodbye! 👋");
  rl.close();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main(): Promise<void> {
  console.log(`
╭────────────────────────────────────────────╮
│          Mastra CLI Assistant              │
│                                            │
│  Streaming agent with tools + memory       │
│  Type "exit" or press Ctrl+C to quit.      │
╰────────────────────────────────────────────╯
`);

  while (!shuttingDown) {
    let input: string;

    try {
      input = (await ask("\nYou: ")).trim();
    } catch {
      shutdown();
      return;
    }

    if (!input) {
      continue;
    }

    if (
      input.toLowerCase() === "exit" ||
      input.toLowerCase() === "quit"
    ) {
      shutdown();
      return;
    }

    const start = Date.now();

    process.stdout.write("\nAssistant: ");

    try {
      const stream = await assistantAgent.stream(input, {
        memory: {
          thread: threadId,
          resource: resourceId,
        },
      });

      for await (const chunk of stream.textStream) {
        process.stdout.write(chunk);
      }

      const elapsed = Date.now() - start;

      process.stdout.write(`\n\n[${elapsed}ms]\n`);
    } catch (error) {
      console.error("\n\n[Agent error]");

      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unexpected error occurred.");
      }

      console.log(
        "The conversation is still active. You can try another message.",
      );
    }
  }
}

main().catch((error) => {
  console.error("Fatal CLI error:", error);
  shutdown();
});