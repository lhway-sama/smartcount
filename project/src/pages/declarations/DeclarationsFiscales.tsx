import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus, Calculator, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface TVACalculation {
  montant_collecte: number;
  montant_deductible: number;
  solde_tva: number;
}

interface Declaration {
  id: number;
  periode: string;
  date_declaration: string;
  montant_collecte: number;
  montant_deductible: number;
  statut: string;
}

const DeclarationsFiscales: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [filterParams, setFilterParams] = useState({
    date_min: '',
    date_max: '',
  });
  
  const [tvaCalculation, setTvaCalculation] = useState<TVACalculation | null>(null);
  
  const [formData, setFormData] = useState<Partial<Declaration>>({
    periode: '',
    montant_collecte: 0,
    montant_deductible: 0,
    statut: 'BROUILLON',
  });

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const response = await apiClient.get('/api/declarations/tva/');
      setDeclarations(response.data);
    } catch (error) {
      console.error('Error fetching declarations:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les déclarations.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTVA = async () => {
    if (!filterParams.date_min || !filterParams.date_max) {
      addNotification({
        type: 'error',
        message: 'Veuillez sélectionner une période.',
      });
      return;
    }

    try {
      const response = await apiClient.get(
        `/api/declarations/tva/calc/?date_min=${filterParams.date_min}&date_max=${filterParams.date_max}`
      );
      
      setTvaCalculation(response.data);
      
      // Pre-fill form data with calculation results
      setFormData(prev => ({
        ...prev,
        periode: `${filterParams.date_min} - ${filterParams.date_max}`,
        montant_collecte: response.data.montant_collecte,
        montant_deductible: response.data.montant_deductible,
      }));
    } catch (error) {
      console.error('Error calculating TVA:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de calculer la TVA.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.put(`/api/declarations/tva/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Déclaration mise à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/declarations/tva/', formData);
        addNotification({
          type: 'success',
          message: 'Déclaration créée avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        periode: '',
        montant_collecte: 0,
        montant_deductible: 0,
        statut: 'BROUILLON',
      });
      fetchDeclarations();
    } catch (error) {
      console.error('Error saving declaration:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer la déclaration.',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/declarations/tva/${id}/`);
      addNotification({
        type: 'success',
        message: 'Déclaration supprimée avec succès.',
      });
      fetchDeclarations();
    } catch (error) {
      console.error('Error deleting declaration:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer la déclaration.',
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const columns = [
    { header: 'Période', accessor: 'periode', sortable: true },
    { header: 'Date', accessor: 'date_declaration', sortable: true },
    { 
      header: 'TVA Collectée',
      accessor: 'montant_collecte',
      sortable: true,
      cell: (row: Declaration) => formatAmount(row.montant_collecte),
    },
    { 
      header: 'TVA Déductible',
      accessor: 'montant_deductible',
      sortable: true,
      cell: (row: Declaration) => formatAmount(row.montant_deductible),
    },
    { 
      header: 'Solde',
      accessor: (row: Declaration) => formatAmount(row.montant_collecte - row.montant_deductible),
      sortable: true,
    },
    { header: 'Statut', accessor: 'statut', sortable: true },
    {
      header: 'Actions',
      accessor: (row: Declaration) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setFormData(row);
              setShowForm(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Déclarations de TVA</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({
              periode: '',
              montant_collecte: 0,
              montant_deductible: 0,
              statut: 'BROUILLON',
            });
            setShowForm(true);
          }}
        >
          Créer une déclaration
        </Button>
      </div>

      {/* Calculation Section */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Date début"
              type="date"
              value={filterParams.date_min}
              onChange={(e) => setFilterParams(prev => ({ ...prev, date_min: e.target.value }))}
            />
            
            <Input
              label="Date fin"
              type="date"
              value={filterParams.date_max}
              onChange={(e) => setFilterParams(prev => ({ ...prev, date_max: e.target.value }))}
            />
            
            <div className="flex items-end">
              <Button
                variant="primary"
                icon={<Calculator className="w-4 h-4" />}
                onClick={calculateTVA}
                className="w-full md:w-auto"
              >
                Calculer TVA
              </Button>
            </div>
          </div>

          {tvaCalculation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800">TVA Collectée</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatAmount(tvaCalculation.montant_collecte)}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-800">TVA Déductible</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {formatAmount(tvaCalculation.montant_deductible)}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Solde TVA</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatAmount(tvaCalculation.solde_tva)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Declaration Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier la déclaration' : 'Nouvelle déclaration'}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Période"
                value={formData.periode}
                onChange={(e) => setFormData(prev => ({ ...prev, periode: e.target.value }))}
                required
              />
              
              <Input
                label="TVA Collectée"
                type="number"
                step="0.01"
                value={formData.montant_collecte}
                onChange={(e) => setFormData(prev => ({ ...prev, montant_collecte: parseFloat(e.target.value) }))}
                required
              />
              
              <Input
                label="TVA Déductible"
                type="number"
                step="0.01"
                value={formData.montant_deductible}
                onChange={(e) => setFormData(prev => ({ ...prev, montant_deductible: parseFloat(e.target.value) }))}
                required
              />
              
              <Select
                label="Statut"
                value={formData.statut}
                onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                options={[
                  { value: 'BROUILLON', label: 'Brouillon' },
                  { value: 'SOUMIS', label: 'Soumis' },
                ]}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {formData.id ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Declarations Table */}
      <Card>
        <DataTable
          columns={columns}
          data={declarations}
          keyField="id"
        />
      </Card>
    </div>
  );
};

export default DeclarationsFiscales;