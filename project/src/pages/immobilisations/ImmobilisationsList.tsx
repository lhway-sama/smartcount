import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Immobilisation {
  id: number;
  nom: string;
  type: string;
  valeur_nette: number;
  date_acquisition: string;
  valeur_acquisition: number;
  duree_vie: number;
  taux_amortissement: number;
}

const ImmobilisationsList: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [immobilisations, setImmobilisations] = useState<Immobilisation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Immobilisation>>({
    nom: '',
    type: '',
    date_acquisition: new Date().toISOString().split('T')[0],
    valeur_acquisition: 0,
    duree_vie: 12,
    taux_amortissement: 0,
  });

  useEffect(() => {
    fetchImmobilisations();
  }, []);

  const fetchImmobilisations = async () => {
    try {
      const response = await apiClient.get<Immobilisation[]>('/api/immobilisations/');
      setImmobilisations(response.data);
    } catch (error) {
      console.error('Error fetching immobilisations:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les immobilisations.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.put(`/api/immobilisations/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Immobilisation mise à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/immobilisations/', formData);
        addNotification({
          type: 'success',
          message: 'Immobilisation créée avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        nom: '',
        type: '',
        date_acquisition: new Date().toISOString().split('T')[0],
        valeur_acquisition: 0,
        duree_vie: 12,
        taux_amortissement: 0,
      });
      fetchImmobilisations();
    } catch (error) {
      console.error('Error saving immobilisation:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer l\'immobilisation.',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette immobilisation ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/immobilisations/${id}/`);
      addNotification({
        type: 'success',
        message: 'Immobilisation supprimée avec succès.',
      });
      fetchImmobilisations();
    } catch (error) {
      console.error('Error deleting immobilisation:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer l\'immobilisation.',
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
    { header: 'Nom', accessor: 'nom', sortable: true },
    { header: 'Type', accessor: 'type', sortable: true },
    { 
      header: 'Valeur Nette',
      accessor: 'valeur_nette',
      sortable: true,
      cell: (row: Immobilisation) => formatAmount(row.valeur_nette),
    },
    {
      header: 'Actions',
      accessor: (row: Immobilisation) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/immobilisations/${row.id}`)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Voir Détail
          </button>
          <button
            onClick={() => {
              setFormData(row);
              setShowForm(true);
            }}
            className="text-blue-600 hover:text-blue-900"
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

  const typeOptions = [
    { value: 'INCORPOREL', label: 'Incorporel' },
    { value: 'CORPOREL', label: 'Corporel' },
    { value: 'FINANCIER', label: 'Financier' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Immobilisations</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({
              nom: '',
              type: '',
              date_acquisition: new Date().toISOString().split('T')[0],
              valeur_acquisition: 0,
              duree_vie: 12,
              taux_amortissement: 0,
            });
            setShowForm(true);
          }}
        >
          Ajouter une immobilisation
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier l\'immobilisation' : 'Nouvelle immobilisation'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
              
              <Select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                options={typeOptions}
                required
              />
              
              <Input
                label="Date d'acquisition"
                type="date"
                value={formData.date_acquisition}
                onChange={(e) => setFormData(prev => ({ ...prev, date_acquisition: e.target.value }))}
                required
              />
              
              <Input
                label="Valeur d'acquisition"
                type="number"
                step="0.01"
                value={formData.valeur_acquisition}
                onChange={(e) => setFormData(prev => ({ ...prev, valeur_acquisition: parseFloat(e.target.value) }))}
                required
              />
              
              <Input
                label="Durée de vie (mois)"
                type="number"
                value={formData.duree_vie}
                onChange={(e) => setFormData(prev => ({ ...prev, duree_vie: parseInt(e.target.value) }))}
                required
              />
              
              <Input
                label="Taux d'amortissement (%)"
                type="number"
                step="0.01"
                value={formData.taux_amortissement}
                onChange={(e) => setFormData(prev => ({ ...prev, taux_amortissement: parseFloat(e.target.value) }))}
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

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={immobilisations}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default ImmobilisationsList;