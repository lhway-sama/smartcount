import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobal } from '../../contexts/GlobalContext';
import { Download, BarChart3 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface LigneBudget {
  id: number;
  compte: string;
  montant_previsionnel: number;
  montant_reel: number;
  ecart: number;
}

interface Alerte {
  compte: string;
  montant_depassement: number;
}

interface ComparatifData {
  compte: string;
  previsionnel: number;
  reel: number;
}

const BudgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [lignes, setLignes] = useState<LigneBudget[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [comparatif, setComparatif] = useState<ComparatifData[]>([]);
  const [showComparatif, setShowComparatif] = useState(false);

  useEffect(() => {
    fetchBudgetDetail();
    fetchAlertes();
  }, [id]);

  const fetchBudgetDetail = async () => {
    try {
      const response = await apiClient.get(`/api/budgets/${id}/`);
      setLignes(response.data.lignes);
    } catch (error) {
      console.error('Error fetching budget detail:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger le détail du budget.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlertes = async () => {
    try {
      const response = await apiClient.get(`/api/budgets/${id}/alertes/`);
      setAlertes(response.data);
    } catch (error) {
      console.error('Error fetching alertes:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les alertes.',
      });
    }
  };

  const fetchComparatif = async () => {
    try {
      const response = await apiClient.get(`/api/budgets/${id}/comparatif/`);
      setComparatif(response.data);
      setShowComparatif(true);
    } catch (error) {
      console.error('Error fetching comparatif:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger le comparatif.',
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await apiClient.get(
        `/api/budgets/${id}/comparatif/?export=excel`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'budget-comparatif.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'exporter le fichier Excel.',
      });
    }
  };

  const handleUpdateReel = async (ligneId: number, montantReel: number) => {
    try {
      await apiClient.patch(`/api/budgets/${id}/lignes/${ligneId}/`, {
        montant_reel: montantReel,
      });
      
      // Update local state
      setLignes(prev =>
        prev.map(ligne =>
          ligne.id === ligneId
            ? { ...ligne, montant_reel: montantReel }
            : ligne
        )
      );
      
      addNotification({
        type: 'success',
        message: 'Montant réel mis à jour avec succès.',
      });
      
      // Refresh alertes as they might have changed
      fetchAlertes();
    } catch (error) {
      console.error('Error updating montant reel:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de mettre à jour le montant réel.',
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
    { header: 'Compte', accessor: 'compte', sortable: true },
    { 
      header: 'Prévisionnel',
      accessor: 'montant_previsionnel',
      sortable: true,
      cell: (row: LigneBudget) => formatAmount(row.montant_previsionnel),
    },
    {
      header: 'Réel',
      accessor: (row: LigneBudget) => (
        <Input
          type="number"
          value={row.montant_reel}
          onChange={(e) => handleUpdateReel(row.id, parseFloat(e.target.value))}
          className="w-32"
        />
      ),
    },
    { 
      header: 'Écart',
      accessor: 'ecart',
      sortable: true,
      cell: (row: LigneBudget) => {
        const ecart = row.montant_reel - row.montant_previsionnel;
        const textColor = ecart < 0 ? 'text-red-600' : 'text-green-600';
        return <span className={textColor}>{formatAmount(ecart)}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Détail du budget</h1>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<BarChart3 className="w-4 h-4" />}
            onClick={fetchComparatif}
          >
            Voir Comparatif
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportExcel}
          >
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <Card title="Alertes de dépassement" className="bg-red-50">
          <div className="space-y-3">
            {alertes.map((alerte, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-red-700"
              >
                <span>Compte {alerte.compte}</span>
                <span>
                  Dépassement de {formatAmount(alerte.montant_depassement)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lignes budgétaires */}
      <Card title="Lignes budgétaires">
        <DataTable
          columns={columns}
          data={lignes}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>

      {/* Comparatif Chart */}
      {showComparatif && comparatif.length > 0 && (
        <Card title="Comparatif Prévisionnel vs Réel">
          <div className="h-80">
            <div className="w-full h-full flex items-end justify-between pt-6">
              {comparatif.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-x-2">
                  <div className="flex space-x-2">
                    <div
                      className="w-8 bg-indigo-600 rounded-t-lg"
                      style={{
                        height: `${(item.previsionnel / Math.max(...comparatif.map(i => Math.max(i.previsionnel, i.reel)))) * 100}%`,
                      }}
                    />
                    <div
                      className="w-8 bg-green-600 rounded-t-lg"
                      style={{
                        height: `${(item.reel / Math.max(...comparatif.map(i => Math.max(i.previsionnel, i.reel)))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 mt-2">
                    {item.compte}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-600 rounded mr-2" />
                <span className="text-sm text-gray-600">Prévisionnel</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded mr-2" />
                <span className="text-sm text-gray-600">Réel</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BudgetDetail;