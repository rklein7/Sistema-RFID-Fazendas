import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { removeToken, getUser } from '../utils/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Menu className="text-gray-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-800">
                🐄 Sistema RFID Fazenda
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.nome_completo || user?.username}
                </p>
                <p className="text-xs text-gray-500">@{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Sistema RFID Fazenda - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;