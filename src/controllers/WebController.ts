import { Request, Response } from "express";
import { srcDir } from "../utils/commonUtil.js";
import path from "path";

class WebController {
  index(req: Request, res: Response) {
    res.sendFile(path.join(srcDir, "views", "example.html"));
  }

  testEmailTemplate(req: Request, res: Response) {
    res.render(path.join(srcDir, "views", "email", "layout"));
  }
}

export default WebController;
