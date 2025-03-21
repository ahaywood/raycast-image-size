import { ActionPanel, Action, Form, showToast, Toast, Clipboard } from "@raycast/api";
import { useState, useEffect } from "react";
import { getImageDimensions } from "./utils/image";
import { getSelectedFinderItems } from "@raycast/api";

interface FormValues {
  newWidth?: string;
  newHeight?: string;
}

export default function Command() {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadImageDimensions() {
      try {
        const items = await getSelectedFinderItems();

        if (items.length === 0) {
          setError("Please select an image file in Finder first");
          setIsLoading(false);
          return;
        }

        const path = items[0].path;
        const name = path.split("/").pop() || "Image";
        setFileName(name);
        setImagePath(path);

        const dims = await getImageDimensions(path);
        setDimensions(dims);
        setIsLoading(false);
      } catch (error) {
        setError("Error: Not a valid image file");
        setIsLoading(false);
      }
    }

    loadImageDimensions();
  }, []);

  const calculateNewDimensions = (values: FormValues) => {
    if (!dimensions) return;

    const aspectRatio = dimensions.width / dimensions.height;
    let calculatedWidth: number | undefined;
    let calculatedHeight: number | undefined;

    if (values.newWidth && values.newWidth.trim() !== "") {
      const width = parseFloat(values.newWidth);
      if (!isNaN(width) && width > 0) {
        calculatedHeight = Math.round(width / aspectRatio);
        // Copy calculated height to clipboard
        Clipboard.copy(calculatedHeight.toString());
        showToast({
          style: Toast.Style.Success,
          title: "Calculated Height",
          message: `${calculatedHeight}px (copied to clipboard)`,
        });
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "Invalid Width",
          message: "Please enter a valid positive number",
        });
      }
    } else if (values.newHeight && values.newHeight.trim() !== "") {
      const height = parseFloat(values.newHeight);
      if (!isNaN(height) && height > 0) {
        calculatedWidth = Math.round(height * aspectRatio);
        // Copy calculated width to clipboard
        Clipboard.copy(calculatedWidth.toString());
        showToast({
          style: Toast.Style.Success,
          title: "Calculated Width",
          message: `${calculatedWidth}px (copied to clipboard)`,
        });
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "Invalid Height",
          message: "Please enter a valid positive number",
        });
      }
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "Input Required",
        message: "Please enter either a new width or height",
      });
    }
  };

  if (error) {
    return (
      <Form
        isLoading={isLoading}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="Select an Image in Finder"
              url="file:///System/Library/CoreServices/Finder.app"
            />
          </ActionPanel>
        }
      >
        <Form.Description text={error} />
      </Form>
    );
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={calculateNewDimensions} title="Calculate" />
          {imagePath && (
            <Action.OpenWith
              title="Open Image"
              path={imagePath}
            />
          )}
        </ActionPanel>
      }
    >
      {dimensions && fileName && (
        <>
          <Form.Description
            text={`Image: ${fileName}\nOriginal dimensions: ${dimensions.width}×${dimensions.height}px\nAspect ratio: ${(dimensions.width / dimensions.height).toFixed(3)}`}
          />
          <Form.Separator />
          <Form.TextField
            id="newWidth"
            title="New Width (px)"
            placeholder="Enter new width..."
          />
          <Form.TextField
            id="newHeight"
            title="New Height (px)"
            placeholder="Enter new height..."
          />
          <Form.Description
            text="Enter either width or height. The other dimension will be calculated automatically to maintain the aspect ratio."
          />
        </>
      )}
    </Form>
  );
}
