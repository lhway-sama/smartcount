import React, { useState, useEffect } from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import { BarChart3, Briefcase, CreditCard, TrendingUp, Filter, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import apiClient from '../services/apiClient';

interface DashboardData {
  chiffre_affaires: number;
  tresorerie: number;
  creances: number;
  resultat: number;
  evolution_ca: {
    labels: string[];
    values: number[];
  };
  repartition_charges: {
    labels: string[];
    values: number[];
  };
}

const Dashboard: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [periode, setPeriode] = useState('mois');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<DashboardData>(`/api/tableau-de-bord/?periode=${periode}`);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addNotification({
          type: 'error',
          message: 'Impossible de charger les données du tableau de bord.',
        });
        
        // Set mock data for demo purposes
        setDashboardData({
          chiffre_affaires: 156750,
          tresorerie: 42680,
          creances: 23450,
          resultat: 35240,
          evolution_ca: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            values: [12000, 15000, 18000, 16000, 21000, 24000],
          },
          repartition_charges: {
            labels: ['Personnel', 'Loyer', 'Marketing', 'Fournitures', 'Services'],
            values: [45, 20, 15, 10, 10],
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [periode, addNotification]);

  const handlePeriodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriode(e.target.value);
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(montant);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <Select
              id="periode"
              options={[
                { value: 'mois', label: 'Ce mois' },
                { value: 'trimestre', label: 'Ce trimestre' },
                { value: 'annee', label: 'Cette année' },
              ]}
              value={periode}
              onChange={handlePeriodeChange}
              className="w-40"
            />
          </div>
          
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
            Filtres
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatMontant(dashboardData.chiffre_affaires) : '—'}
              </p>
              <p className="text-sm text-green-600 mt-1">+12.5% vs période préc.</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trésorerie</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatMontant(dashboardData.tresorerie) : '—'}
              </p>
              <p className="text-sm text-green-600 mt-1">+5.3% vs période préc.</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Créances clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatMontant(dashboardData.creances) : '—'}
              </p>
              <p className="text-sm text-red-600 mt-1">-2.1% vs période préc.</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Résultat net</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatMontant(dashboardData.resultat) : '—'}
              </p>
              <p className="text-sm text-green-600 mt-1">+8.7% vs période préc.</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Évolution du chiffre d'affaires" className="col-span-1">
          <div className="h-80 flex items-center justify-center">
            {dashboardData && (
              <div className="w-full h-full flex items-end justify-between pt-6">
                {dashboardData.evolution_ca.values.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-indigo-600 rounded-t-lg hover:bg-indigo-700 transition-all duration-300"
                      style={{ 
                        height: `${(value / Math.max(...dashboardData.evolution_ca.values)) * 100}%`,
                        minHeight: '20px'
                      }}
                    ></div>
                    <span className="text-xs font-medium text-gray-500 mt-2">
                      {dashboardData.evolution_ca.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Répartition des charges" className="col-span-1">
          <div className="h-80 flex items-center justify-center">
            {dashboardData && (
              <div className="w-full max-w-md">
                {dashboardData.repartition_charges.labels.map((label, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {dashboardData.repartition_charges.values[index]}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${dashboardData.repartition_charges.values[index]}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;