import { describe, it, expect, vi } from "vitest";
import formidable from "formidable";
import { parseFormFieldsUtil } from "../utils/formHandlerUtil.js";
import { Request } from "express";
import path from "path";
import { rootDir } from "../utils/commonUtil.js";

vi.mock("formidable");

describe("parseFormFieldsUtil", () => {
  it("Should parse form fields and files correctly", async () => {
    const mockFields = { filename: ["testFileName"] };
    const mockFiles = {
      files: [
        {
          filepath: path.join(rootDir, "assets", "testfiles", "testFile.txt"),
          originalFilename: "testFile.txt",
          mimetype: "text/plain",
        },
      ],
    };

    (formidable as any).mockImplementation(() => ({
      parse: (
        req: Request,
        callback: (err: any, fields: any, files: any) => void
      ) => {
        callback(null, mockFields, mockFiles);
      },
    }));

    const req = {} as Request;

    const { fields, files } = await parseFormFieldsUtil(req);

    expect(fields).toEqual(mockFields);
    expect(files).toEqual(mockFiles);
  });

  it("should handle errors during parsing", async () => {
    (formidable as any).mockImplementation(() => ({
      parse: (
        req: Request,
        callback: (err: any, fields: any, files: any) => void
      ) => callback(new Error("Parse Error"), null, null),
    }));

    const req = {} as Request;

    await expect(parseFormFieldsUtil(req)).rejects.toEqual({
      success: false,
      message: "Error while parsing form fields",
      fileList: null,
    });
  });
});
