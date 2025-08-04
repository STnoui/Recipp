import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageLoader } from "@/components/Loader";

const Login = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/");
    }
  }, [session, loading, navigate]);

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
              socialLayout="horizontal"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;