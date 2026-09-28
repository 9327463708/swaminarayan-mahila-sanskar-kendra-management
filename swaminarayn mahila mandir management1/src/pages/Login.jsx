import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    const hashString = async (str) => {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    try {
      const hashedUser = await hashString(username);
      const hashedPass = await hashString(password);

      if (hashedUser === '28043b65b3845c640a0da6fb0b6256bdd937cc4c5fbea1e3df6f1bdb28946141' && 
          hashedPass === '4ff54804bbf1a8a9eeba15f6b369bf24c52d98901e9d48c7e9ed7c280859fd35') {
        onLogin(true);
        navigate('/');
      } else {
        setError('ખોટો ઈમેલ અથવા પાસવર્ડ (Invalid Email or Password)');
      }
    } catch (err) {
      setError('Login error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img 
          src="/logo.jpg" 
          alt="Logo" 
          className="mx-auto h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover" 
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-orange-900 drop-shadow-sm">
          Shree Swaminarayan Mahila Sanskar Kendra
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Admin Secure Login
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-orange-100">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Secure Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;