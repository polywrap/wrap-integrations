import { PolywrapClient } from "@polywrap/client-js";
import { inMemoryCachePlugin } from "../";
import { Cache_Module } from "./types";

jest.setTimeout(10000);

describe("e2e", () => {

  let client: PolywrapClient;
  const uri = "ens/cache.eth";

  beforeAll(() => {
    client = new PolywrapClient({
      plugins: [
        {
          uri: uri,
          plugin: inMemoryCachePlugin({})
        }
      ]
    });
  });

  test("set", async () => {
    const setResult = await Cache_Module.set({key: "a", value: "1"}, client);

    expect(setResult.error).toBeFalsy();
    expect(setResult.data).toBeTruthy();

    const hasResult = await Cache_Module.has({key: "a"}, client);

    expect(hasResult.error).toBeFalsy();
    expect(hasResult.data).toBeTruthy();
    expect(hasResult.data).toBe(true);

    const getResult = await Cache_Module.get({key: "a"}, client);   

    expect(getResult.error).toBeFalsy();
    expect(getResult.data).toBeTruthy();
    expect(getResult.data).toBe("1");
  });

  test("delete", async () => {
    const setResult = await Cache_Module.set({key: "a", value: "1"}, client);

    expect(setResult.error).toBeFalsy();
    expect(setResult.data).toBeTruthy();

    const deleteResult = await Cache_Module.delete({key: "a"}, client);

    expect(deleteResult.error).toBeFalsy();
    expect(deleteResult.data).toBeTruthy();

    const hasResult = await Cache_Module.has({key: "a"}, client);  

    expect(hasResult.error).toBeFalsy();
    expect(hasResult.data).toBeFalsy();
  });
});
