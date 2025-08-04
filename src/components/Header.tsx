import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, BookHeart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <header className="w-full max-w-2xl flex justify-between items-center py-4 mb-4">
      <h1 className="text-xl font-semibold">
        <Link to="/" className="hover:underline">Recipe Generator</Link>
      </h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
          {user?.email}
        </span>
        {location.pathname !== '/my-recipes' && (
          <Button asChild variant="outline" size="sm">
            <Link to="/my-recipes">
              <BookHeart className="h-4 w-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">My Recipes</span>
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};