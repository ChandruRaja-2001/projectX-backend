import { Request, Response } from "express";
import UserModel from "../models/UserModel.js";
import { createResponse } from "../utils/responseUtil.js";
import {
  fileUploadUtil,
  imageUploadUtil,
  parseFormFieldsUtil,
} from "../utils/formHandlerUtil.js";
import loggerUtil from "../utils/loggerUtil.js";
import {
  FileUploadProperties,
  ImageUploadProperties,
} from "../types/FileUploadType.js";

class ApiController {
  private userModel;

  constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  async getUser(req: Request, res: Response) {
    try {
      const data = await this.userModel.getUserByIdOrUserId({
        id: 1,
      });
      res.json(createResponse(data ? true : false, "Success!", data));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      loggerUtil.error(`Error in ApiController: ${errorMessage}`);
      res.status(500).json(createResponse(false, "An error occurred", null));
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const data = await this.userModel.getAllUsers();
      res.json(createResponse(data ? true : false, "Success!", data));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      loggerUtil.error(`Error in ApiController: ${errorMessage}`);
      res.status(500).json(createResponse(false, "An error occurred", null));
    }
  }

  async fileUploadTest(req: Request, res: Response) {
    try {
      // Necessary to parse the form data
      const { fields, files } = await parseFormFieldsUtil(req);

      //Get form fields like this
      const fileName = fields?.filename[0] || "";

      //Handle file uploads like this
      const fileUploadProperties: FileUploadProperties = {
        fileName: fileName,
        fieldName: "files",
        location: "uploads/public",
        maxFiles: 3,
        maxSize: 100,
      };
      const filesUploaded = await fileUploadUtil(files, fileUploadProperties);

      //Handle image upload like this
      const imageUploadProperties: ImageUploadProperties = {
        preserveRatio: true,
        fieldName: "images",
        fileName: fileName,
        location: "uploads/public",
        width: 700,
        height: 250,
        maxWidth: 600,
        maxFiles: 10,
      };
      const imagesUploaded = await imageUploadUtil(
        files,
        imageUploadProperties
      );

      const successStatus = filesUploaded.success && imagesUploaded.success;

      res.json(
        createResponse(
          successStatus,
          successStatus
            ? "Successfully uploaded all files!"
            : "Some error has occured!",
          {
            filesStatus: filesUploaded,
            imagesStatus: imagesUploaded,
          }
        )
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      loggerUtil.error(`Error in ApiController: ${errorMessage}`);
      res.status(500).json(createResponse(false, "An error occurred", null));
    }
  }
}

export default ApiController;
