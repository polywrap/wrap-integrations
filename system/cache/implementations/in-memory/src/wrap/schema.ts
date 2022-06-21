/// NOTE: This is an auto-generated file.
///       All modifications will be overwritten.

export const schema: string = `### Polywrap Header START ###
scalar UInt
scalar UInt8
scalar UInt16
scalar UInt32
scalar Int
scalar Int8
scalar Int16
scalar Int32
scalar Bytes
scalar BigInt
scalar BigNumber
scalar JSON
scalar Map

directive @imported(
  uri: String!
  namespace: String!
  nativeType: String!
) on OBJECT | ENUM

directive @imports(
  types: [String!]!
) on OBJECT

directive @capability(
  type: String!
  uri: String!
  namespace: String!
) repeatable on OBJECT

directive @enabled_interface on OBJECT

directive @annotate(type: String!) on FIELD

### Polywrap Header END ###

type Module implements Cache_Module @imports(
  types: [
    "Cache_Module"
  ]
) {
  get(
    key: String!
  ): String

  has(
    key: String!
  ): Boolean!

  set(
    key: String!
    value: String!
    timeout: Int
  ): Boolean!

  add(
    key: String!
    value: String!
    timeout: Int
  ): Boolean!

  delete(
    key: String!
  ): Boolean!

  clear: Boolean!
}

### Imported Modules START ###

type Cache_Module @imported(
  uri: "ens/interface.cache.polywrap.eth",
  namespace: "Cache",
  nativeType: "Module"
) {
  """
  Look up key in the cache and return the value for it if exists otherwise returns null
  """
  get(
    key: String!
  ): String

  """
  Checks if a key exists in the cache without returning it.
  """
  has(
    key: String!
  ): Boolean!

  """
  Add a new key/value to the cache (overwrites value, if key already exists in the cache).
  """
  set(
    key: String!
    value: String!
    timeout: Int
  ): Boolean!

  """
  Works like set() but does not overwrite the values of already existing keys.
  """
  add(
    key: String!
    value: String!
    timeout: Int
  ): Boolean!

  """
  Delete key from the cache. Returns true if key exists in cache and has been deleted successfully
  """
  delete(
    key: String!
  ): Boolean!

  """
  Clears the whole cache. 
  """
  clear: Boolean!
}

### Imported Modules END ###

### Imported Objects START ###

### Imported Objects END ###
`;
