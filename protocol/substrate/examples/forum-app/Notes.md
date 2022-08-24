# Notes

- `index.ts` has to be compiled using parcel

- `signer.ts` has to be compiled using webpack


webpack isn't able to compile `index.ts`

parcel can compile the content in `signer.ts` but there will be a runtime
error: `Uncaught SyntaxError: import.meta may only appear in a module`

