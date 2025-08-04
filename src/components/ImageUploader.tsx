import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, FileImage, Lightbulb, X } from "lucide-react";

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  disabled?: boolean;
}

export const ImageUploader = ({ onImagesChange, disabled = false }: ImageUploaderProps) => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages.map(img => img.file));
    }
    event.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    URL.revokeObjectURL(imageToRemove.preview);

    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  };

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  return (
    <div className="space-y-4">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Tips for great results!</AlertTitle>
        <AlertDescription>
          For the best recipe, use clear photos of your ingredients. Try to fit multiple items in one picture!
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => cameraInputRef.current?.click()} disabled={disabled}>
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          <FileImage className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFiles}
          disabled={disabled}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={disabled}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={image.preview} alt={`Ingredient ${index + 1}`} className="rounded-md object-cover w-full h-full" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};