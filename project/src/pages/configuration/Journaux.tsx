import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Journal {
  id: number;
  code: string;
  nom: string;
  type: string;
  status: string;
}

const Journaux: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [journaux, setJournaux] = useState<Journal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Journal>>({
    code: '',
    nom: '',
    type: '',
    status: 'active',
  });

  useEffect(() => {
    fetchJournaux();
  }, []);

  const fetchJournaux = async () => {
    try {
      const response = await apiClient.get<Journal[]>('/api/journaux/');
      setJournaux(response.data);
    } catch (error) {
      console.error('Error fetching journaux:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les journaux.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.put(`/api/journaux/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Journal mis à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/journaux/', formData);
        addNotification({
          type: 'success',
          message: 'Journal créé avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        code: '',
        nom: '',
        type: '',
        status: 'active',
      });
      fetchJournaux();
    } catch (error) {
      console.error('Error saving journal:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer le journal.',
      });
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce journal ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/journaux/${id}/`);
      addNotification({
        type: 'success',
        message: 'Journal archivé avec succès.',
      });
      fetchJournaux();
    } catch (error) {
      console.error('Error archiving journal:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'archiver le journal.',
      });
    }
  };

  const typeOptions = [
    { value: 'BANQUE', label: 'Banque' },
    { value: 'VENTE', label: 'Vente' },
    { value: 'ACHAT', label: 'Achat' },
    { value: 'DIVERS', label: 'Divers' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
  ];

  const columns = [
    { header: 'Code', accessor: 'code', sortable: true },
    { header: 'Nom', accessor: 'nom', sortable: true },
    { header: 'Type', accessor: 'type', sortable: true },
    { header: 'Statut', accessor: 'status', sortable: true },
    {
      header: 'Actions',
      accessor: (row: Journal) => (
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
            onClick={() => handleArchive(row.id)}
            className="text-red-600 hover:text-red-900"
          >
            Archiver
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Journaux comptables</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({
              code: '',
              nom: '',
              type: '',
              status: 'active',
            });
            setShowForm(true);
          }}
        >
          Ajouter un journal
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier le journal' : 'Nouveau journal'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
              />
              
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
              
              <Select
                label="Statut"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                options={statusOptions}
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
          data={journaux}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default Journaux;