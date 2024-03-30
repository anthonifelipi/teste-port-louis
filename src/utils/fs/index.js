import fs from "fs/promises";
import os from "os";

export async function readFile(path) {
  try {
    const file = await fs.readFile(path, "utf8");
    return file
      .split(os.EOL)
      .map((line) => line.trim())
      .filter((line) => line) 
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error(`Error parsing JSON from line in file ${path}:`, line);
          return null;
        }
      })
      .filter((item) => item !== null); 
  } catch (error) {
    console.error("Error reading the file: ", error);
    throw error; 
  }
}

export async function writeFile(path, data) {
  try {
    const stringData =
      typeof data === "object" ? JSON.stringify(data, null, 2) : data;
    await fs.writeFile(path, stringData);
    return true;
  } catch (error) {
    console.error("Error writing the file:", error);
    throw error;
  }
}

export async function listFiles(path, extensionFilter = "") {
  try {
    const files = await fs.readdir(path);

    if (extensionFilter) {
      return files.filter((file) => file.endsWith(extensionFilter));
    }

    return files;
  } catch (error) {
    console.error("Error listing directory: ", error);
    throw error;
  }
}

export function textJson(data) {
  try {
    return data.map((item) => JSON.stringify(item, null, 2)).join("\n");
  } catch (error) {
    console.error("Error converting to text/JSON:", error);
    throw error;
  }
}
