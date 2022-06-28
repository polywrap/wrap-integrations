#FROM rustlang/rust:nightly-slim as base
FROM rust:1.60.0-slim-bullseye as base
#FROM rust:1.60.0 as base

# Install the wasm32 rust build target
RUN rustup target add wasm32-unknown-unknown

WORKDIR /build-deps

# Install curl
RUN apt-get update

# Install prerequisites
RUN apt-get -y install curl clang llvm build-essential pkg-config libssl-dev


# Install wasm-opt
RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_101/binaryen-version_101-x86_64-linux.tar.gz | tar -xz \
    && chmod +x binaryen-version_101/bin/wasm-opt \
    && cp binaryen-version_101/bin/wasm-opt /usr/local/bin/ \
    && rm -rf binary-version_101

# Install the toml-cli
RUN cargo install toml-cli

# Install wasm-snip
RUN cargo install wasm-snip

# Install wasm-bindgen-cli
RUN cargo install -f wasm-bindgen-cli


# Set environment variable for wasm bindgen cli
ENV WASM_INTERFACE_TYPES=1



WORKDIR /project

# Copy all manifest files
COPY web3api.yaml .

# Copy all source files
COPY module module


# Remove any Cargo.lock files
RUN rm -rf module/Cargo.lock

# Ensure the Wasm module is configured to use imported memory
ENV RUSTFLAGS="-C link-arg=-z -C link-arg=stack-size=65536 -C link-arg=--import-memory"

# Enable the w3-invoke feature for the module module
RUN toml set ./module/Cargo.toml features.w3-invoke [] > ./module/Cargo-local.toml && \
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

# Build the module at module
RUN cargo build --manifest-path ./module/Cargo.toml \
    --target wasm32-unknown-unknown --release --features "w3-invoke"


# Make the build directory
RUN mkdir ./build

# Show the build wasm file
RUN ls -lah ./module/target/wasm32-unknown-unknown/release/

# Use wasm-bindgen to remove wbindgen_placeholder, 
# wasm-opt to perform the "asyncify" post-processing step over all modules
RUN WASM_MODULE=$(ls ./module/target/wasm32-unknown-unknown/release/*.wasm); \
    wasm-bindgen $WASM_MODULE  --out-dir ./build/ --out-name bindgen_mutation.wasm && \
    wasm-snip ./build/bindgen_mutation.wasm -o ./build/snipped_mutation.wasm && \
    wasm-opt --asyncify -Os ./build/snipped_mutation.wasm -o ./build/mutation.wasm && \
    rm -rf ./build/snipped_mutation.wasm
