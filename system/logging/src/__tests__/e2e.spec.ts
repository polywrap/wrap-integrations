import { PolywrapClient } from "@polywrap/client-js";
import { PluginPackage } from "@polywrap/plugin-js";

describe("logging wrapper", () => {

  const wrapperUri = "file/./build/";
  const pluginUri1 = "wrap://plugin/logger-1";
  const pluginUri2 = "wrap://plugin/logger-2";
  const interfaceUri = "ens/wrappers.polywrap.eth:logger@1.0.0";

  function createClient(logs: any[]): PolywrapClient {
    const loggerPlugin = PluginPackage.from(() => ({
      log(args: any): boolean {
        logs.push(args);
        return true;
      },
    }));

    return new PolywrapClient({
      packages: [
        {
          uri: pluginUri1,
          package: loggerPlugin
        },
        {
          uri: pluginUri2,
          package: loggerPlugin
        }
      ],
      interfaces: [{
        interface: interfaceUri,
        implementations: [pluginUri1, pluginUri2]
      }]
    });
  }

  it("dispatches message to all loggers", async () => {
    const logs: any[] = [];
    const client = createClient(logs);

    const message = "Test message";
    const level = 1;
    const args = {
      message,
      level
    };

    const response = await client.invoke<boolean>({
      uri: wrapperUri,
      method: "info",
      args: {
        message
      },
    });

    if (!response.ok) fail(response.error);
    expect(response.value).toBe(true);
    expect(logs.length).toBe(2);
    expect(logs).toMatchObject([args, args]);
  });

  it("sends the correct level", async () => {
    const logs: any[] = [];
    const client = createClient(logs);

    const run = async (method: string, level: number) => {
      const response = await client.invoke<boolean>({
        uri: wrapperUri,
        method,
        args: {
          message: "foo"
        },
      });
  
      if (!response.ok) fail(response.error);
      expect(response.value).toBe(true);
      const lastLog = logs[logs.length - 1];
      expect(lastLog).toMatchObject({ message: "foo", level });
    };

    await run("debug", 0);
    await run("info", 1);
    await run("warn", 2);
    await run("error", 3);
  });

  it("returns all logger implementation URIs", async () => {
    const client = createClient([]);

    const resp = await client.invoke({
      uri: wrapperUri,
      method: "loggers"
    });

    if (!resp.ok) fail(resp.error);
    expect(resp.value).toMatchObject([pluginUri1, pluginUri2]);
  });

  it("succeeds if no loggers are found", async () => {
    const client = new PolywrapClient();

    const impls = await client.invoke<string[]>({
      uri: wrapperUri,
      method: "loggers"
    });
    if (!impls.ok) fail(impls.error);
    expect(impls.value.length).toBe(0);

    const resp = await client.invoke({
      uri: wrapperUri,
      method: "warn",
      args: {
        message: "warning message"
      }
    });
    if (!resp.ok) fail(resp.error);
    expect(resp.value).toBe(true);
  });
});
