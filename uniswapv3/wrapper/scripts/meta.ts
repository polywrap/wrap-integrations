/* eslint-disable @typescript-eslint/naming-convention */
import {
  GenerateBindingFn,
  BindOptions,
  BindOutput,
  BindModuleOptions,
  BindModuleOutput,
} from "@web3api/schema-bind";
import {
  transformTypeInfo,
  extendType,
  addFirstLast,
  toPrefixedGraphQLType,
  methodParentPointers,
  TypeInfo,
} from "@web3api/schema-parse";
import Mustache from "mustache";
import { readFileSync } from "fs";
import * as path from "path";

export const generateBinding: GenerateBindingFn = (
  options: BindOptions
): BindOutput => {
  const result: BindOutput = {
    modules: [],
  };

  for (const module of options.modules) {
    result.modules.push(generateModuleBindings(module));
  }

  return result;
};

export const toSentence = () => {
  return (text: string, render: (template: string) => string): string => {
    const rendered: string = render(text);
    return rendered.replace(/([A-Z])/g, " $1").replace(/(^[a-z])/, "$1");
  };
};

function applyTransforms(typeInfo: TypeInfo): TypeInfo {
  const transforms = [
    extendType(toSentence),
    addFirstLast,
    toPrefixedGraphQLType,
    methodParentPointers(),
  ];

  for (const transform of transforms) {
    typeInfo = transformTypeInfo(typeInfo, transform);
  }
  return typeInfo;
}

function generateModuleBindings(module: BindModuleOptions): BindModuleOutput {
  const result: BindModuleOutput = {
    name: module.name,
    output: {
      entries: [],
    },
    outputDirAbs: module.outputDirAbs,
  };
  const output = result.output;
  const schema = module.schema;
  const typeInfo = applyTransforms(module.typeInfo);

  const renderTemplate = (
    subPath: string,
    context: unknown,
    fileName?: string
  ) => {
    const absPath = path.join(__dirname, subPath);
    const template = readFileSync(absPath, { encoding: "utf-8" });

    output.entries.push({
      type: "File",
      name: fileName,
      data: Mustache.render(template, context),
    });
  };

  // generate manifest
  const rootContext = {
    ...typeInfo,
    schema,
  };
  renderTemplate("./meta-manifest.mustache", rootContext, "web3api.meta.yaml");

  // generate queries
  for (const method of typeInfo.moduleTypes[0].methods) {
    const methodContext = {
      ...method,
      schema,
    };
    renderTemplate(
      "./queries/meta-query.mustache",
      methodContext,
      `${method.name}.graphql`
    );
    renderTemplate(
      "./queries/meta-vars.mustache",
      methodContext,
      `${method.name}.json`
    );
  }

  return result;
}
