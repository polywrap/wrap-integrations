import { PolywrapClient } from "@polywrap/client-js";
import { msgpackEncode } from "@polywrap/msgpack-js";
import fs from "fs";

const client = new PolywrapClient();


fs.writeFileSync(
  "./build/wrap.info",
  msgpackEncode({
    abi: {
      moduleType: {
        type: "Module",
        kind: 128,
        methods: [
          {
            type: "Method",
            name: "get",
            required: true,
            kind: 64,
            arguments: [
              {
                type: "String",
                name: "key",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "key",
                  required: true,
                  kind: 4,
                },
              },
            ],
            return: {
              type: "String",
              name: "get",
              kind: 34,
              scalar: {
                type: "String",
                name: "get",
                kind: 4,
              },
            },
            comment:
              "Look up key in the cache and return the value for it if exists otherwise returns null",
          },
          {
            type: "Method",
            name: "has",
            required: true,
            kind: 64,
            arguments: [
              {
                type: "String",
                name: "key",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "key",
                  required: true,
                  kind: 4,
                },
              },
            ],
            return: {
              type: "Boolean",
              name: "has",
              required: true,
              kind: 34,
              scalar: {
                type: "Boolean",
                name: "has",
                required: true,
                kind: 4,
              },
            },
            comment:
              "Checks if a key exists in the cache without returning it.",
          },
          {
            type: "Method",
            name: "set",
            required: true,
            kind: 64,
            arguments: [
              {
                type: "String",
                name: "key",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "key",
                  required: true,
                  kind: 4,
                },
              },
              {
                type: "String",
                name: "value",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "value",
                  required: true,
                  kind: 4,
                },
              },
              {
                type: "Int",
                name: "timeout",
                kind: 34,
                scalar: {
                  type: "Int",
                  name: "timeout",
                  kind: 4,
                },
              },
            ],
            return: {
              type: "Boolean",
              name: "set",
              required: true,
              kind: 34,
              scalar: {
                type: "Boolean",
                name: "set",
                required: true,
                kind: 4,
              },
            },
            comment:
              "Add a new key/value to the cache (overwrites value, if key already exists in the cache).",
          },
          {
            type: "Method",
            name: "add",
            required: true,
            kind: 64,
            arguments: [
              {
                type: "String",
                name: "key",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "key",
                  required: true,
                  kind: 4,
                },
              },
              {
                type: "String",
                name: "value",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "value",
                  required: true,
                  kind: 4,
                },
              },
              {
                type: "Int",
                name: "timeout",
                kind: 34,
                scalar: {
                  type: "Int",
                  name: "timeout",
                  kind: 4,
                },
              },
            ],
            return: {
              type: "Boolean",
              name: "add",
              required: true,
              kind: 34,
              scalar: {
                type: "Boolean",
                name: "add",
                required: true,
                kind: 4,
              },
            },
            comment:
              "Works like set() but does not overwrite the values of already existing keys.",
          },
          {
            type: "Method",
            name: "delete",
            required: true,
            kind: 64,
            arguments: [
              {
                type: "String",
                name: "key",
                required: true,
                kind: 34,
                scalar: {
                  type: "String",
                  name: "key",
                  required: true,
                  kind: 4,
                },
              },
            ],
            return: {
              type: "Boolean",
              name: "delete",
              required: true,
              kind: 34,
              scalar: {
                type: "Boolean",
                name: "delete",
                required: true,
                kind: 4,
              },
            },
            comment:
              "Delete key from the cache. Returns true if key exists in cache and has been deleted successfully",
          },
          {
            type: "Method",
            name: "clear",
            required: true,
            kind: 64,
            return: {
              type: "Boolean",
              name: "clear",
              required: true,
              kind: 34,
              scalar: {
                type: "Boolean",
                name: "clear",
                required: true,
                kind: 4,
              },
            },
            comment: "Clears the whole cache. ",
          },
        ],
      },
    },
    name: "cache-interface",
    type: "interface",
    version: "0.1.0",
  })
);

client
  .getManifest("fs/./build", {})
  .then((x) => console.log(JSON.stringify(x)));

