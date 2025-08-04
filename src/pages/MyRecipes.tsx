import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FullPageLoader } from '@/components/Loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, BookOpen } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ReactMarkdown from 'react-markdown';
import { MadeWithDyad } from '@/components/made-with-dyad';

interface Recipe {
  id: string;
  created_at: string;
  content: string;
  is_favorite: boolean;
}

const MyRecipes = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/login', { replace: true });
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      fetchRecipes();
    }
  }, [session]);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Failed to fetch recipes.');
      console.error(error);
    } else {
      setRecipes(data || []);
    }
    setLoading(false);
  };

  const toggleFavorite = async (recipe: Recipe) => {
    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite: !recipe.is_favorite })
      .eq('id', recipe.id);

    if (error) {
      showError('Failed to update favorite status.');
    } else {
      showSuccess(recipe.is_favorite ? 'Recipe un-favorited.' : 'Recipe favorited!');
      fetchRecipes();
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (error) {
      showError('Failed to delete recipe.');
    } else {
      showSuccess('Recipe deleted.');
      fetchRecipes();
    }
  };
  
  const getRecipeTitle = (content: string) => {
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.startsWith('# '));
    return titleLine ? titleLine.substring(2).trim() : 'Untitled Recipe';
  };

  if (authLoading || !session) {
    return <FullPageLoader />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="w-full max-w-2xl flex-grow">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">My Saved Recipes</CardTitle>
            <CardDescription>Here are all the recipes you've generated.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading recipes...</div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">You haven't generated any recipes yet.</p>
                <Button onClick={() => navigate('/')} className="mt-4">Generate Your First Recipe</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map(recipe => (
                  <Card key={recipe.id} className="flex items-center justify-between p-4">
                    <div className="flex-grow overflow-hidden mr-4">
                      <h3 className="font-semibold truncate">{getRecipeTitle(recipe.content)}</h3>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(recipe.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedRecipe(recipe)}>
                        <BookOpen className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleFavorite(recipe)}>
                        <Heart className={`h-5 w-5 transition-colors ${recipe.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this recipe.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRecipe(recipe.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
      {selectedRecipe && (
        <AlertDialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{getRecipeTitle(selectedRecipe.content)}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="prose prose-lg dark:prose-invert max-h-[60vh] overflow-y-auto p-1">
              <ReactMarkdown>{selectedRecipe.content}</ReactMarkdown>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MyRecipes;