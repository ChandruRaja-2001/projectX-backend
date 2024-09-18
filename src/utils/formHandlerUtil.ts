import { Request } from "express";
import {
  FileUploadProperties,
  ImageUploadProperties,
} from "../types/FileUploadType.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import formidable, { File, Files } from "formidable";
import fs from "fs/promises";
import {
  allowedImageMimeTypes,
  dangerousFileTypes,
  sanitizeFileName,
} from "./commonUtil.js";
import sharp from "sharp";
import loggerUtil from "./loggerUtil.js";

interface ResponseType {
  success: boolean;
  message: string;
  fileList: File[] | null;
  sanitizedFileName?: string | null;
  filesUploaded?: number;
  uploadedFileNames?: string[];
  totalFiles?: number;
}

const defaultMaxSize = 104857600; //100 mb
const defaultMaxWidth = 65535;

export const parseFormFieldsUtil = async (
  req: Request
): Promise<{ fields: any; files: Files }> => {
  const responseData: ResponseType = {
    success: false,
    message: "",
    fileList: null,
  };

  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (error, fields, files) => {
      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        loggerUtil.error(
          `formHandlerUtil (parseFormFieldsUtil) - Error while parsing form fields. Error: ${errorMessage}`
        );
        responseData.message = "Error while parsing form fields";
        return reject(responseData);
      }
      resolve({ fields, files });
    });
  });
};

