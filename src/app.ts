import { NextFunction, Request, Response } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import WebRouter from "./routes/web-route.js";
import ApiRouter from "./routes/api-route.js";
import loggerUtil from "./utils/loggerUtil.js";
import path from "path";
import { srcDir } from "./utils/commonUtil.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "PUT", "POST", "DELETE"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  loggerUtil.error(`Error in app.ts: ${errorMessage}`);

  res.status(500).json({ error: "Something went wrong!" });
});

app.use(WebRouter);

app.use("/server", ApiRouter);

app.use((req, res) => {
  res.status(404).sendFile(path.join(srcDir, "views", "404.html"));
});

export default app;
