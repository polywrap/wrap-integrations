import path from "path";
import fs from "fs";
import { runCLI } from "@polywrap/test-env-js";
import { direntComparator, executeCommand, match, readJsonFile, redirectInternalLinks, writeReadme } from "./utils";

export const manifestNames = ["polywrap.yaml", "polywrap.yml", "polywrap.plugin.yaml", "polywrap.plugin.yml"];

export async function main() {
  const directories = ["protocol", "system"];
  const docsRoot = path.resolve(path.join(__dirname, "../docs"));
  const searchRoot = path.resolve(path.join(__dirname, "../../"));

  // generate docs and copy readmes
  for (const dir of directories) {
    await generateDocs(docsRoot, searchRoot, dir);
  }

  // copy top-level readme
  const readmePath = path.join(searchRoot, "README.md");
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf-8');
    readme = redirectInternalLinks(readme);
    writeReadme(docsRoot, readme);
  }
}

async function generateDocs(docsRoot: string, searchRoot: string, pathFromRoot: string): Promise<void> {
  // Ignore specific directories
  const filter = ["node_modules", "src", "build", "recipes", "workflows", "scripts", "meta"];

  const searchDir = path.join(searchRoot, pathFromRoot);
  const dirents = fs.readdirSync(searchDir, { withFileTypes: true });

  // make sure we build plugins and interfaces first since they are usually dependencies
  // A wasm wrapper can be a dependency, but that is not an issue in this repo right now,
  // and it's a harder problem to solve.
  // We also need to make sure wrapper docs are generated before README docs are added.
  // Otherwise, docgen will replace the folder containing the README and the README will be lost.
  dirents.sort(direntComparator);

  for (const dirent of dirents) {

    if (dirent.isFile()) {
      const direntPath = path.join(searchDir, dirent.name);

      // use readme as project intro doc
      if (dirent.name === "README.md") {
        const docsDir = path.join(docsRoot, pathFromRoot);
        const readme = fs.readFileSync(direntPath, 'utf-8');
        writeReadme(docsDir, readme);
      // if found wrapper, generate docs
      } else if (manifestNames.includes(dirent.name)) {
        console.log("\n" + "🌎 found " + direntPath);

        // build wrapper
        try {
          await executeCommand("yarn", ["install", "--cwd", searchDir, "--pure-lockfile"], searchDir);
          await executeCommand("yarn", ["build"], searchDir);
        } catch (e) {
          console.error(e);
          continue;
        }

        // read wrapper manifest
        const manifestJson = readJsonFile(direntPath);

        // Code generation cannot be run for Polywrap Interface projects
        // But we need to build them in case they are another wrapper's dependency
        if (manifestJson["language"].indexOf("interface") > -1) {
          console.log("Code generation cannot be run for Polywrap Interface projects")
          continue;
        }

        const docsDir = path.join(docsRoot, pathFromRoot);
        if (!fs.existsSync(docsDir)) {
          fs.mkdirSync(docsDir, { recursive: true });
        }

        // generate docs
        const { exitCode: code, stdout: output, stderr: error } = await runCLI({
          args: ["docgen", "docusaurus", `-m ${direntPath}`, `-g ${docsDir}`],
        });
        if (code === 0) {
          console.log("✔️ Generated docs for " + manifestJson["name"]);
        } else {
          console.error(output);
          console.error(error);
        }
      }
    } else if (dirent.isDirectory() && !match(dirent.name, filter)) {
      const nextPathFromRoot = path.join(pathFromRoot, dirent.name);
      if (dirent.name.indexOf("interface") > 0 || dirent.name.indexOf("plugin") > 0) {
        await generateDocs(docsRoot, searchRoot, nextPathFromRoot);
      } else {
        return generateDocs(docsRoot, searchRoot, nextPathFromRoot)
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });