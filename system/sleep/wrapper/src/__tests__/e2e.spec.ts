import { PolywrapClient } from "@polywrap/client-js";
import { sleepPlugin } from "../../../plugin/build";
import path from "path";

describe("e2e", () => {

  let client: PolywrapClient;
  let uri: string;
  const vals: string[] = [];

  beforeAll(() => {
    uri = `wrap://fs/${path.resolve(__dirname, "../../build")}`;
    // Add the plugin registration to the PolywrapClient
    client = new PolywrapClient({
      plugins: [
        {
          uri: "ens/sleep-js.polywrap.eth",
          plugin: sleepPlugin({ onWake: () => {
            vals.push("second");
            return true;
          }})
        }
      ],
      interfaces: [
        {
          interface: "ens/sleep.polywrap.eth",
          implementations: ["ens/sleep-js.polywrap.eth"],
        }
      ]
    });
  });

  it("sleeps and then executes callback", async () => {
    const result = client.invoke<boolean>({
      uri: uri,
      method: "sleep",
      args: {
        ms: 2000
      }
    });

    new Promise(() => setTimeout(() => vals.push("first"), 1000));

    const { data, error } = await result;

    expect(error).toBeFalsy();
    expect(data).toBeTruthy();
    expect(vals.length).toBe(2);
    expect(vals[0]).toBe("first");
    expect(vals[1]).toBe("second");
  });
});
