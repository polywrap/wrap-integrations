import {
  Http_FormDataEntry,
  DirectoryEntry,
  DirectoryBlob,
  FileEntry
} from "../wrap";
import { encodeURIComponent } from ".";

export function convertDirectoryBlobToFormData(directoryBlob: DirectoryBlob): Array<Http_FormDataEntry> {
    const formData: Http_FormDataEntry[] = []
    convertFileEntriesToFormData(directoryBlob.files, "", formData);
    convertDirectoryEntryToFormData(directoryBlob.directories, "", formData);
    return formData;
}

function convertFileEntriesToFormData(files: FileEntry[], path: string, formData: Http_FormDataEntry[]): void {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.push({
            key: file.name,
            data: String.UTF8.decode(file.data),
            options: {
                contentType: "application/octet-stream",
                fileName: encodeURIComponent(path + file.name),
                filePath: null
            }
        });
    }
}

function convertDirectoryEntryToFormData(dirs: DirectoryEntry[], path: string, formData: Http_FormDataEntry[]): void {
    for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        formData.push({
            key: dir.name,
            data: null,
            options: {
                contentType: "application/x-directory",
                fileName: encodeURIComponent(dir.name),
                filePath: ""
            }
        });
        const newPath = path + dir.name + "/";
        convertFileEntriesToFormData(dir.files, newPath, formData);
        convertDirectoryEntryToFormData(dir.directories, newPath, formData);
    }
}