export const validateFileUpload = async (
  files: Files,
  properties: FileUploadProperties
): Promise<ResponseType> => {
  const responseData: ResponseType = {
    success: false,
    message: "",
    fileList: null,
    sanitizedFileName: null,
  };

  const { maxSize, maxFiles, allowedTypes, fieldName, fileName } = properties;

  const setMaxSize =
    maxSize !== undefined ? maxSize * 1024 * 1024 : defaultMaxSize;

  if (
    Object.keys(files).length === 0 ||
    (fieldName && !files[fieldName]) ||
    (fieldName &&
      files[fieldName] &&
      Object.keys(files[fieldName]).length === 0)
  ) {
    responseData.message = "No files to upload!";
    return responseData;
  }

  if (fileName && typeof fileName != "string") {
    responseData.message = "Invalid file name!";
    return responseData;
  }

  try {
    if (fileName) {
      const sanitizedFileName = sanitizeFileName(fileName);
      responseData.sanitizedFileName = sanitizedFileName
        ? sanitizedFileName
        : null;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    loggerUtil.error(
      `formHandlerUtil (sanitizeFileName) - Error: ${errorMessage}`
    );
  }

  let filesData: File[] | Files = files;

  if (fieldName && files[fieldName]) {
    filesData = files[fieldName];
  }

  const fileList = Array.isArray(filesData)
    ? filesData
    : (Object.values(filesData).flat() as File[]);

  if (fileList.length > maxFiles) {
    responseData.message =
      "Maximum number of files reached! The limit is " + maxFiles;
    return responseData;
  }

  try {
    // Validate files
    for (const file of fileList) {
      if (file) {
        if (file.size >= setMaxSize) {
          responseData.message = `File is too large! Max size: ${(
            setMaxSize /
            (1024 * 1024)
          ).toFixed(2)} MB`;

          return responseData;
        } else if (
          file.mimetype &&
          allowedTypes &&
          !allowedTypes.includes(file.mimetype)
        ) {
          responseData.message = "Invalid file format!";
          return responseData;
        } else if (
          file.mimetype &&
          dangerousFileTypes.includes(file.mimetype)
        ) {
          responseData.message = "File type is not allowed!";
          return responseData;
        }
      }
    }

    if (fileList && Array.isArray(fileList)) {
      responseData.success = true;
      responseData.message = "All files are successfully verified!";
      responseData.fileList = fileList;
    } else {
      responseData.message = "File is not valid!";
    }
    return responseData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    loggerUtil.error(
      `formHandlerUtil (validateFileUpload) - Error while processing files. Error: ${errorMessage}`
    );
    responseData.message = "Error while processing files";
    return responseData;
  }
};

export const fileUploadUtil = async (
  files: Files,
  properties: FileUploadProperties
): Promise<ResponseType> => {
  const responseData: ResponseType = {
    success: false,
    message: "",
    fileList: null,
    totalFiles: 0,
  };

  const {
    success: validationSuccess,
    message: validationMessage,
    sanitizedFileName,
    fileList,
  } = await validateFileUpload(files, properties);

  if (!validationSuccess || !fileList) {
    responseData.success = validationSuccess;
    responseData.message = validationMessage;
    return responseData;
  }

  const { location } = properties;

  const fileName = sanitizedFileName ? sanitizedFileName : null;

  responseData.totalFiles = fileList.length;

  const failedFiles: File[] = [];

  try {
    await Promise.all(
      fileList.map(async (file) => {
        try {
          const extension = file.originalFilename
            ? path.extname(file.originalFilename)
            : "";

          const oldPath = file.filepath;

          if (extension && oldPath) {
            const randomName = uuidv4() + extension;
            const customFileName =
              fileList.length === 1 && fileName
                ? fileName + extension || randomName
                : randomName;
            const newPath = path.join(location, customFileName);

            file.newFilename = customFileName;

            await fs.copyFile(oldPath, newPath);
          } else {
            loggerUtil.error(
              `formHandlerUtil (fileUploadUtil) - Failed to process this file: ${file.originalFilename}`
            );
            failedFiles.push(file);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          loggerUtil.error(
            `formHandlerUtil (fileUploadUtil) - File could not be uploaded: ${file.originalFilename}. Error: ${errorMessage}`
          );
          failedFiles.push(file);
        }
      })
    );

    if (failedFiles.length > 0) {
      const uploadedFileNames: (string | number)[] = failedFiles.map(
        (f, k) => f.originalFilename || k + 1
      );
      responseData.filesUploaded = fileList.length - failedFiles.length;
      responseData.message = `There was an error while uploading these file(s): ${uploadedFileNames.join(
        ", "
      )}`;
    } else {
      responseData.success = true;
      responseData.filesUploaded = fileList.length;
      responseData.fileList = null;
      responseData.uploadedFileNames = fileList.map((f) => f.newFilename);
      responseData.message = "All files are successfully uploaded!";
    }
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    loggerUtil.error(`formHandlerUtil (fileUploadUtil) - Error: ${errMessage}`);
    responseData.message = errMessage;
  }

  return responseData;
};

export const imageUploadUtil = async (
  files: Files,
  properties: ImageUploadProperties
): Promise<ResponseType> => {
  const responseData: ResponseType = {
    success: false,
    message: "",
    fileList: null,
    filesUploaded: 0,
    totalFiles: 0,
  };

  const { location, height, width, maxWidth, preserveRatio, allowedTypes } =
    properties;

  if (!allowedTypes) {
    properties.allowedTypes = allowedImageMimeTypes;
  }

  // Validate files and properties
  const {
    success: validationSuccess,
    message: validationMessage,
    sanitizedFileName,
    fileList,
  } = await validateFileUpload(files, properties);

  if (!validationSuccess || !fileList) {
    responseData.success = validationSuccess;
    responseData.message = validationMessage;
    return responseData;
  }

  const fileName = sanitizedFileName ? sanitizedFileName : null;

  responseData.totalFiles = fileList.length;

  // Validation for height and width
  let setMaxWidth: number | undefined = maxWidth || defaultMaxWidth;

  let setPreserveRatio: boolean = preserveRatio || false;
  let setWidth: number | undefined = width || setMaxWidth;
  let setHeight: number | undefined = height;

  if (width && height) {
    setPreserveRatio = false;
  } else if (!width && !height && !maxWidth) {
    setPreserveRatio = true;
    setWidth = undefined;
    setHeight = undefined;
    setMaxWidth = undefined;
  }

  if (setWidth && setHeight && maxWidth && setWidth > maxWidth) {
    setWidth = maxWidth;
  }

  if (height && typeof height === "number" && height > defaultMaxWidth) {
    responseData.message = "Maximum allowable image height is 65535px";
    return responseData;
  } else if (width && width > defaultMaxWidth) {
    responseData.message = "Maximum allowable image width is 65535px";
    return responseData;
  }

  const failedFiles: File[] = [];

  try {
    await Promise.all(
      fileList.map(async (file) => {
        try {
          const fileBuffer = await fs.readFile(file.filepath);

          if (fileBuffer) {
            const mimetype = file.mimetype;

            let imageBuffer: Buffer | undefined;

            if (mimetype === "image/png") {
              imageBuffer = await sharp(fileBuffer)
                .resize(
                  setPreserveRatio ? setMaxWidth || undefined : setWidth,
                  setPreserveRatio ? undefined : setHeight
                )
                .png({
                  adaptiveFiltering: true,
                  quality: 90,
                })
                .toBuffer();
            } else if (mimetype === "image/jpg" || mimetype === "image/jpeg") {
              imageBuffer = await sharp(fileBuffer)
                .resize(
                  setPreserveRatio ? setMaxWidth || undefined : setWidth,
                  setPreserveRatio ? undefined : setHeight
                )
                .jpeg({
                  quality: setPreserveRatio ? 35 : 60,
                })
                .toBuffer();
            } else if (mimetype === "image/webp") {
              imageBuffer = await sharp(fileBuffer)
                .resize(
                  setPreserveRatio ? setMaxWidth || undefined : setWidth,
                  setPreserveRatio ? undefined : setHeight
                )
                .webp({
                  quality: setPreserveRatio ? 35 : 60,
                })
                .toBuffer();
            }

            let extension;
            if (file.originalFilename) {
              extension = path.extname(file.originalFilename);
            }

            if (imageBuffer && extension) {
              const customFileName =
                fileName && fileList.length === 1
                  ? `${fileName}${extension}`
                  : `${uuidv4()}${extension}`;

              file.newFilename = customFileName;

              await fs.writeFile(
                path.join(location, customFileName),
                imageBuffer
              );
            } else {
              loggerUtil.error(
                `formHandlerUtil (imageUploadUtil) - Error processing file: ${file.originalFilename}`
              );
              failedFiles.push(file);
            }
          } else {
            loggerUtil.error(
              `formHandlerUtil (imageUploadUtil) - Error processing file: ${file.originalFilename}`
            );
            failedFiles.push(file);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          loggerUtil.error(
            `formHandlerUtil (imageUploadUtil) - Error processing file: ${file.originalFilename}. Error: ${errorMessage}`
          );
          failedFiles.push(file);
        }
      })
    );

    if (failedFiles.length > 0) {
      const uploadedFileNames: (string | number)[] = failedFiles.map(
        (f, k) => f.originalFilename || k + 1
      );
      responseData.filesUploaded = fileList.length - failedFiles.length;
      responseData.message = `There was an error while uploading these image(s): ${uploadedFileNames.join(
        ", "
      )}`;
    } else {
      responseData.fileList = null;
      responseData.success = true;
      responseData.filesUploaded = fileList.length;
      responseData.uploadedFileNames = fileList.map((f) => f.newFilename);
      responseData.message = "All images processed successfully!";
    }
    return responseData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    loggerUtil.error(
      `formHandlerUtil (imageUploadUtil) - Error: ${errorMessage}`
    );

    responseData.message = errorMessage;
    return responseData;
  }
};
