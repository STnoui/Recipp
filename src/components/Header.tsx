import { Button } from '@/components/ui/button';
import { BookHeart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AccountMenu } from './AccountMenu';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="w-full max-w-2xl flex justify-between items-center py-4 mb-4">
      <h1 className="text-xl font-semibold">
        <Link to="/" className="hover:underline">Recipe AI</Link>
      </h1>
      <div className="flex items-center gap-2 sm:gap-4">
        {location.pathname !== '/my-recipes' && (
          <Button asChild variant="outline" size="sm">
            <Link to="/my-recipes">
              <BookHeart className="h-4 w-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">My Recipes</span>
            </Link>
          </Button>
        )}
        <AccountMenu />
      </div>
    </header>
  );
};