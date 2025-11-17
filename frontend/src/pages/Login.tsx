import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Mail, UserPlus, BarChart3, Radio, Layers, Shield, Zap, Clock } from 'lucide-react';
import { authService } from '../services/api';
import { setToken, setUser } from '../utils/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Estados do Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados do Cadastro
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerNomeCompleto, setRegisterNomeCompleto] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Features do sistema
  const features = [
    {
      icon: Radio,
      title: "Monitoramento em Tempo Real",
      description: "Acompanhe a movimentação dos animais instantaneamente através de leitores RFID distribuídos pela fazenda.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Dashboard Interativo",
      description: "Visualize estatísticas detalhadas, gráficos e relatórios sobre seus rebanhos em uma interface intuitiva.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Layers,
      title: "Múltiplas Zonas",
      description: "Gerencie diferentes áreas da fazenda simultaneamente, identificando onde cada animal está localizado.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Clock,
      title: "Histórico Completo",
      description: "Acesse o histórico de todas as leituras e movimentações para análises e tomadas de decisão.",
      color: "from-orange-400 to-red-500"
    },
    {
      icon: Shield,
      title: "Sistema Seguro",
      description: "Proteção de dados com autenticação JWT e criptografia de ponta a ponta para suas informações.",
      color: "from-indigo-400 to-purple-500"
    },
    {
      icon: Zap,
      title: "Processamento Rápido",
      description: "Identificação instantânea de animais com resposta em milissegundos e sincronização automática.",
      color: "from-yellow-400 to-orange-500"
    }
  ];

  // Rotação automática de features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      
      setToken(response.access_token);
      setUser({
        username: response.username,
        nome_completo: response.nome_completo,
      });

      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Usuário ou senha incorretos');
      } else {
        setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (registerPassword !== registerConfirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        username: registerUsername,
        password: registerPassword,
        nome_completo: registerNomeCompleto,
        email: registerEmail,
      });

      setSuccess('Cadastro realizado com sucesso! Faça login para continuar.');
      
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterNomeCompleto('');
      setRegisterEmail('');
      
      setTimeout(() => {
        setIsRegisterMode(false);
        setSuccess('');
      }, 2000);
      
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Usuário já existe');
      } else {
        setError('Erro ao criar usuário. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setRegisterUsername('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterNomeCompleto('');
    setRegisterEmail('');
  };

  const currentFeature = features[activeFeature];
  const FeatureIcon = currentFeature.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* LADO ESQUERDO - Features e Animações */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animação de fundo - Ondas sutis */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10">
          {/* Logo e Título */}
          <div className="mb-16">
            <div className="flex items-center space-x-4 mb-8">
              <div className="text-7xl animate-bounce" style={{ animationDuration: '3s' }}>🐄</div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Sistema RFID de Monitoramento</h1>
                <p className="text-green-200 text-xl">Gerenciamento Inteligente de Monitoramento de Fazendas</p>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-white to-transparent rounded-full"></div>
          </div>

          {/* Feature Card Animado */}
          <div className="relative min-h-[400px]">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeFeature;
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ${
                    isActive 
                      ? 'opacity-100 translate-x-0' 
                      : index < activeFeature 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                    {/* Ícone com gradiente */}
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                      <Icon className="text-white" size={40} />
                    </div>
                    
                    {/* Título */}
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    {/* Descrição */}
                    <p className="text-green-100 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicadores de Features */}
          <div className="flex justify-center space-x-3 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeFeature 
                    ? 'w-12 h-3 bg-white' 
                    : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-green-200 text-sm">Monitoramento</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-green-200 text-sm">Seguro</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">∞</div>
                <div className="text-green-200 text-sm">Zonas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO - Formulários de Login/Cadastro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Card de Login/Cadastro */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Mobile */}
            <div className="lg:hidden bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
              <div className="text-6xl mb-4">🐄</div>
              <h1 className="text-3xl font-bold mb-2">Sistema RFID</h1>
              <p className="text-green-100">Gerenciamento de Fazenda</p>
            </div>

            {/* Header Desktop */}
            <div className="hidden lg:block p-8 pb-4">
              <h2 className="text-3xl font-bold text-gray-800">
                {isRegisterMode ? 'Criar Conta' : 'Bem-vindo de volta'}
              </h2>
              <p className="text-gray-500 mt-2">
                {isRegisterMode 
                  ? 'Preencha os dados para criar sua conta' 
                  : 'Entre com suas credenciais para continuar'}
              </p>
            </div>

            {/* Form */}
            <div className="p-8 pt-4">
              {/* Toggle entre Login e Cadastro */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => !isRegisterMode && setError('')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    !isRegisterMode
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  disabled={!isRegisterMode}
                >
                  Login
                </button>
                <button
                  onClick={toggleMode}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    isRegisterMode
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              {/* Mensagens */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-6 animate-shake">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-800 font-medium text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 mb-6 animate-fade-in">
                  <AlertCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-800 font-medium text-sm">{success}</p>
                </div>
              )}

              {/* FORMULÁRIO DE LOGIN */}
              {!isRegisterMode ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Digite seu usuário"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Digite sua senha"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Entrando...
                      </span>
                    ) : (
                      'Entrar'
                    )}
                  </button>

                </form>
              ) : (
                /* FORMULÁRIO DE CADASTRO */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="register-username"
                        type="text"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Escolha um usuário"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-nome" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserPlus className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="register-nome"
                        type="text"
                        value={registerNomeCompleto}
                        onChange={(e) => setRegisterNomeCompleto(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Senha *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={20} />
                      </div>
                      <input
                        id="register-confirm-password"
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Digite a senha novamente"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 mt-6"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cadastrando...
                      </span>
                    ) : (
                      'Criar Conta'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    * Campos obrigatórios
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Sistema de Monitoramento ATITUS - HARDWARE © 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;