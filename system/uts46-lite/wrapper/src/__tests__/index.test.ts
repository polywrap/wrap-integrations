import { PolywrapClient } from "@polywrap/client-js";
const uts46 = require("idna-uts46-hx/uts46bundle.js");
import path from "path";
import { Uts46_UnicodeResult } from "./types/wrap";

describe("IDNA UTS #46", () => {
  const cases = ["xn-bb-eka.at", 'öbb.at', 'xn--fa-hia.de'];
  const textToConvert = cases[0];

  let client: PolywrapClient = new PolywrapClient();
  let fsUri: string;

  beforeAll(() => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..");
    fsUri = `fs/${wrapperPath}/build`;
  });

  describe("Returned values match the plugin's", () => {
    it("ToAscii matches", async () => {
      const expected = uts46.toAscii(textToConvert);
      const response = await client.invoke<string>({
        uri: fsUri,
        method: "toAscii",
        args: {
          value: textToConvert
        }
      });

      if (!response.ok) throw response.error;
      expect(response.value).toBe(expected);
    });

    it("ToUnicode matches", async () => {
      const expected = uts46.toUnicode(textToConvert);
      const response = await client.invoke<Uts46_UnicodeResult>({
        uri: fsUri,
        method: "toUnicode",
        args: {
          value: textToConvert
        }
      });

      if (!response.ok) throw response.error;
      expect(response.value.value).toBe(expected);
    });
  });
});
