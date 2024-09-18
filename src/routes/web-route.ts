import express from "express";
import WebController from "../controllers/WebController.js";

const WebRouter = express.Router();

const webController = new WebController();

WebRouter.get("/", webController.index);

WebRouter.get("/test-email-template", webController.testEmailTemplate);

export default WebRouter;
