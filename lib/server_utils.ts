import path from "path";
import fs from "fs";

export async function uploadImage(
  image: File,
  name: string,
  destinationPath: string
) {
  try {
    const fileExtension = image.name.split(".").pop();

    let filename = `${
      name.trim().toLowerCase().split(" ")?.join("-") || "default-image"
    }.${fileExtension}`;

    const uploadDir = path.join(process.cwd(), `public${destinationPath}`);

    let filePath = path.join(uploadDir, filename);

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    if (fs.existsSync(filePath)) {
      const random = Math.random().toString(36).substring(2);
      filename = `${filename.split(".")[0]}-${random}-${Date.now()}.${
        filename.split(".")[1]
      }`;
      filePath = path.join(uploadDir, filename);
    }

    fs.writeFileSync(filePath, imageBuffer);

    return path.join(destinationPath, filename);
  } catch (error) {
    throw new Error("failed upload image :" + error);
  }
}

export function deleteImage(imagePath: string) {
  const target = path.join(`public/${imagePath}`);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}
