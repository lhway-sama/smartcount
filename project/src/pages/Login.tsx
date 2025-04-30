import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobal } from '../contexts/GlobalContext';
import { BarChart3, Lock, User } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useGlobal();
  const [credentials, setCredentials] = useState({
    login: '',
    mot_de_passe: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!credentials.login.trim()) {
      newErrors.login = 'L\'identifiant est requis';
    }
    
    if (!credentials.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await login(credentials);
      navigate('/dashboard');
      addNotification({
        type: 'success',
        message: 'Connexion réussie !',
      });
    } catch (error) {
      console.error('Login error:', error);
      addNotification({
        type: 'error',
        message: 'Identifiant ou mot de passe incorrect.',
      });
      setCredentials((prev) => ({
        ...prev,
        mot_de_passe: '',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-indigo-900 text-white p-4 rounded-xl">
              <BarChart3 className="w-10 h-10" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">SmartCount</h2>
          <p className="mt-2 text-sm text-gray-600">
            Votre solution de comptabilité intelligente
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="login"
              name="login"
              type="text"
              label="Identifiant"
              icon={<User className="h-5 w-5" />}
              autoComplete="username"
              value={credentials.login}
              onChange={handleChange}
              error={errors.login}
              required
            />
            
            <Input
              id="mot_de_passe"
              name="mot_de_passe"
              type="password"
              label="Mot de passe"
              icon={<Lock className="h-5 w-5" />}
              autoComplete="current-password"
              value={credentials.mot_de_passe}
              onChange={handleChange}
              error={errors.mot_de_passe}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;