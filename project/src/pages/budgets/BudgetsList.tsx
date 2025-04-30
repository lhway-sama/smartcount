import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Budget {
  id: number;
  periode: string;
  date_creation: string;
}

const BudgetsList: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    periode: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await apiClient.get<Budget[]>('/api/budgets/');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les budgets.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.post('/api/budgets/', formData);
      addNotification({
        type: 'success',
        message: 'Budget créé avec succès.',
      });
      setShowForm(false);
      setFormData({ periode: new Date().getFullYear().toString() });
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de créer le budget.',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/budgets/${id}/`);
      addNotification({
        type: 'success',
        message: 'Budget supprimé avec succès.',
      });
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer le budget.',
      });
    }
  };

  const columns = [
    { header: 'Période', accessor: 'periode', sortable: true },
    { header: 'Date de création', accessor: 'date_creation', sortable: true },
    {
      header: 'Actions',
      accessor: (row: Budget) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/budgets/${row.id}`)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Voir Détail
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
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
        >
          Créer un budget
        </Button>
      </div>

      {/* Create Budget Form */}
      {showForm && (
        <Card title="Nouveau budget">
          <form onSubmit={handleSubmit}>
            <Input
              label="Période"
              type="number"
              min={2000}
              max={2100}
              value={formData.periode}
              onChange={(e) => setFormData({ periode: e.target.value })}
              required
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Créer
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Budgets Table */}
      <Card>
        <DataTable
          columns={columns}
          data={budgets}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default BudgetsList;