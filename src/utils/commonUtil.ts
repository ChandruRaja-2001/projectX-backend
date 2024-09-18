import { fileURLToPath } from "url";
import path from "path";
import { ImageMimeTypes } from "../types/FileUploadType.js";

// Get the directory name of the current module
export const currentDir: string = path.dirname(fileURLToPath(import.meta.url));

// Calculate src directory relative to current directory
export const srcDir: string = path.resolve(currentDir, "..", "..", "src");

// To get the root directory
export const rootDir: string = process.cwd();

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[\/\\?%*:|"<>]/g, "_");
};

export const dangerousFileTypes: string[] = [
  // Executable and script file types
  "application/x-msdownload",
  "application/x-sh",
  "application/x-perl",
  "application/x-php",
  "application/x-python",
  "application/x-ruby",
  "application/x-msdos-program",
  "application/x-java-archive",
  "application/x-mswinurl",
  "text/x-script.sh",
  "text/x-php",
  "text/x-python",
  "text/x-ruby",
  "text/html",
  "text/javascript",
  "text/css",
  "text/xml",
  "text/x-csrc",
  "text/x-c++src",
  "application/x-ns-proxy-autoconfig",
  "application/x-httpd-php",
  "application/x-httpd-cgi",
  "application/x-cgi",
  "application/x-bat",
  "application/x-ms-dos-executable",
  "application/sql",
  "application/x-sql",
];

export const allowedImageMimeTypes: ImageMimeTypes[] = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
