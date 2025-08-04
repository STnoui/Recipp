import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const { session, signInAsDeveloper } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                    Login to Recipe AI
                </h2>
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google']}
                    onlyThirdPartyProviders={true}
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                />
                {import.meta.env.DEV && (
                    <div className="mt-6 text-center">
                        <Button
                            className="w-full"
                            onClick={signInAsDeveloper}
                        >
                            Bypass Login (For Dev)
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                            This will create a temporary account for development.
                        </p>
                    </div>
                )}
            </div>
        </div>
        <MadeWithDyad />
    </div>
  );
};

export default Login;