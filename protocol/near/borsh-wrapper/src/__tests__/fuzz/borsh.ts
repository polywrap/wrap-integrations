const {
  ensAddresses,
  initTestEnvironment,
  providers,
} = require("@polywrap/test-env-js");
const { PolywrapClient } = require("@polywrap/client-js");
const testUtils = require("../utils");

//@ts-ignore
exports.fuzz = async (input) => {
  await initTestEnvironment();
  const borshPath = __dirname + "/../../../build";
  const borshWrapperUri = `fs/${borshPath}`;
  const nearConfig = await testUtils.setUpTestConfig();

  const polywrapConfig = testUtils.getPlugins(
    providers.ethereum,
    ensAddresses.ensAddress,
    providers.ipfs,
    nearConfig
  );
  const client = new PolywrapClient(polywrapConfig);

  try {
    console.log("input", input);
    const { data: deserialized } = await client.invoke({
      uri: borshWrapperUri,
      method: "deserializeTransaction",
      args: {
        transactionBytes: input,
      },
    });
    //@ts-ignore

    const { data: serialized } = await client.invoke<Uint8Array>({
      uri: borshWrapperUri,
      method: "serializeTransaction",
      args: {
        transaction: deserialized,
      },
    });

    if (!serialized?.length === input?.length) {
      console.log(
        `Mismatching output:\n${serialized.toString(
          "hex"
        )}\nand input:\n${input.toString("hex")}`
      );
      throw new Error("Mismatching input and output");
    }
  } catch (e) {
    if (e instanceof Error) {
      // Do nothing
    } else {
      throw e;
    }
  }
};
