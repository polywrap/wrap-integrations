import { PolywrapClient } from "@polywrap/client-js";
import path from "path";

jest.setTimeout(60000);

describe("Template Wrapper End to End Tests", () => {
  const client: PolywrapClient = new PolywrapClient();
  let wrapperUri: string;

  beforeAll(() => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;
  });

  it("serializes near transaction", async () => {
    const resolved = await client.resolveUri("wrap://ipfs/QmPXKHNEJ6vVcLY5sfiP4UiVA7TfR3vK2P84hdKQnHUn3i")
    console.log(resolved)
  });
});
