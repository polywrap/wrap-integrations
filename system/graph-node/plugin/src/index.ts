import {
  Client,
  Module,
  Args_querySubgraph,
  HTTP_Module,
  manifest,
} from "./wrap";

import { PluginFactory } from "@polywrap/core-js";

export interface RequestError {
  errors: {
    locations: { column: number; line: number }[];
    message: string;
  }[];
}

export interface RequestData {
  data: Record<string, unknown>;
}

type NoConfig = Record<string, never>;

export class GraphNodePlugin extends Module<NoConfig> {
  public async querySubgraph(
    args: Args_querySubgraph,
    client: Client
  ): Promise<string> {
    const { url, query } = args;
    const response = await HTTP_Module.post(
      {
        url,
        request: {
          body: JSON.stringify({
            query,
          }),
          responseType: "TEXT",
        },
      },
      client
    );

    if (!response.ok) {
      const error = response.error;
      throw new Error(`GraphNodePlugin: errors encountered. Error: ${error}`);
    }

    const data = response.value;

    if (!data) {
      throw new Error(`GraphNodePlugin: data is undefined.`);
    }

    if (!data.body) {
      throw Error(`GraphNodePlugin: body is undefined.`);
    }

    const responseJson = JSON.parse(data.body) as RequestError | RequestData;

    const responseErrors = (responseJson as RequestError).errors;

    if (responseErrors) {
      throw new Error(`GraphNodePlugin: errors in query string. Errors:
        ${responseErrors
          .map((err) =>
            err.locations
              ? `\n -Locations: ${err.locations
                  .map((loc) => `(col: ${loc.column}, line: ${loc.line})`)
                  .join(", ")} \n-Message: ${err.message}`
              : `\n-Message: ${err.message}`
          )
          .join("\n")}
      `);
    }

    return JSON.stringify(responseJson);
  }
}

export const graphNodePlugin: PluginFactory<NoConfig> = () => {
  return {
    factory: () => new GraphNodePlugin({}),
    manifest,
  };
};

export const plugin = graphNodePlugin;
