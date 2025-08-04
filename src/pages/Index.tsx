import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showError, showSuccess } from "@/utils/toast";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setRecipe(null); // Clear previous recipe
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setRecipe(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setRecipe(data.recipe);
      showSuccess("Your recipe is ready!");

    } catch (error: any) {
      console.error("Full error object from Supabase:", error); // Enhanced logging
      const errorMessage = error.context?.error || error.message || "An unexpected error occurred.";
      const errorDetails = error.context?.details ? `Details: ${JSON.stringify(error.context.details)}` : '';
      showError(`${errorMessage} ${errorDetails}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900">
      <main className="w-full max-w-2xl flex-grow">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Recipe Generator AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="picture">Upload Ingredients Image</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary"/>
            </div>

            {preview && (
              <div className="flex justify-center border rounded-lg overflow-hidden">
                <img src={preview} alt="Ingredients preview" className="max-h-64 object-contain" />
              </div>
            )}

            <Button onClick={handleSubmit} disabled={isLoading || !file} className="w-full">
              {isLoading ? "Generating Recipe..." : "Generate Recipe"}
            </Button>

            {isLoading && (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}

            {recipe && (
              <div className="prose dark:prose-invert max-w-none border-t pt-6">
                <ReactMarkdown>{recipe}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;