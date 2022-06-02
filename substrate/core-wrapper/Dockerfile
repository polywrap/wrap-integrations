FROM rustlang/rust:nightly as base

# Install the wasm32 rust build target
RUN rustup target add wasm32-unknown-unknown

WORKDIR /build-deps

# Install curl
RUN apt-get update
RUN apt-get -y install curl

# Install wasm-opt
RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_101/binaryen-version_101-x86_64-linux.tar.gz | tar -xz \
    && chmod +x binaryen-version_101/bin/wasm-opt \
    && cp binaryen-version_101/bin/wasm-opt /usr/local/bin/ \
    && rm -rf binary-version_101

# Install the toml-cli
RUN cargo install toml-cli

WORKDIR /project

# Copy all manifest files
COPY web3api.yaml .
COPY web3api.build.yaml .

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
RUN cargo +nightly build --manifest-path ./module/Cargo.toml \
    --target wasm32-unknown-unknown --release --features "w3-invoke"


# Make the build directory
RUN mkdir ./build

# Use wasm-opt to perform the "asyncify" post-processing step over all modules
RUN wasm-opt --asyncify -O2 ./module/target/wasm32-unknown-unknown/release/mutation.wasm -o ./build/mutation.wasm
