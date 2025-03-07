import { ActionPanel, Action, Detail } from "@raycast/api";
import { useState, useEffect } from "react";
import { getImageDimensions } from "./utils/image";
import { getSelectedFinderItems } from "@raycast/api";

export default function Command() {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    async function loadImageDimensions() {
      try {
        const items = await getSelectedFinderItems();
        
        if (items.length === 0) {
          setError("Please select an image file in Finder first");
          return;
        }

        const imagePath = items[0].path;
        const name = imagePath.split("/").pop() || "Image";
        setFileName(name);

        const dims = await getImageDimensions(imagePath);
        setDimensions(dims);
      } catch (error) {
        setError("Error: Not a valid image file");
      }
    }

    loadImageDimensions();
  }, []);

  if (error) {
    return <Detail markdown={error} />;
  }

  if (!dimensions || !fileName) {
    return <Detail markdown="Loading..." />;
  }

  return (
    <Detail
      markdown={`# ${fileName}\n\n**Dimensions:** ${dimensions.width}×${dimensions.height}`}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Width"
            content={String(dimensions.width)}
          />
          <Action.CopyToClipboard
            title="Copy Height"
            content={String(dimensions.height)}
          />
        </ActionPanel>
      }
    />
  );
}