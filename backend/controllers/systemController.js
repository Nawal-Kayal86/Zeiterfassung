import { createHttpError } from "../utils/http.js";
import { getDebugInfo } from "../services/systemService.js";

export async function debugCheck(req, res) {
  if (process.env.NODE_ENV === "production") {
    throw createHttpError(404, "Nicht gefunden");
  }

  res.json(getDebugInfo(req.app.locals.serverDir));
}
