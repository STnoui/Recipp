import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="w-full max-w-2xl flex justify-between items-center py-4 mb-4">
      <h1 className="text-xl font-semibold">Recipe Generator</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
          {user?.email}
        </span>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};