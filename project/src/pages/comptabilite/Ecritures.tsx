import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Ecriture {
  id: number;
  date: string;
  journal: string;
  numero_piece: string;
  libelle: string;
  debit: number;
  credit: number;
  compte: string;
}

interface FilterParams {
  journal: string;
  date_min: string;
  date_max: string;
}

const Ecritures: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [ecritures, setEcritures] = useState<Ecriture[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  
  const [filterParams, setFilterParams] = useState<FilterParams>({
    journal: '',
    date_min: '',
    date_max: '',
  });
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Ecriture>>({
    date: new Date().toISOString().split('T')[0],
    journal: '',
    numero_piece: '',
    libelle: '',
    debit: 0,
    credit: 0,
    compte: '',
  });
  
  const columns = [
    { header: 'Date', accessor: 'date', sortable: true },
    { header: 'Journal', accessor: 'journal', sortable: true },
    { header: 'N° Pièce', accessor: 'numero_piece', sortable: true },
    { header: 'Libellé', accessor: 'libelle', sortable: true },
    { header: 'Compte', accessor: 'compte', sortable: true },
    { 
      header: 'Débit', 
      accessor: 'debit', 
      sortable: true,
      cell: (row: Ecriture) => formatAmount(row.debit)
    },
    { 
      header: 'Crédit', 
      accessor: 'credit', 
      sortable: true,
      cell: (row: Ecriture) => formatAmount(row.credit)
    },
    {
      header: 'Actions',
      accessor: (row: Ecriture) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-900"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];
  
  const [journaux, setJournaux] = useState([
    { value: 'ACH', label: 'Achats' },
    { value: 'VEN', label: 'Ventes' },
    { value: 'BNQ', label: 'Banque' },
    { value: 'CAIS', label: 'Caisse' },
    { value: 'OD', label: 'Opérations diverses' },
  ]);
  
  useEffect(() => {
    fetchEcritures();
  }, [currentPage, filterParams]);
  
  const fetchEcritures = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...filterParams,
      }).toString();
      
      const response = await apiClient.get(`/api/ecritures/?${queryParams}`);
      
      // Simulate API response for demo
      // This would normally come from the real API
      const mockData = {
        data: Array.from({ length: pageSize }, (_, index) => ({
          id: (currentPage - 1) * pageSize + index + 1,
          date: new Date(2025, 0, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          journal: journaux[Math.floor(Math.random() * journaux.length)].value,
          numero_piece: `PIECE-${Math.floor(Math.random() * 1000) + 1}`,
          libelle: `Écriture ${(currentPage - 1) * pageSize + index + 1}`,
          debit: Math.random() > 0.5 ? Math.floor(Math.random() * 10000) + 100 : 0,
          credit: Math.random() > 0.5 ? Math.floor(Math.random() * 10000) + 100 : 0,
          compte: `${Math.floor(Math.random() * 7) + 1}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        })),
        total: 124,
      };
      
      setEcritures(mockData.data);
      setTotalCount(mockData.total);
    } catch (error) {
      console.error('Error fetching ecritures:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les écritures comptables.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (ecriture: Ecriture) => {
    setFormData(ecriture);
    setShowForm(true);
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette écriture ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/ecritures/${id}/`);
      addNotification({
        type: 'success',
        message: 'Écriture supprimée avec succès.',
      });
      fetchEcritures();
    } catch (error) {
      console.error('Error deleting ecriture:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer l\'écriture.',
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.patch(`/api/ecritures/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Écriture mise à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/ecritures/', formData);
        addNotification({
          type: 'success',
          message: 'Écriture créée avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        journal: '',
        numero_piece: '',
        libelle: '',
        debit: 0,
        credit: 0,
        compte: '',
      });
      fetchEcritures();
    } catch (error) {
      console.error('Error saving ecriture:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer l\'écriture.',
      });
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset page when filter changes
  };
  
  const resetFilters = () => {
    setFilterParams({
      journal: '',
      date_min: '',
      date_max: '',
    });
    setCurrentPage(1);
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Écritures comptables</h1>
        
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({
              date: new Date().toISOString().split('T')[0],
              journal: '',
              numero_piece: '',
              libelle: '',
              debit: 0,
              credit: 0,
              compte: '',
            });
            setShowForm(true);
          }}
        >
          Nouvelle écriture
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <div className="mb-4 flex items-center">
          <h3 className="text-lg font-medium flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </h3>
          <button
            onClick={resetFilters}
            className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
          >
            Réinitialiser
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Journal"
            id="journal"
            name="journal"
            value={filterParams.journal}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'Tous les journaux' },
              ...journaux,
            ]}
          />
          
          <Input
            label="Date début"
            id="date_min"
            name="date_min"
            type="date"
            value={filterParams.date_min}
            onChange={handleFilterChange}
          />
          
          <Input
            label="Date fin"
            id="date_max"
            name="date_max"
            type="date"
            value={filterParams.date_max}
            onChange={handleFilterChange}
          />
        </div>
      </Card>
      
      {/* Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier l\'écriture' : 'Nouvelle écriture'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
              
              <Select
                label="Journal"
                id="journal"
                name="journal"
                value={formData.journal}
                onChange={(e) => setFormData((prev) => ({ ...prev, journal: e.target.value }))}
                options={journaux}
                required
              />
              
              <Input
                label="N° Pièce"
                id="numero_piece"
                name="numero_piece"
                type="text"
                value={formData.numero_piece}
                onChange={(e) => setFormData((prev) => ({ ...prev, numero_piece: e.target.value }))}
                required
              />
              
              <Input
                label="Compte"
                id="compte"
                name="compte"
                type="text"
                value={formData.compte}
                onChange={(e) => setFormData((prev) => ({ ...prev, compte: e.target.value }))}
                required
              />
              
              <Input
                label="Libellé"
                id="libelle"
                name="libelle"
                type="text"
                value={formData.libelle}
                onChange={(e) => setFormData((prev) => ({ ...prev, libelle: e.target.value }))}
                required
                className="md:col-span-2"
              />
              
              <Input
                label="Débit"
                id="debit"
                name="debit"
                type="number"
                value={formData.debit?.toString()}
                onChange={(e) => setFormData((prev) => ({ ...prev, debit: parseFloat(e.target.value) }))}
                step="0.01"
              />
              
              <Input
                label="Crédit"
                id="credit"
                name="credit"
                type="number"
                value={formData.credit?.toString()}
                onChange={(e) => setFormData((prev) => ({ ...prev, credit: parseFloat(e.target.value) }))}
                step="0.01"
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
                {formData.id ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={ecritures}
          keyField="id"
          pagination={{
            totalCount,
            pageSize,
            currentPage,
            onPageChange: setCurrentPage,
          }}
        />
      </Card>
    </div>
  );
};

export default Ecritures;