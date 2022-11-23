import {
  Http_FormDataEntry,
  DirectoryEntry,
  DirectoryBlob,
  FileEntry
} from "../wrap";
import { encodeURIComponent } from ".";
import { encode } from "as-base64";

export function convertDirectoryBlobToFormData(directoryBlob: DirectoryBlob): Array<Http_FormDataEntry> {
    const formData: Http_FormDataEntry[] = []
    convertFileEntriesToFormData(directoryBlob.files, "", formData);
    convertDirectoryEntryToFormData(directoryBlob.directories, "", formData);
    return formData;
}

function convertFileEntriesToFormData(files: FileEntry[], path: string, formData: Http_FormDataEntry[]): void {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path + file.name;
        formData.push({
            name: filePath,
            value: encode(Uint8Array.wrap(file.data)),
            fileName: encodeURIComponent(filePath),
            _type: "application/octet-stream",
        });
    }
}

function convertDirectoryEntryToFormData(dirs: DirectoryEntry[], path: string, formData: Http_FormDataEntry[]): void {
    for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        const dirPath = path + dir.name;
        formData.push({
            name: dirPath,
            value: null,
            fileName: encodeURIComponent(dirPath),
            _type: "application/x-directory",
        });
        const newPath = path + dir.name + "/";
        convertFileEntriesToFormData(dir.files, newPath, formData);
        convertDirectoryEntryToFormData(dir.directories, newPath, formData);
    }
}