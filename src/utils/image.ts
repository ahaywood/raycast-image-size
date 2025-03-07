import { promisify } from "util";
import sizeOf from "image-size";

const sizeOfAsync = promisify(sizeOf);

export async function getImageDimensions(imagePath: string) {
  const dimensions = await sizeOfAsync(imagePath);

  if (!dimensions || !dimensions.width || !dimensions.height) {
    throw new Error("Could not determine image dimensions");
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
  };
}
