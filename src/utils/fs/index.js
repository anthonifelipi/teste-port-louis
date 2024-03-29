import fs from "fs/promises";
import os from "os";

const line = os.EOL;

export async function readFile(path) {
  try {
    const file = await fs.readFile(path, "utf8");
    const data = file
      .split(line)
      .map((item) => item && JSON.parse(item.trim()))
      .filter((item) => item);
    return data;
  } catch (error) {
    console.error("Error reading the file: ", error);
  }
}

export async function writeFile(path, data) {
  try {
    await fs.writeFile(path, data);
    console.log(`File ${path} created sucess!`);
  } catch (error) {
    console.error("Error writing the file:", error);
    return error;
  }
}

export async function listFiles(path) {
  try {
    const files = await fs.readdir(path, "utf8");
    return files;
  } catch (error) {
    console.error("Error list directory: ", error);
    throw error;
  }
}

export function textJson(data) {
  try {
    return data.map((item) => JSON.stringify(item)).join("\n");
  } catch (error) {
    console.error("Error converting to text/JSON:", error);
    return error;
  }
}

// export function textJson(data) {
//   let text = "";

//   data.forEach((object) => {
//     text += JSON.stringify(object) + "\n";
//   });

//   return text;
// }
