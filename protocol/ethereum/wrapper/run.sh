# Ensure the Wasm module is configured to use imported memory
export RUSTFLAGS="-C link-arg=-z -C link-arg=stack-size=65536 -C link-arg=--import-memory"

cargo build --target wasm32-unknown-unknown --release

mkdir -p ./build
rm -f ./build/wrap.wasm

# Enable the "WASM_INTERFACE_TYPES" feature, which will remove the __wbindgen_throw import.
# See: https://github.com/rustwasm/wasm-bindgen/blob/7f4663b70bd492278bf0e7bba4eeddb3d840c868/crates/cli-support/src/lib.rs#L397-L403
export WASM_INTERFACE_TYPES=1

# Run wasm-bindgen over the module, replacing all placeholder __wbindgen_... imports
wasm-bindgen ./target/wasm32-unknown-unknown/release/module.wasm --out-dir ./build --out-name bg_module.wasm

wasm-snip ./build/bg_module.wasm -o ./build/snipped_module.wasm && \
    rm -rf ./build/bg_module.wasm

# Use wasm-opt to perform the "asyncify" post-processing step over all modules
wasm-opt --asyncify -Os ./build/snipped_module.wasm -o ./build/wrap.wasm && \
    rm -rf ./build/snipped_module.wasm

