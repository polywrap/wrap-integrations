# @polywrap/logger-plugin-js
The Logger plugin implements the `logger-interface` @ [ens/wrappers.polywrap.eth:logger@1.0.0](https://app.ens.domains/name/wrappers.polywrap.eth/details) (see [./src/schema.graphql](./src/schema.graphql)). By default, it logs all events using the Javascript `console` global object. You can circumvent this functionality by setting the `logFunc` property on the plugin's config (examples below).

## Usage
### 1. Configure Client
When creating your Polywrap JS client, add the logger plugin:
```typescript
import { PolywrapClient } from "@polywrap/client-js";
import { loggerPlugin } from "@polywrap/logger-plugin-js";

const client = new PolywrapClient({
  // 1. Add the plugin package @ an arbitrary URI
  packages: [{
    uri: "plugin/logger",
    package: loggerPlugin({ })
  }],
  // 2. Register this plugin as an implementation of the interface
  interfaces: [{
    interface: "ens/wrappers.polywrap.eth:logger@1.0.0",
    implementations: ["plugin/logger"]
  }],
  // 3. Redirect invocations @ the interface to the plugin (default impl)
  redirects: [{
    from: "ens/wrappers.polywrap.eth:logger@1.0.0",
    to: "plugin/logger",
  }]
});
```

### 2. Invoke The Logger
Invocations to the logger plugin can be made via the interface URI (which will get redirected), or the plugin's URI directly:
```typescript
await client.invoke({
  uri: "ens/wrappers.polywrap.eth:logger@1.0.0" | "plugin/logger",
  method: "log",
  args: {
    level: "INFO",
    message: "foo bar baz"
  }
});
```

### 3. Customize The Logger
When adding the logger to your client, you can add your own custom log function:
```typescript
new PolywrapClient({
  packages: [{
    uri: "plugin/logger",
    package: loggerPlugin({
      logFunc: (level: string, message: string): void => {
        // add your own logic here...
      }
    })
  }],
  ...
})
```

### 4. Add Multiple Loggers
Multiple logger implementations can be added to the client:
```typescript
const client = new PolywrapClient({
  packages: [
    {
      uri: "plugin/logger",
      package: loggerPlugin({ })
    },
    {
      uri: "plugin/custom-logger",
      package: loggerPlugin({ logFunc: ... })
    }
  ],
  redirects: [{
    from: "ens/wrappers.polywrap.eth:logger@1.0.0",
    to: "plugin/logger"
  }],
  interfaces: [{
    interface: "ens/wrappers.polywrap.eth:logger@1.0.0",
    implementations: ["plugin/logger", "plugin/custom-logger"]
  }]
});
```

### 5. Invoke All Logger Implementations
When you'd like to log something to more than one logger, you can invoke all implementations of the logger interface:
```typescript
const result = await client.getImplementations(
  "ens/wrappers.polywrap.eth:logger@1.0.0"
);

const implementations: string[] = result.ok ? result.value : [];

for (const impl of implementations) {
  await client.invoke({
    uri: impl,
    method: "log",
    args: {
      level: "INFO",
      message: "message"
    }
  });
}
```
