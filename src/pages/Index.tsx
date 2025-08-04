import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showError, showSuccess } from "@/utils/toast";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Frown, Lightbulb, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FullPageLoader } from "@/components/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [recipeComplexity, setRecipeComplexity] = useState<string>('Normal');

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (images.length === 0) {
      setPreviews([]);
      return;
    }
    const newPreviews = images.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages(prev => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toBase64 = (file: File): Promise<{ mimeType: string, data: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const data = result.split(',')[1];
        resolve({ mimeType: file.type, data });
      };
      reader.onerror = error => reject(error);
    });

  const handleSubmit = async () => {
    if (images.length === 0) {
      showError("Please upload at least one image.");
      return;
    }

    setIsLoading(true);
    setRecipe(null);
    setApiError(null);

    try {
      const imagePayloads = await Promise.all(images.map(toBase64));

      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { images: imagePayloads, complexity: recipeComplexity },
      });

      if (error) throw error;

      if (data.error) {
        setApiError(data.error);
        showError("An error occurred. See details below.");
      } else if (data.recipe) {
        setRecipe(data.recipe);
        showSuccess("Your recipe is ready!");
      } else {
        throw new Error("Received an unexpected response format.");
      }

    } catch (error: any) {
      const errorMessage = error.message || "A critical error occurred.";
      setApiError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !session) {
    return <FullPageLoader />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="w-full max-w-2xl flex-grow">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Upload Your Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Photo Tips!</AlertTitle>
              <AlertDescription>
                For best results, fit more ingredients into one picture. Ensure photos clearly show the items.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-md" />
                  <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <Upload className="h-8 w-8 text-gray-500" />
                <span className="mt-2 text-sm text-center text-gray-600">Add Images</span>
                <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complexity-select">Recipe Style</Label>
              <Select value={recipeComplexity} onValueChange={setRecipeComplexity}>
                <SelectTrigger id="complexity-select" className="w-full">
                  <SelectValue placeholder="Select recipe style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simple">Simple (Basic pantry)</SelectItem>
                  <SelectItem value="Normal">Normal (Standard pantry)</SelectItem>
                  <SelectItem value="Expert">Expert (Well-stocked pantry)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || images.length === 0} className="w-full">
              {isLoading ? "Generating Recipe..." : "Generate Recipe"}
            </Button>

            {apiError && (
              <Alert variant="destructive">
                {apiError.includes("daily limit") ? <Frown className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                <AlertTitle>{apiError.includes("daily limit") ? "Limit Reached" : "API Error"}</AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs">{apiError}</pre>
                </AlertDescription>
              </Alert>
            )}

            {isLoading && !apiError && (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}

            {recipe && (
              <div className="prose prose-lg dark:prose-invert max-w-none border-t pt-6">
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