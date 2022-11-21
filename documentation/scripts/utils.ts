import fs from "fs";
import YAML from "yaml";
import { spawn } from "child_process";
import path from "path";
import { runCLI } from "@polywrap/test-env-js";

export const match = (str: string, tests: string[]) => {
  for (const test of tests) {
    if (str.indexOf(test) > -1) {
      return true;
    }
  }
  return false;
}

export function readJsonFile(path: string): Record<string, any> {
  const file = fs.readFileSync(path, "utf8");
  return YAML.parse(file);
}

const executeCommand = async (
  command: string,
  args: string[],
  root: string
): Promise<boolean | { command: string }> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: root,
      shell: process.platform == "win32",
    });
    child.on("close", (code: number) => {
      if (code !== 0) {
        // Return the failed command
        reject({
          command: `${command} ${args.join(" ")}`,
        });
        return;
      }

      resolve(true);
    });
  });
};

export async function buildPackage(cwd: string): Promise<void> {
  await executeCommand("yarn", ["install", "--cwd", cwd, "--pure-lockfile"], cwd);
  await executeCommand("yarn", ["build"], cwd);
}

export async function generateDocs(outputDir: string, manifestPath: string): Promise<void> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { exitCode, stdout, stderr } = await runCLI({
    args: ["docgen", "docusaurus", `-m ${manifestPath}`, `-g ${outputDir}`],
  });
  if (exitCode !== 0) {
    const message = stderr.trim().length === 0 ? stdout : stderr;
    if (message.length > 1000) {
      throw Error(`Error when generating docs for ${manifestPath}` +
        `\n${message.substring(0, 1000)}` +
        "\n..." +
        "\nERROR TRUNCATED TO 1000 CHARS"
      );
    }
   throw Error(`Error when generating docs for ${manifestPath}\n${message}`);
  }
}

export async function buildPackageAndGenerateDocs(
  cwd: string,
  outputDir: string,
  manifestPath: string,
  projectType: string
): Promise<void> {
  await buildPackage(cwd);
  if (projectType !== "interface") {
    await generateDocs(outputDir, manifestPath);
  }
}

export async function parallelize(tasks: (() => Promise<void>)[]): Promise<void[]> {
  const promises: Promise<void>[] = tasks.map((task) => task().catch((e) => console.error(e)));
  return Promise.all(promises);
}

export function writeReadme(outputDir: string, readme: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const readmePath = path.join(outputDir, "readme-doc.md");
  const readmeDoc = `---
id: readme-doc
title: Readme
sidebar_position: 0
---

` + readme;
  fs.writeFileSync(readmePath, readmeDoc);
}

export function readAndWriteReadme(outputDir: string, inputPath: string): void {
  const readme = fs.readFileSync(inputPath, 'utf-8');
  writeReadme(outputDir, readme);
}

export function redirectInternalLinks(readme: string): string {
  const toAppend = "/readme-doc)";
  let start = readme.indexOf("(./");
  while (start >= 0) {
    const end = readme.indexOf(")", start);
    const nextStart = end + toAppend.length;
    readme = readme.slice(0, start) +
      readme.slice(start, end) +
      toAppend +
      readme.slice(nextStart);
    start = readme.indexOf("(./", nextStart);
  }
  return readme;
}
