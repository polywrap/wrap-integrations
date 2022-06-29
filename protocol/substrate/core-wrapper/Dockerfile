FROM rust:1.60.0 as base

# Install the wasm32 rust build target
RUN rustup target add wasm32-unknown-unknown

WORKDIR /build-deps

# Install curl
RUN apt-get update
RUN apt-get -y install curl clang llvm build-essential

# Install wasm-opt
RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_101/binaryen-version_101-x86_64-linux.tar.gz | tar -xz \
    && chmod +x binaryen-version_101/bin/wasm-opt \
    && cp binaryen-version_101/bin/wasm-opt /usr/local/bin/ \
    && rm -rf binary-version_101

# Install the toml-cli
RUN cargo install toml-cli

# Install wasm-snip
RUN cargo install wasm-snip

RUN cargo install -f wasm-bindgen-cli


WORKDIR /project

# Copy all manifest files
COPY polywrap.yaml .
COPY polywrap.build.yaml .

# Copy all source files
COPY module module


# Remove any Cargo.lock files
RUN rm -rf module/Cargo.lock

# Ensure the Wasm module is configured to use imported memory
ENV RUSTFLAGS="-C link-arg=-z -C link-arg=stack-size=65536 -C link-arg=--import-memory"

# Enable the wrap-invoke feature for the module module
RUN toml set ./module/Cargo.toml features.wrap-invoke [] > ./module/Cargo-local.toml && \
    rm -rf ./module/Cargo.toml && \
    mv ./module/Cargo-local.toml ./module/Cargo.toml && \
    true

# Cleanup an artifact left by the toml CLI program ("[]" -> [])
RUN sed -i 's/"\[\]"/\[\]/g' ./module/Cargo.toml

# Ensure the module at module has the crate-type = ["cdylib"]
RUN toml set ./module/Cargo.toml lib.crate-type ["cdylib","rlib"] > ./module/Cargo-local.toml && \
    rm -rf ./module/Cargo.toml && \
    mv ./module/Cargo-local.toml ./module/Cargo.toml && \
    true

# Clean up artifacts left by the toml CLI program ("["cdylib", "rlib"]" -> ["cdylib", "rlib"])
RUN sed -i 's/"\[cdylib,rlib\]"/\["cdylib","rlib"\]/g' ./module/Cargo.toml

# Ensure the package name = "module"
RUN toml set ./module/Cargo.toml package.name "module" > ./module/Cargo-local.toml && \
    rm -rf ./module/Cargo.toml && \
    mv ./module/Cargo-local.toml ./module/Cargo.toml && \
    true

# Make the build directory
RUN rm -rf ./build
RUN mkdir ./build

# Build the module at module
RUN cargo build --manifest-path ./module/Cargo.toml \
    --target wasm32-unknown-unknown --release --features "wrap-invoke"

# Enable the "WASM_INTERFACE_TYPES" feature, which will remove the __wbindgen_throw import.
# See: https://github.com/rustwasm/wasm-bindgen/blob/7f4663b70bd492278bf0e7bba4eeddb3d840c868/crates/cli-support/src/lib.rs#L397-L403
ENV WASM_INTERFACE_TYPES=1

# Run wasm-bindgen over the module, replacing all placeholder __wbindgen_... imports
RUN wasm-bindgen ./module/target/wasm32-unknown-unknown/release/module.wasm --out-dir ./build --out-name bg_module.wasm

RUN wasm-snip ./build/bg_module.wasm -o ./build/snipped_module.wasm

# Use wasm-opt to perform the "asyncify" post-processing step over all modules
RUN wasm-opt --asyncify -Os ./build/snipped_module.wasm -o ./build/module.wasm && \
    rm -rf ./build/snipped_module.wasm