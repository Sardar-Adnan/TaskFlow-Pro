import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
