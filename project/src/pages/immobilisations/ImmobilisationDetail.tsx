import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobal } from '../../contexts/GlobalContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import apiClient from '../../services/apiClient';

interface Immobilisation {
  id: number;
  nom: string;
  type: string;
  date_acquisition: string;
  valeur_acquisition: number;
  duree_vie: number;
  taux_amortissement: number;
}

interface TableauAmortissement {
  date: string;
  valeur_debut: number;
  amortissement: number;
  valeur_fin: number;
}

const ImmobilisationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [immobilisation, setImmobilisation] = useState<Immobilisation | null>(null);
  const [showCessionForm, setShowCessionForm] = useState(false);
  const [cessionData, setCessionData] = useState({
    date_cession: new Date().toISOString().split('T')[0],
    prix_cession: 0,
  });
  const [tableauAmortissement, setTableauAmortissement] = useState<TableauAmortissement[]>([]);

  useEffect(() => {
    fetchImmobilisation();
  }, [id]);

  useEffect(() => {
    if (immobilisation) {
      calculateAmortissement();
    }
  }, [immobilisation]);

  const fetchImmobilisation = async () => {
    try {
      const response = await apiClient.get<Immobilisation>(`/api/immobilisations/${id}/`);
      setImmobilisation(response.data);
    } catch (error) {
      console.error('Error fetching immobilisation:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger l\'immobilisation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAmortissement = () => {
    if (!immobilisation) return;

    const amortissementMensuel = immobilisation.valeur_acquisition * (immobilisation.taux_amortissement / 100 / 12);
    const tableau: TableauAmortissement[] = [];
    let valeurDebut = immobilisation.valeur_acquisition;

    for (let i = 0; i < immobilisation.duree_vie; i++) {
      const date = new Date(immobilisation.date_acquisition);
      date.setMonth(date.getMonth() + i);

      const amortissement = Math.min(amortissementMensuel, valeurDebut);
      const valeurFin = valeurDebut - amortissement;

      tableau.push({
        date: date.toISOString().split('T')[0],
        valeur_debut: valeurDebut,
        amortissement,
        valeur_fin: valeurFin,
      });

      valeurDebut = valeurFin;
    }

    setTableauAmortissement(tableau);
  };

  const handleCession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.post(`/api/immobilisations/${id}/cession/`, cessionData);
      addNotification({
        type: 'success',
        message: 'Cession enregistrée avec succès.',
      });
      setShowCessionForm(false);
      fetchImmobilisation();
    } catch (error) {
      console.error('Error submitting cession:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer la cession.',
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (isLoading || !immobilisation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{immobilisation.nom}</h1>
        
        <Button
          variant="primary"
          onClick={() => setShowCessionForm(true)}
        >
          Valider Cession
        </Button>
      </div>

      {/* Informations générales */}
      <Card title="Informations générales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Type</p>
            <p className="mt-1">{immobilisation.type}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Date d'acquisition</p>
            <p className="mt-1">{new Date(immobilisation.date_acquisition).toLocaleDateString()}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Valeur d'acquisition</p>
            <p className="mt-1">{formatAmount(immobilisation.valeur_acquisition)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Durée de vie</p>
            <p className="mt-1">{immobilisation.duree_vie} mois</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Taux d'amortissement</p>
            <p className="mt-1">{immobilisation.taux_amortissement}%</p>
          </div>
        </div>
      </Card>

      {/* Formulaire de cession */}
      {showCessionForm && (
        <Card title="Valider une cession">
          <form onSubmit={handleCession}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date de cession"
                type="date"
                value={cessionData.date_cession}
                onChange={(e) => setCessionData(prev => ({ ...prev, date_cession: e.target.value }))}
                required
              />
              
              <Input
                label="Prix de cession"
                type="number"
                step="0.01"
                value={cessionData.prix_cession}
                onChange={(e) => setCessionData(prev => ({ ...prev, prix_cession: parseFloat(e.target.value) }))}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCessionForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Valider
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tableau d'amortissement */}
      <Card title="Tableau d'amortissement">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amortissement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur fin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableauAmortissement.map((ligne, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(ligne.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(ligne.valeur_debut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(ligne.amortissement)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(ligne.valeur_fin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ImmobilisationDetail;