import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus, Archive, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Fournisseur {
  id: number;
  nom: string;
}

interface LigneFacture {
  description: string;
  quantite: number;
  pu: number;
  total: number;
}

interface Facture {
  id: number;
  date_emission: string;
  date_echeance: string;
  fournisseur_id: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  statut: string;
  lignes: LigneFacture[];
}

const TVA_RATE = 0.20; // 20% TVA

const Fournisseurs: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Facture>>({
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fournisseur_id: undefined,
    montant_ht: 0,
    montant_tva: 0,
    montant_ttc: 0,
    lignes: [],
  });

  useEffect(() => {
    fetchFactures();
    fetchFournisseurs();
  }, []);

  const fetchFactures = async () => {
    try {
      const response = await apiClient.get('/api/factures/fournisseurs/');
      setFactures(response.data);
    } catch (error) {
      console.error('Error fetching factures:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les factures.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await apiClient.get('/api/fournisseurs/');
      setFournisseurs(response.data);
    } catch (error) {
      console.error('Error fetching fournisseurs:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les fournisseurs.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.put(`/api/factures/fournisseurs/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Facture mise à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/factures/fournisseurs/', formData);
        addNotification({
          type: 'success',
          message: 'Facture créée avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        date_emission: new Date().toISOString().split('T')[0],
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fournisseur_id: undefined,
        montant_ht: 0,
        montant_tva: 0,
        montant_ttc: 0,
        lignes: [],
      });
      fetchFactures();
    } catch (error) {
      console.error('Error saving facture:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer la facture.',
      });
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver cette facture ?')) {
      return;
    }
    
    try {
      await apiClient.post(`/api/factures/fournisseurs/${id}/archive/`);
      addNotification({
        type: 'success',
        message: 'Facture archivée avec succès.',
      });
      fetchFactures();
    } catch (error) {
      console.error('Error archiving facture:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'archiver la facture.',
      });
    }
  };

  const handlePay = async (id: number) => {
    try {
      await apiClient.post(`/api/factures/${id}/pay/`);
      addNotification({
        type: 'success',
        message: 'Paiement enregistré avec succès.',
      });
      fetchFactures();
    } catch (error) {
      console.error('Error paying facture:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer le paiement.',
      });
    }
  };

  const addLigne = () => {
    setFormData(prev => ({
      ...prev,
      lignes: [
        ...(prev.lignes || []),
        { description: '', quantite: 1, pu: 0, total: 0 },
      ],
    }));
  };

  const updateLigne = (index: number, field: keyof LigneFacture, value: string | number) => {
    setFormData(prev => {
      const lignes = [...(prev.lignes || [])];
      lignes[index] = {
        ...lignes[index],
        [field]: value,
      };
      
      // Calculate line total
      lignes[index].total = lignes[index].quantite * lignes[index].pu;
      
      // Calculate totals
      const montant_ht = lignes.reduce((sum, ligne) => sum + ligne.total, 0);
      const montant_tva = montant_ht * TVA_RATE;
      const montant_ttc = montant_ht + montant_tva;
      
      return {
        ...prev,
        lignes,
        montant_ht,
        montant_tva,
        montant_ttc,
      };
    });
  };

  const removeLigne = (index: number) => {
    setFormData(prev => {
      const lignes = (prev.lignes || []).filter((_, i) => i !== index);
      
      // Recalculate totals
      const montant_ht = lignes.reduce((sum, ligne) => sum + ligne.total, 0);
      const montant_tva = montant_ht * TVA_RATE;
      const montant_ttc = montant_ht + montant_tva;
      
      return {
        ...prev,
        lignes,
        montant_ht,
        montant_tva,
        montant_ttc,
      };
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const columns = [
    { header: 'N° Facture', accessor: 'id', sortable: true },
    { header: 'Date Émission', accessor: 'date_emission', sortable: true },
    { header: 'Date Échéance', accessor: 'date_echeance', sortable: true },
    { 
      header: 'Montant TTC',
      accessor: 'montant_ttc',
      sortable: true,
      cell: (row: Facture) => formatAmount(row.montant_ttc),
    },
    { header: 'Statut', accessor: 'statut', sortable: true },
    {
      header: 'Actions',
      accessor: (row: Facture) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setFormData(row);
              setShowForm(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Éditer
          </button>
          <button
            onClick={() => handleArchive(row.id)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Archive className="w-4 h-4" />
          </button>
          {row.statut !== 'PAYEE' && (
            <button
              onClick={() => handlePay(row.id)}
              className="text-green-600 hover:text-green-900"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Factures fournisseurs</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({
              date_emission: new Date().toISOString().split('T')[0],
              date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              fournisseur_id: undefined,
              montant_ht: 0,
              montant_tva: 0,
              montant_ttc: 0,
              lignes: [],
            });
            setShowForm(true);
          }}
        >
          Créer une facture
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier la facture' : 'Nouvelle facture'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Fournisseur"
                id="fournisseur_id"
                name="fournisseur_id"
                value={formData.fournisseur_id?.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, fournisseur_id: parseInt(e.target.value) }))}
                options={fournisseurs.map(fournisseur => ({
                  value: fournisseur.id.toString(),
                  label: fournisseur.nom,
                }))}
                required
              />
              
              <Input
                label="Date Émission"
                id="date_emission"
                name="date_emission"
                type="date"
                value={formData.date_emission}
                onChange={(e) => setFormData(prev => ({ ...prev, date_emission: e.target.value }))}
                required
              />
              
              <Input
                label="Date Échéance"
                id="date_echeance"
                name="date_echeance"
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData(prev => ({ ...prev, date_echeance: e.target.value }))}
                required
              />
            </div>

            {/* Lignes */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Lignes de facture</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={addLigne}
                >
                  Ajouter une ligne
                </Button>
              </div>

              <div className="space-y-4">
                {formData.lignes?.map((ligne, index) => (
                  <div key={index} className="flex items-end space-x-4">
                    <Input
                      label="Description"
                      value={ligne.description}
                      onChange={(e) => updateLigne(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      label="Quantité"
                      type="number"
                      value={ligne.quantite}
                      onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value))}
                      className="w-24"
                    />
                    <Input
                      label="Prix unitaire"
                      type="number"
                      value={ligne.pu}
                      onChange={(e) => updateLigne(index, 'pu', parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <div className="mb-4 w-32">
                      <p className="text-sm font-medium text-gray-700">Total</p>
                      <p className="mt-1 text-sm text-gray-900">{formatAmount(ligne.total)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLigne(index)}
                      className="mb-4"
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Montant HT</span>
                    <span className="text-sm font-medium">{formatAmount(formData.montant_ht || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">TVA (20%)</span>
                    <span className="text-sm font-medium">{formatAmount(formData.montant_tva || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total TTC</span>
                    <span className="text-sm font-bold">{formatAmount(formData.montant_ttc || 0)}</span>
                  </div>
                </div>
              </div>
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
          data={factures}
          keyField="id"
        />
      </Card>
    </div>
  );
};

export default Fournisseurs;