import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobal } from '../../contexts/GlobalContext';
import { Bell, Menu, User, LogOut, Search } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { toggleSidebar } = useGlobal();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm h-16 flex items-center px-4">
      <button 
        onClick={toggleSidebar}
        className="mr-4 p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Right side icons */}
      <div className="flex items-center space-x-4 ml-auto">
        <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
              {currentUser?.prenom?.[0] || 'U'}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{currentUser?.prenom} {currentUser?.nom}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <a 
                href="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="w-4 h-4 mr-2" />
                Mon profil
              </a>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header