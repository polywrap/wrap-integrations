import { PolywrapClient } from "@polywrap/client-js";
import { sleepPlugin } from "../";

describe("e2e", () => {

  let client: PolywrapClient;
  const uri = "ens/sleep-js.polywrap.eth";
  const vals: string[] = [];

  beforeAll(() => {
    // Add the plugin registration to the PolywrapClient
    client = new PolywrapClient({
      plugins: [
        {
          uri: uri,
          plugin: sleepPlugin({ onWake: () => {
            vals.push("second");
            return true;
          }})
        }
      ]
    });
  });

  it("sleeps and then executes callback", async () => {
    const result = client.invoke<boolean>({
      uri,
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
