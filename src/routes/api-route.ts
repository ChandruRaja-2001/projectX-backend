import express from "express";
import ApiController from "../controllers/ApiController.js";
import ExampleModel from "../models/UserModel.js";
import { createResponse } from "../utils/responseUtil.js";

const ApiRouter = express.Router();

const exampleModel = new ExampleModel();

const apiController = new ApiController(exampleModel);

ApiRouter.get("/", apiController.getUser.bind(apiController));
ApiRouter.get("/all-users", apiController.getAllUsers.bind(apiController));
ApiRouter.post(
  "/file-upload-test",
  apiController.fileUploadTest.bind(apiController)
);

ApiRouter.use((req, res) => {
  res.status(404).json(createResponse(false, "Unknown API endpoint."));
});

export default ApiRouter;
