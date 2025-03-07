import { List, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import fs from "fs";
import path from "path";
import { getImageDimensions } from "./utils/image";

interface ImageFile {
  name: string;
  path: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export default function Command() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const desktopPath = path.join(process.env.HOME || "", "Desktop");
      const files = fs.readdirSync(desktopPath);
      const imageFiles = files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => ({
          name: file,
          path: path.join(desktopPath, file),
        }));

      const imagesWithDimensions = await Promise.all(
        imageFiles.map(async (image) => {
          try {
            const dimensions = await getImageDimensions(image.path);
            return { ...image, dimensions };
          } catch {
            return image;
          }
        })
      );

      setImages(imagesWithDimensions);
    } catch (error) {
      console.error("Failed to load images:", error);
    }
    setIsLoading(false);
  }

  return (
    <List isLoading={isLoading}>
      {images.map((image) => (
        <List.Item
          key={image.path}
          title={image.name}
          subtitle={image.dimensions ? `${image.dimensions.width}×${image.dimensions.height}` : "Loading..."}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Width" content={String(image.dimensions?.width || "")} />
              <Action.CopyToClipboard title="Copy Height" content={String(image.dimensions?.height || "")} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}