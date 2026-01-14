import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowLeft } from 'lucide-react';
import { login, register } from '../api/api';
import { useAuth } from '../context/AuthContext';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the redirect path from location state, default to /order
  const from = location.state?.from?.pathname || '/order';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // Login
        response = await login({
          email: formData.email,
          password: formData.password
        });

        // Check if admin is trying to login here, redirect them
        if (response.data.user.role === 'admin') {
          setError('Admin users should login at Admin Login page.');
          setLoading(false);
          setTimeout(() => {
            navigate('/admin/login');
          }, 2000);
          return;
        }
      } else {
        // Register
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        response = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
      }

      // Save token and user data
      loginUser(response.data.token, response.data.user);
      
      // Redirect to the page they were trying to access
      navigate(from, { replace: true });
      
    } catch (err) {
      console.error('Auth error:', err);
      // Better error messages
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input. Please check your information.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="bg-primary rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-dark">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Login to place your catering order' : 'Sign up to start ordering'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="label">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
                required
                minLength={isLogin ? undefined : 6}
              />
            </div>
            {!isLogin && (
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="label">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '', phone: '' });
            }}
            className="text-primary hover:text-orange-600 font-semibold"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Need admin access? 
              <button
                onClick={() => navigate('/admin/login')}
                className="text-primary hover:text-orange-600 font-semibold ml-1"
              >
                Admin Login
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerAuth;
