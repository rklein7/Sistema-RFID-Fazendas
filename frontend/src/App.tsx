import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { isAuthenticated } from './utils/auth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />
          } 
        />

        {/* Rota do Dashboard (Protegida) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Rota Raiz - Redireciona baseado na autenticação */}
        <Route
          path="/"
          element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* Rota 404 - Página não encontrada */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                <a
                  href="/"
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Voltar ao Início
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;