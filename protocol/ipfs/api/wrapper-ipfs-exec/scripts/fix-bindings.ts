import path from "path";
import fs from "fs";

export async function main() {
  const searchRoot = path.resolve(path.join(__dirname, "..", "src", "wrap"));
  traverseBindings(searchRoot, "");
}

function traverseBindings(searchRoot: string, pathFromRoot: string) {
  const searchDir = path.join(searchRoot, pathFromRoot);
  const dirents = fs.readdirSync(searchDir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (dirent.isFile()) {
      const filePath = path.join(searchDir, dirent.name);

      let content: string = fs.readFileSync(filePath, "utf-8");

      content = fixImports(content);

      fs.writeFileSync(filePath, content);

    } else if (dirent.isDirectory()) {
      const nextPathFromRoot = path.join(pathFromRoot, dirent.name);
      traverseBindings(searchRoot, nextPathFromRoot);
    }
  }
}

// function removeSerde(content: string): string {
//   const import_re = new RegExp(/use serde::\{Serialize, Deserialize};\n/g);
//   content = content.replace(import_re, "");
//
//   let trait_re = new RegExp(/#\[derive\(Clone, Debug, Deserialize, Serialize\)]/g);
//   content = content.replace(trait_re, "#[derive(Clone, Debug)]");
//
//   trait_re = new RegExp(/#\[derive\(Clone, Copy, Debug, Deserialize, Serialize\)]/g);
//   return content.replace(trait_re, "#[derive(Clone, Copy, Debug)]");
// }

function fixImports(content: string): string {
  return content.replace(`use crate::{
    ConcurrentReturnWhen,
    get_concurrent_return_when_value,
    sanitize_concurrent_return_when_value
};`, `use crate::{
    ConcurrentReturnWhen,
    get_concurrent_return_when_value,
    sanitize_concurrent_return_when_value,
    get_concurrent_task_status_value,
    sanitize_concurrent_task_status_value
};`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

