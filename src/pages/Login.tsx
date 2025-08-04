import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageLoader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";

const Login = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/");
    }
  }, [session, loading, navigate]);

  const handleDevLogin = async () => {
    const toastId = showLoading("Attempting developer login...");
    const devEmail = 'dev@example.com';
    const devPassword = 'password123';

    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    });

    if (signInError) {
      // If sign-in fails because the user doesn't exist, try to sign them up
      if (signInError.message === 'Invalid login credentials') {
        dismissToast(toastId);
        const signUpToastId = showLoading("Dev user not found. Creating account...");
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: devEmail,
          password: devPassword,
        });

        dismissToast(signUpToastId);
        if (signUpError) {
          showError(`Failed to create dev user: ${signUpError.message}`);
        } else {
          showSuccess('Dev user created and logged in!');
          navigate('/');
        }
      } else {
        dismissToast(toastId);
        showError(`Dev login failed: ${signInError.message}`);
      }
    } else {
      dismissToast(toastId);
      showSuccess('Logged in as Developer');
      navigate('/');
    }
  };

  if (loading) {
    return <FullPageLoader />;
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Recipe AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={["google"]}
              theme="light"
              onlyThirdPartyProviders
            />
            
            {/* --- DEV ONLY BUTTON --- */}
            {import.meta.env.DEV && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-center text-sm text-muted-foreground mb-2">For development use only</p>
                <Button variant="secondary" className="w-full" onClick={handleDevLogin}>
                  Login as Dev
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;