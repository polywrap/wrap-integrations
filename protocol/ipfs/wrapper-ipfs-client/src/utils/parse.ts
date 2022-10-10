import { AddResult } from "../wrap";
import { JSON } from "@polywrap/wasm-as";
import { ipfsError } from "./error";

export function parseResolveResponse(body: string): string {
    const responseObj: JSON.Obj = <JSON.Obj>(JSON.parse(body));
    const responseStr: JSON.Str | null = responseObj.getString("Path")!;
    if (responseStr !== null) {
        return responseStr.valueOf();
    }
    throw new Error(ipfsError("resolve", `Failed to parse malformed response: ${body}`));
}

export function parseAddResponse(body: string): AddResult {
    const addResult: AddResult = { name: "", hash: "", size: "" };
    const responseObj: JSON.Obj = <JSON.Obj>(JSON.parse(body));

    const nameOrNull: JSON.Str | null = responseObj.getString("Name");
    if (nameOrNull !== null) {
        addResult.name = nameOrNull.valueOf();
    }

    const hashOrNull: JSON.Str | null = responseObj.getString("Hash");
    if (hashOrNull !== null) {
        addResult.hash = hashOrNull.valueOf();
    }

    const sizeOrNull: JSON.Str | null = responseObj.getString("Size");
    if (sizeOrNull !== null) {
        addResult.size = sizeOrNull.valueOf();
    }

    return addResult;
}

export function parseAddDirectoryResponse(body: string): AddResult[] {
    let results: AddResult[] = []
    const rawResults = body.split("\n");
    // TODO: should this loop stop at length - 1?
    for (let i = 0; i < rawResults.length - 1; i++) {
        const parsedResult = parseAddResponse(rawResults[i]);
        results.push(parsedResult)
    }
    return results;
}