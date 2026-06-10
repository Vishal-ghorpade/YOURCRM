import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-primary px-4">
      <div className="w-full max-w-[400px] crm-card relative">
        {/* Brand/Logo Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent text-accentFg flex items-center justify-center font-bold text-xl">
            Y
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary">YOURCRM</h2>
          <p className="text-[12px] text-secondary text-center uppercase tracking-wider font-semibold">
            Sign in to your account
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-md text-[13px] font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="crm-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="crm-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="crm-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>

        {/* Register Switcher */}
        <div className="mt-6 text-center">
          <span className="text-[13px] text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-blueTheme font-medium hover:underline">
              Register
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
