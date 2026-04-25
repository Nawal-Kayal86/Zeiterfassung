import fs from "fs";
import path from "path";

export function getDebugInfo(serverDir) {
  const info = {
    serverDir,
    cwd: process.cwd(),
    filesInCurrent: fs.readdirSync(serverDir),
    filesInParent: [],
    distFolderExists: false,
    distContent: [],
  };

  try {
    const parent = path.join(serverDir, "..");
    info.filesInParent = fs.readdirSync(parent);

    const distPath = path.join(serverDir, "../frontend/dist");
    if (fs.existsSync(distPath)) {
      info.distFolderExists = true;
      info.distContent = fs.readdirSync(distPath);
    }
  } catch (error) {
    info.error = error.message;
  }

  return info;
}
