import React, { useEffect, useState } from 'react';
import { BarChart3, Activity, MapPin, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardService } from '../services/api';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
    
    const interval = setInterval(loadDashboard, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="text-center text-gray-500">Nenhum dado disponível</div>
      </Layout>
    );
  }

  const zonaData = Object.entries(stats.por_zona).map(([zona, count]) => ({
    name: zona.replace('zona_', 'Zona '),
    leituras: count,
  }));

  const tipoData = Object.entries(stats.por_tipo).map(([tipo, count]) => ({
    name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    value: count,
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500 mt-1">Visão geral do sistema de monitoramento</p>
          </div>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Leituras"
            value={stats.total_leituras}
            icon={BarChart3}
            color="green"
          />
          <StatCard
            title="Leituras Hoje"
            value={stats.leituras_hoje}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Vacas"
            value={stats.por_tipo.vaquinha || 0}
            icon={Activity}
            color="purple"
            subtitle="Total detectado"
          />
          <StatCard
            title="Ovelhas"
            value={stats.por_tipo.ovelinha || 0}
            icon={MapPin}
            color="orange"
            subtitle="Total detectado"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Leituras por Zona
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zonaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leituras" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Distribuição por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tipoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">
              Últimas Leituras
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.ultimas_leituras.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma leitura registrada ainda
                    </td>
                  </tr>
                ) : (
                  stats.ultimas_leituras.map((leitura) => (
                    <tr key={leitura.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Zona {leitura.zona}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leitura.tipo_animal === 'VAQUINHA' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {leitura.tipo_animal === 'VAQUINHA' ? '🐄' : '🐑'} {leitura.tipo_animal}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {leitura.uid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leitura.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leitura.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;