import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus, BarChart3, LineChart } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface AxeAnalytique {
  id: number;
  nom: string;
  description: string;
}

interface Ecriture {
  id: number;
  date: string;
  description: string;
  montant: number;
}

interface AffectationAnalytique {
  ecriture_id: number;
  axe_id: number;
  valeur: number;
}

interface Stats {
  performance: {
    labels: string[];
    values: number[];
  };
  marge: {
    labels: string[];
    values: number[];
  };
}

const Analytique: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [axes, setAxes] = useState<AxeAnalytique[]>([]);
  const [ecritures, setEcritures] = useState<Ecriture[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedAxe, setSelectedAxe] = useState<number | null>(null);
  
  const [showAxeForm, setShowAxeForm] = useState(false);
  const [axeFormData, setAxeFormData] = useState<Partial<AxeAnalytique>>({
    nom: '',
    description: '',
  });
  
  const [affectationData, setAffectationData] = useState<Partial<AffectationAnalytique>>({
    ecriture_id: undefined,
    axe_id: undefined,
    valeur: 0,
  });

  useEffect(() => {
    fetchAxes();
    fetchEcritures();
  }, []);

  useEffect(() => {
    if (selectedAxe) {
      fetchStats(selectedAxe);
    }
  }, [selectedAxe]);

  const fetchAxes = async () => {
    try {
      const response = await apiClient.get('/api/axes-analytique/');
      setAxes(response.data);
    } catch (error) {
      console.error('Error fetching axes:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les axes analytiques.',
      });
    }
  };

  const fetchEcritures = async () => {
    try {
      const response = await apiClient.get('/api/ecritures/');
      setEcritures(response.data);
    } catch (error) {
      console.error('Error fetching ecritures:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les écritures.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (axeId: number) => {
    try {
      const response = await apiClient.get(`/api/analytique/stats/?axe_id=${axeId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les statistiques.',
      });
    }
  };

  const handleAxeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (axeFormData.id) {
        await apiClient.put(`/api/axes-analytique/${axeFormData.id}/`, axeFormData);
        addNotification({
          type: 'success',
          message: 'Axe analytique mis à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/axes-analytique/', axeFormData);
        addNotification({
          type: 'success',
          message: 'Axe analytique créé avec succès.',
        });
      }
      
      setShowAxeForm(false);
      setAxeFormData({ nom: '', description: '' });
      fetchAxes();
    } catch (error) {
      console.error('Error saving axe:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer l\'axe analytique.',
      });
    }
  };

  const handleAxeDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet axe ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/axes-analytique/${id}/`);
      addNotification({
        type: 'success',
        message: 'Axe analytique supprimé avec succès.',
      });
      fetchAxes();
    } catch (error) {
      console.error('Error deleting axe:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer l\'axe analytique.',
      });
    }
  };

  const handleAffectation = async (ecritureId: number) => {
    try {
      await apiClient.post('/api/ecritures-analytique/', {
        ecriture_id: ecritureId,
        axe_id: affectationData.axe_id,
        valeur: affectationData.valeur,
      });
      
      addNotification({
        type: 'success',
        message: 'Affectation analytique créée avec succès.',
      });
      
      // Reset form and refresh stats
      setAffectationData({
        ecriture_id: undefined,
        axe_id: undefined,
        valeur: 0,
      });
      if (selectedAxe) {
        fetchStats(selectedAxe);
      }
    } catch (error) {
      console.error('Error creating affectation:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de créer l\'affectation analytique.',
      });
    }
  };

  const axesColumns = [
    { header: 'Nom', accessor: 'nom', sortable: true },
    { header: 'Description', accessor: 'description', sortable: true },
    {
      header: 'Actions',
      accessor: (row: AxeAnalytique) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setAxeFormData(row);
              setShowAxeForm(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
          <button
            onClick={() => handleAxeDelete(row.id)}
            className="text-red-600 hover:text-red-900"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  const ecrituresColumns = [
    { header: 'ID', accessor: 'id', sortable: true },
    { header: 'Date', accessor: 'date', sortable: true },
    { header: 'Description', accessor: 'description', sortable: true },
    { 
      header: 'Montant', 
      accessor: 'montant',
      sortable: true,
      cell: (row: Ecriture) => new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(row.montant),
    },
    {
      header: 'Affectation',
      accessor: (row: Ecriture) => (
        <div className="flex items-center space-x-2">
          <Select
            options={axes.map(axe => ({ value: axe.id.toString(), label: axe.nom }))}
            value={affectationData.axe_id?.toString() || ''}
            onChange={(e) => setAffectationData(prev => ({
              ...prev,
              axe_id: parseInt(e.target.value),
            }))}
            className="w-40"
          />
          <Input
            type="number"
            value={affectationData.valeur || ''}
            onChange={(e) => setAffectationData(prev => ({
              ...prev,
              valeur: parseFloat(e.target.value),
            }))}
            className="w-32"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleAffectation(row.id)}
            disabled={!affectationData.axe_id || !affectationData.valeur}
          >
            Affecter
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Comptabilité analytique</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setAxeFormData({ nom: '', description: '' });
            setShowAxeForm(true);
          }}
        >
          Nouvel axe
        </Button>
      </div>

      {/* Axes Form */}
      {showAxeForm && (
        <Card title={axeFormData.id ? 'Modifier l\'axe' : 'Nouvel axe'}>
          <form onSubmit={handleAxeSubmit}>
            <div className="space-y-4">
              <Input
                label="Nom"
                id="nom"
                name="nom"
                value={axeFormData.nom}
                onChange={(e) => setAxeFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
              
              <Input
                label="Description"
                id="description"
                name="description"
                value={axeFormData.description}
                onChange={(e) => setAxeFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAxeForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {axeFormData.id ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Axes Table */}
      <Card title="Axes analytiques">
        <DataTable
          columns={axesColumns}
          data={axes}
          keyField="id"
        />
      </Card>

      {/* Affectations */}
      <Card 
        title="Affectations analytiques"
        className="mt-8"
      >
        <DataTable
          columns={ecrituresColumns}
          data={ecritures}
          keyField="id"
        />
      </Card>

      {/* Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card 
            title="Performance par axe" 
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <div className="h-80">
              <div className="w-full h-full flex items-end justify-between pt-6">
                {stats.performance.values.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-indigo-600 rounded-t-lg hover:bg-indigo-700 transition-all duration-300"
                      style={{ 
                        height: `${(value / Math.max(...stats.performance.values)) * 100}%`,
                        minHeight: '20px'
                      }}
                    ></div>
                    <span className="text-xs font-medium text-gray-500 mt-2">
                      {stats.performance.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card 
            title="Marge par axe"
            icon={<LineChart className="w-5 h-5" />}
          >
            <div className="h-80">
              <div className="w-full h-full flex items-end justify-between pt-6">
                {stats.marge.values.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-green-600 rounded-t-lg hover:bg-green-700 transition-all duration-300"
                      style={{ 
                        height: `${(value / Math.max(...stats.marge.values)) * 100}%`,
                        minHeight: '20px'
                      }}
                    ></div>
                    <span className="text-xs font-medium text-gray-500 mt-2">
                      {stats.marge.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytique;