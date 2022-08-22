import path from "path";
import fs from "fs";
import {
  match,
  readJsonFile,
  redirectInternalLinks,
  readAndWriteReadme,
  writeReadme,
  parallelize,
  buildPackageAndGenerateDocs
} from "./utils";

// collect build promises
interface Projects {
  interface: (() => Promise<void>)[];
  plugin: (() => Promise<void>)[];
  wasm: (() => Promise<void>)[];
  readme: (() => void)[];
}

// manifest names to search for
const manifestNames = ["polywrap.yaml", "polywrap.yml", "polywrap.plugin.yaml", "polywrap.plugin.yml"];

// Ignore specific directories
const filter = ["node_modules", "src", "build", "recipes", "workflows", "scripts", "meta"];

export async function main() {
  const directories = ["protocol", "system"];
  const docsRoot = path.resolve(path.join(__dirname, "../docs"));
  const searchRoot = path.resolve(path.join(__dirname, "../../"));
  const projects: Projects = {
    interface: [],
    plugin: [],
    wasm: [],
    readme: [],
  }

  // find projects, build them, and generate docs
  for (const dir of directories) {
    findProjects(docsRoot, searchRoot, dir, projects);
  }
  await parallelize(projects.interface);
  await parallelize(projects.plugin);
  await parallelize(projects.wasm);
  projects.readme.map((readme) => readme());

  // copy top-level readme
  const readmePath = path.join(searchRoot, "README.md");
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf-8');
    readme = redirectInternalLinks(readme);
    writeReadme(docsRoot, readme);
  }

  console.log("👑 Successfully generated docs! 👑")
}

function findProjects(docsRoot: string, searchRoot: string, pathFromRoot: string, projects: Projects) {
  const searchDir = path.join(searchRoot, pathFromRoot);
  const dirents = fs.readdirSync(searchDir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (dirent.isFile() && (manifestNames.includes(dirent.name) || dirent.name === "README.md")) {
      const outputDir = path.join(docsRoot, pathFromRoot);
      const filePath = path.join(searchDir, dirent.name);

      // readme files are handled differently
      if (dirent.name === "README.md") {
        projects["readme"].push(() => readAndWriteReadme(outputDir, filePath));
        continue;
      }

      console.log("🌎 found " + filePath);

      // determine project type
      const manifest: Record<string, any> = readJsonFile(filePath);
      const projectType: keyof Projects = manifest["language"].indexOf("interface") > -1
        ? "interface"
        : dirent.name.indexOf("plugin") > -1
          ? "plugin"
          : "wasm";

      // add promise to build package
      projects[projectType].push(() => buildPackageAndGenerateDocs(searchDir, outputDir, filePath, projectType));

    } else if (dirent.isDirectory() && !match(dirent.name, filter)) {
      const nextPathFromRoot = path.join(pathFromRoot, dirent.name);
      findProjects(docsRoot, searchRoot, nextPathFromRoot, projects);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });