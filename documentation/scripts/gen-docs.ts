import path from "path";
import fs from "fs";
import { runCLI } from "@polywrap/test-env-js";
import { executeCommand, match, partialSort, readJsonFile } from "./utils";

export async function main() {
  const directories = ["protocol", "system"];
  const docsDir = path.resolve(path.join(__dirname, "../docs"));
  const integrationsRoot = path.resolve(path.join(__dirname, "../../"));

  for (const dir of directories) {
    const searchDir = path.join(integrationsRoot, dir);
    await generateDocs(docsDir, searchDir);
  }
}

async function generateDocs( docsDir: string, searchDir: string) {
  const dirents = fs.readdirSync(searchDir, { withFileTypes: true });

  // Only search specific types of files
  const manifests = ["polywrap.yaml", "polywrap.yml", "polywrap.plugin.yaml", "polywrap.plugin.yml"];

  // Ignore specific directories
  const filter = ["node_modules"];

  // make sure we build plugins and interfaces first since they are usually dependencies
  // A wasm wrapper can be a dependency, but that is not an issue in this repo right now,
  // and it's a harder problem to solve.
  partialSort(dirents);

  for (const dirent of dirents) {
    const direntPath = path.join(searchDir, dirent.name);

    if (dirent.isFile() && manifests.includes(dirent.name)) {
      console.log("\n" + "🌎 found " + direntPath);

      // get wrapper name
      const manifestJson = await readJsonFile(direntPath);
      const wrapperName = manifestJson["name"];
      const wrapperDocsDir = path.join(docsDir, wrapperName);

      // build wrapper
      try {
        await executeCommand("yarn", ["install", "--cwd", searchDir, "--pure-lockfile"], searchDir);
        await executeCommand("yarn", ["build"], searchDir);
      } catch (e) {
        console.error(e);
        continue;
      }

      // Code generation cannot be run for Polywrap Interface projects
      // But we need to build them in case they are another wrapper's dependency
      if (manifestJson["language"].indexOf("interface") > -1) {
        console.log("Code generation cannot be run for Polywrap Interface projects")
        continue;
      }

      // generate docs
      const { exitCode: code, stdout: output, stderr: error } = await runCLI({
        args: ["docgen", "docusaurus", `-m ${direntPath}`, `-g ${wrapperDocsDir}`],
      });
      if (code === 0) {
        console.log("✔️ Generated docs for " + wrapperName);
      } else {
        console.error(output);
        console.error(error);
      }
    } else if (dirent.isDirectory() && !match(dirent.name, filter)) {
      await generateDocs(docsDir, direntPath)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });