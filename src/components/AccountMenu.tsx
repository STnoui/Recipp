import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Settings, Info, Trash2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
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
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

export const AccountMenu = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-user');
    if (error) {
      showError(`Failed to delete account: ${error.message}`);
    } else {
      showSuccess("Your account has been deleted.");
      await signOut();
      navigate('/login');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.full_name ?? 'User'} />
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="text-left">
          <SheetTitle>My Account</SheetTitle>
          <SheetDescription>
            Manage your account settings and preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.full_name ?? 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-semibold truncate">{profile?.full_name ?? 'Welcome!'}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Settings className="h-5 w-5" /> Preferences</h3>
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <p>Theme</p>
              <ThemeToggle />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Info className="h-5 w-5" /> About</h3>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Recipe AI helps you discover amazing recipes from the ingredients you have on hand.</p>
            </div>
          </div>

          <div className="space-y-2">
             <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive"><User className="h-5 w-5" /> Account Actions</h3>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};