import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageLoader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

const Login = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/");
    }
  }, [session, loading, navigate]);

  const handleDevLogin = async () => {
    // NOTE: These credentials are for development convenience.
    // First, sign up in the app with this email and password.
    const devEmail = 'dev@example.com';
    const devPassword = 'password123';

    const { error } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    });

    if (error) {
      showError(`Dev login failed: ${error.message}`);
    } else {
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