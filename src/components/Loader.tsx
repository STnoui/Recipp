import { Loader2 } from 'lucide-react';

export const FullPageLoader = () => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};