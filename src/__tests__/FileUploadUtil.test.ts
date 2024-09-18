// Includes both file and image uploads

import { describe, it, expect, afterAll } from "vitest";
import request, { Response } from "supertest";
import app from "../app.js";
import path from "path";
import fs from "fs/promises";

const rootDir: string = process.cwd();

describe("Should return success status and uploaded file names", () => {
  let uploadedTestFiles: string[] = [];

  it("Check file upload utility for all files and images", async () => {
    const response = await request(app)
      .post("/server/file-upload-test")
      .field("filename", "customFileNameTest")
      .attach(
        "files",
        path.join(rootDir, "assets", "testfiles", "testFile.txt")
      )
      .attach(
        "files",
        path.join(rootDir, "assets", "testfiles", "testFile2.txt")
      )
      .attach(
        "images",
        path.join(rootDir, "assets", "testfiles", "testImage.png")
      )
      .attach(
        "images",
        path.join(rootDir, "assets", "testfiles", "testImage.jpg")
      )
      .attach(
        "images",
        path.join(rootDir, "assets", "testfiles", "testImage.webp")
      );

    updateResponseFiles(response);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.filesStatus.filesUploaded).toBe(2);
    expect(response.body.data.imagesStatus.filesUploaded).toBe(3);
  });

  it("Check file upload utility for single file and image", async () => {
    const response = await request(app)
      .post("/server/file-upload-test")
      .field("filename", "customFileNameTest")
      .attach(
        "files",
        path.join(rootDir, "assets", "testfiles", "testFile.txt")
      )
      .attach(
        "images",
        path.join(rootDir, "assets", "testfiles", "testImage.png")
      );

    updateResponseFiles(response);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.filesStatus.filesUploaded).toBe(1);
    expect(response.body.data.imagesStatus.filesUploaded).toBe(1);
  });

  function updateResponseFiles(response: Response) {
    if (response.body.data) {
      if (response.body.data.filesStatus) {
        response.body.data.filesStatus.uploadedFileNames.forEach(
          (f: string) => {
            uploadedTestFiles.push(f);
          }
        );
      }
      if (response.body.data.imagesStatus) {
        response.body.data.imagesStatus.uploadedFileNames.forEach(
          (f: string) => {
            uploadedTestFiles.push(f);
          }
        );
      }
    }
  }

  async function cleanUpFiles() {
    for (const file of uploadedTestFiles) {
      const filePath = path.join("uploads/public", file);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${file}`);
      } catch (err) {
        console.error(`Failed to delete file: ${file}`, err);
      }
    }
  }

  afterAll(async () => {
    await cleanUpFiles();
  });
});
