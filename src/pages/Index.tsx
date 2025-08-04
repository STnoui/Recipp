import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showError, showSuccess } from "@/utils/toast";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Frown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FullPageLoader } from "@/components/Loader";

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState<string>("");
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  const handleSubmit = async () => {
    if (!ingredients.trim()) {
      showError("Please enter some ingredients.");
      return;
    }

    setIsLoading(true);
    setRecipe(null);
    setApiError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { prompt: ingredients },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Handle specific "limit reached" error from the function
        if (data.error.includes("daily limit")) {
            setApiError(data.error);
        } else {
            const fullError = typeof data.error === 'object' ? JSON.stringify(data.error, null, 2) : data.error;
            setApiError(fullError);
        }
        showError("An error occurred. See details below.");
      } else if (data.recipe) {
        setRecipe(data.recipe);
        showSuccess("Your recipe is ready!");
      } else {
        throw new Error("Received an unexpected response format from the server.");
      }

    } catch (error: any) {
      console.error("Full error object from Supabase:", error);
      const fullError = JSON.stringify(error, null, 2);
      setApiError(fullError);
      showError("A critical error occurred while communicating with the server.");
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
              Recipe Generator AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Enter your ingredients (e.g., "chicken breast, rice, broccoli")</Label>
              <Textarea
                id="ingredients"
                placeholder="What do you have in your kitchen?"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || !ingredients.trim()} className="w-full">
              {isLoading ? "Generating Recipe..." : "Generate Recipe"}
            </Button>

            {apiError && (
              <Alert variant="destructive">
                {apiError.includes("daily limit") ? <Frown className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                <AlertTitle>{apiError.includes("daily limit") ? "Limit Reached" : "API Error"}</AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                    {apiError}
                  </pre>
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