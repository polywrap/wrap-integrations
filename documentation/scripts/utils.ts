import fs from "fs";
import YAML from "yaml";
import { spawn } from "child_process";
import path from "path";
import { manifestNames } from "@site/scripts/gen-docs";

export const match = (str: string, tests: string[]) => {
  for (const test of tests) {
    if (str.indexOf(test) > -1) {
      return true;
    }
  }
  return false;
}

export async function readJsonFile(path): Promise<Record<string, any>> {
  const file = await fs.promises.readFile(path, "utf8");
  return YAML.parse(file);
}

export const executeCommand = async (
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

// sorts folders to: interface < plugin < other
// sorts files to: manifest < readme < other
// order otherwise doesn't matter
export function direntComparator(a: fs.Dirent, b: fs.Dirent): number {
  const aName: string = a.name.toLowerCase();
  const bName: string = b.name.toLowerCase();

  if (a.isDirectory() && b.isDirectory()) {
    if (aName.indexOf("interface") > -1) return -1;
    if (bName.indexOf("interface") > -1) return 1;

    if (aName.indexOf("plugin") > -1) return -1;
    if (bName.indexOf("plugin") > -1) return 1;

    return 0;
  }

  if (a.isFile() && b.isFile()) {
    if (manifestNames.includes(aName)) return -1;
    if (manifestNames.includes(bName)) return 1;

    if (aName === "readme.md") return -1;
    if (bName === "readme.md") return 1;

    return 0;
  }

  return 0;
}

export async function writeReadme(dir: string, readme: string): Promise<void> {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const readmePath = path.join(dir, "readme.md");
  const readmeDoc = `---
id: readme
title: Readme
sidebar_position: 0
---

` + readme;
  await fs.promises.writeFile(readmePath, readmeDoc);
}