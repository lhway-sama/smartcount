import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus, Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Compte {
  id: number;
  numero: string;
  nom: string;
  solde: number;
  parent: string | null;
}

const PlanComptable: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Compte>>({
    numero: '',
    nom: '',
    parent: null,
    solde: 0,
  });

  useEffect(() => {
    fetchComptes();
  }, []);

  const fetchComptes = async () => {
    try {
      const response = await apiClient.get<Compte[]>('/api/comptes/');
      setComptes(response.data);
    } catch (error) {
      console.error('Error fetching comptes:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger le plan comptable.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.put(`/api/comptes/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Compte mis à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/comptes/', formData);
        addNotification({
          type: 'success',
          message: 'Compte créé avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        numero: '',
        nom: '',
        parent: null,
        solde: 0,
      });
      fetchComptes();
    } catch (error) {
      console.error('Error saving compte:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer le compte.',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/comptes/${id}/`);
      addNotification({
        type: 'success',
        message: 'Compte supprimé avec succès.',
      });
      fetchComptes();
    } catch (error) {
      console.error('Error deleting compte:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer le compte.',
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post('/api/comptes/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      addNotification({
        type: 'success',
        message: 'Plan comptable importé avec succès.',
      });
      fetchComptes();
    } catch (error) {
      console.error('Error importing plan comptable:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'importer le plan comptable.',
      });
    }
    
    // Reset file input
    e.target.value = '';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const columns = [
    { header: 'Numéro', accessor: 'numero', sortable: true },
    { header: 'Nom', accessor: 'nom', sortable: true },
    { 
      header: 'Solde',
      accessor: 'solde',
      sortable: true,
      cell: (row: Compte) => formatAmount(row.solde),
    },
    { header: 'Parent', accessor: 'parent', sortable: true },
    {
      header: 'Actions',
      accessor: (row: Compte) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Plan comptable</h1>
        
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Importer
            </Button>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setFormData({
                numero: '',
                nom: '',
                parent: null,
                solde: 0,
              });
              setShowForm(true);
            }}
          >
            Ajouter un compte
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier le compte' : 'Nouveau compte'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Numéro"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                required
              />
              
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
              
              <Select
                label="Parent"
                value={formData.parent || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value || null }))}
                options={[
                  { value: '', label: 'Aucun' },
                  ...comptes.map(compte => ({
                    value: compte.numero,
                    label: `${compte.numero} - ${compte.nom}`,
                  })),
                ]}
              />
              
              <Input
                label="Solde"
                type="number"
                step="0.01"
                value={formData.solde}
                onChange={(e) => setFormData(prev => ({ ...prev, solde: parseFloat(e.target.value) }))}
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
          data={comptes}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default PlanComptable;