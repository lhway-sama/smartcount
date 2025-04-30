import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGlobal } from '../../contexts/GlobalContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  BookOpen, 
  FileText, 
  PieChart,
  Receipt, 
  Settings, 
  Users, 
  Award,
  Calculator,
  Building,
  ChevronLeft
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useGlobal();
  const { currentUser } = useAuth();

  const menuItems = [
    { 
      name: 'Tableau de bord', 
      path: '/dashboard', 
      icon: <BarChart3 className="w-5 h-5" /> 
    },
    {
      name: 'Comptabilité',
      submenu: true,
      items: [
        { name: 'Écritures', path: '/comptabilite/ecritures', icon: <BookOpen className="w-5 h-5" /> },
        { name: 'Analytique', path: '/comptabilite/analytique', icon: <PieChart className="w-5 h-5" /> },
        { name: 'Rapprochement', path: '/comptabilite/rapprochement', icon: <FileText className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Facturation',
      submenu: true,
      items: [
        { name: 'Clients', path: '/facturation/clients', icon: <Receipt className="w-5 h-5" /> },
        { name: 'Fournisseurs', path: '/facturation/fournisseurs', icon: <Receipt className="w-5 h-5" /> },
      ]
    },
    { 
      name: 'Déclarations fiscales', 
      path: '/declarations-fiscales', 
      icon: <Calculator className="w-5 h-5" /> 
    },
    { 
      name: 'Budgets', 
      path: '/budgets', 
      icon: <BarChart3 className="w-5 h-5" /> 
    },
    { 
      name: 'Immobilisations', 
      path: '/immobilisations', 
      icon: <Building className="w-5 h-5" /> 
    },
    { 
      name: 'Rapports', 
      path: '/rapports', 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: 'Configuration', 
      path: '/configuration', 
      icon: <Settings className="w-5 h-5" /> 
    },
    { 
      name: 'Utilisateurs et rôles', 
      path: '/utilisateurs-et-roles', 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      name: 'Gamification', 
      path: '/gamification', 
      icon: <Award className="w-5 h-5" /> 
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-black/50" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full bg-white shadow-xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} lg:relative`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200
            ${!sidebarOpen && 'lg:justify-center'}`}>
            <div className="flex items-center">
              <div className="bg-indigo-900 text-white p-2 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              {sidebarOpen && (
                <span className="ml-2 text-lg font-semibold text-gray-800">SmartCount</span>
              )}
            </div>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item, index) => (
                item.submenu ? (
                  <li key={index} className="mb-2">
                    {sidebarOpen && (
                      <p className="px-3 mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {item.name}
                      </p>
                    )}
                    <ul className="space-y-1">
                      {item.items.map((subItem, subIndex) => (
                        <li key={`${index}-${subIndex}`}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) => `
                              flex items-center px-3 py-2 text-sm rounded-lg
                              ${sidebarOpen ? 'justify-start' : 'lg:justify-center'}
                              ${isActive 
                                ? 'bg-indigo-50 text-indigo-800' 
                                : 'text-gray-700 hover:bg-gray-100'}
                            `}
                          >
                            {subItem.icon}
                            {sidebarOpen && <span className="ml-3">{subItem.name}</span>}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={index}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center px-3 py-2 text-sm rounded-lg
                        ${sidebarOpen ? 'justify-start' : 'lg:justify-center'}
                        ${isActive 
                          ? 'bg-indigo-50 text-indigo-800' 
                          : 'text-gray-700 hover:bg-gray-100'}
                      `}
                    >
                      {item.icon}
                      {sidebarOpen && <span className="ml-3">{item.name}</span>}
                    </NavLink>
                  </li>
                )
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          {currentUser && sidebarOpen && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-semibold">
                  {currentUser.prenom?.[0]}{currentUser.nom?.[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser.prenom} {currentUser.nom}
                  </p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar