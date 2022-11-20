import { PolywrapClient } from "@polywrap/client-js";

import { loggerPlugin, LogFunc } from "../..";
import { Logger_LogLevel } from "../../wrap";

const console_log = jest.spyOn(console, "log");
const console_debug = jest.spyOn(console, "debug");
const console_warn = jest.spyOn(console, "warn");
const console_error = jest.spyOn(console, "error");

describe("loggerPlugin", () => {

  const pluginUri = "plugin/logger";
  const interfaceUri = "ens/wrappers.polywrap.eth:logger@1.0.0";

  function createClient(logFunc?: LogFunc): PolywrapClient {
    return new PolywrapClient({
      packages: [{
        uri: pluginUri,
        package: loggerPlugin({ logFunc })
      }],
      redirects: [{
        from: interfaceUri,
        to: pluginUri
      }],
      interfaces: [{
        interface: interfaceUri,
        implementations: [pluginUri]
      }]
    });
  }

  it("logs to console appropriate level", async () => {
    const message = "Test message";
    const client = createClient();

    async function testLevel(
      level: Logger_LogLevel,
      mock: jest.SpyInstance
    ): Promise<void> {
      const response = await client.invoke<boolean>({
        uri: interfaceUri,
        method: "log",
        args: {
          level,
          message,
        },
      });
  
      if (!response.ok) fail(response.error);
      expect(response.value).toBe(true);
      expect(mock).toBeCalledWith(message)
    }

    await testLevel("INFO", console_log);
    await testLevel("DEBUG", console_debug);
    await testLevel("WARN", console_warn);
    await testLevel("ERROR", console_error);
  });

  it("supports setting a custom log function", async () => {
    const customLog = jest.fn();
    const client = createClient(customLog);

    const response = await client.invoke<boolean>({
      uri: interfaceUri,
      method: "log",
      args: {
        level: "DEBUG",
        message: "foo bar"
      }
    });

    if (!response.ok) fail(response.error);
    expect(response.value).toBe(true);
    expect(customLog).toBeCalledWith("DEBUG", "foo bar");
  });

  it("supports setting multiple implementations", async () => {
    const customLog1 = jest.fn();
    const customLog2 = jest.fn();

    const client = new PolywrapClient({
      packages: [
        {
          uri: "plugin/logger-1",
          package: loggerPlugin({ logFunc: customLog1 })
        },
        {
          uri: "plugin/logger-2",
          package: loggerPlugin({ logFunc: customLog2 })
        }
      ],
      redirects: [{
        from: interfaceUri,
        to: "plugin/logger-1"
      }],
      interfaces: [{
        interface: interfaceUri,
        implementations: ["plugin/logger-1", "plugin/logger-2"]
      }]
    });

    const implementations = await client.getImplementations(interfaceUri);

    if (!implementations.ok) fail(implementations.error);

    for (const implementation of implementations.value) {
      await client.invoke<boolean>({
        uri: implementation,
        method: "log",
        args: {
          level: "INFO",
          message: "foo bar"
        }
      });
    }

    expect(customLog1).toBeCalledWith("INFO", "foo bar");
    expect(customLog2).toBeCalledWith("INFO", "foo bar");
  });
});
