import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 text-center">
      <h1 className="text-9xl font-black text-primary-500/20 dark:text-primary-500/10">404</h1>
      <h2 className="text-3xl font-bold text-surface-900 dark:text-white mt-4">Page Not Found</h2>
      <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-8 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
