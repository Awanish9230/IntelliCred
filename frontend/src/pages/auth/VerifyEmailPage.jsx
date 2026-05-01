import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${apiUrl}/auth/verify/${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error occurred during verification.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader className="h-16 w-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verifying...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Verified!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            <div className="mt-6 w-full">
              <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Proceed to Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            <div className="mt-6 w-full">
              <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
