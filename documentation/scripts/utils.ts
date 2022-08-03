import fs from "fs";
import YAML from "yaml";
import { spawn } from "child_process";

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

const buildFirst = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.indexOf("plugin") > -1 || lower.indexOf("interface") > -1;
}

export function partialSort(dirents: fs.Dirent[]): void {
  let j = 0;
  for (let i = 0; i < dirents.length; i++) {
    const dirent = dirents[i];
    if (dirent.isDirectory() && buildFirst(dirent.name)) {
      let temp = dirents[i];
      dirents[i] = dirents[j];
      dirents[j] = temp;
      j++;
    }
  }
}