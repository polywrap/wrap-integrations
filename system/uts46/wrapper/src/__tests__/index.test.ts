import { PolywrapClient } from "@polywrap/client-js";
const uts46 = require("idna-uts46-hx/uts46bundle.js");
import path from "path";
import * as Wrap from "./types/wrap";
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

      expect(response.error).toBeUndefined();
      expect(response.data).toBe(expected);
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

      expect(response.error).toBeUndefined();
      expect(response.data.value).toBe(expected);
    });

    it("Convert matches", async () => {

      for (const text of cases) {
        const expected = uts46.convert(text);
        const response = await client.invoke<Wrap.Uts46_ConvertResult>({
          uri: fsUri,
          method: "convert",
          args: {
            value: text
          }
        });

        expect(response.error).toBeUndefined();
        expect(response.data).toStrictEqual(expected);
      }
    });
  });
});
