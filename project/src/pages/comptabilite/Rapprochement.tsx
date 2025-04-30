import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Upload, FileUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface LigneReleve {
  id: number;
  date: string;
  description: string;
  montant_debit: number;
  montant_credit: number;
  solde: number;
  ecriture_id: number | null;
}

interface Ecriture {
  id: number;
  date: string;
  description: string;
  montant: number;
}

const Rapprochement: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [releveId, setReleveId] = useState<number | null>(null);
  const [lignes, setLignes] = useState<LigneReleve[]>([]);
  const [ecritures, setEcritures] = useState<Ecriture[]>([]);

  useEffect(() => {
    fetchEcritures();
  }, []);

  useEffect(() => {
    if (releveId) {
      fetchReleve(releveId);
    }
  }, [releveId]);

  const fetchEcritures = async () => {
    try {
      const response = await apiClient.get<Ecriture[]>('/api/ecritures/');
      setEcritures(response.data);
    } catch (error) {
      console.error('Error fetching ecritures:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les écritures.',
      });
    }
  };

  const fetchReleve = async (id: number) => {
    try {
      const response = await apiClient.get(`/api/releves/${id}/`);
      setLignes(response.data.lignes);
    } catch (error) {
      console.error('Error fetching releve:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger le relevé bancaire.',
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv' && extension !== 'ofx') {
        addNotification({
          type: 'error',
          message: 'Format de fichier non supporté. Utilisez CSV ou OFX.',
        });
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addNotification({
        type: 'error',
        message: 'Veuillez sélectionner un fichier.',
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await apiClient.post('/api/releves/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setReleveId(response.data.id);
      addNotification({
        type: 'success',
        message: 'Relevé bancaire importé avec succès.',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'import du relevé bancaire.',
      });
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleMatch = async (ligneId: number, ecritureId: number | null) => {
    try {
      await apiClient.post(`/api/releves/${releveId}/matcher/`, {
        ligne_id: ligneId,
        ecriture_id: ecritureId,
      });
      
      // Update the ligne in the local state
      setLignes(prev => prev.map(ligne => 
        ligne.id === ligneId 
          ? { ...ligne, ecriture_id: ecritureId }
          : ligne
      ));
      
      addNotification({
        type: 'success',
        message: 'Ligne appariée avec succès.',
      });
    } catch (error) {
      console.error('Error matching ligne:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'apparier la ligne.',
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
    { header: 'Date', accessor: 'date', sortable: true },
    { header: 'Description', accessor: 'description', sortable: true },
    { 
      header: 'Débit',
      accessor: 'montant_debit',
      sortable: true,
      cell: (row: LigneReleve) => row.montant_debit ? formatAmount(row.montant_debit) : '-'
    },
    { 
      header: 'Crédit',
      accessor: 'montant_credit',
      sortable: true,
      cell: (row: LigneReleve) => row.montant_credit ? formatAmount(row.montant_credit) : '-'
    },
    { 
      header: 'Solde',
      accessor: 'solde',
      sortable: true,
      cell: (row: LigneReleve) => formatAmount(row.solde)
    },
    {
      header: 'Écriture liée',
      accessor: (row: LigneReleve) => (
        <Select
          value={row.ecriture_id?.toString() || ''}
          onChange={(e) => handleMatch(row.id, e.target.value ? parseInt(e.target.value) : null)}
          options={[
            { value: '', label: 'Non apparié' },
            ...ecritures.map(ecriture => ({
              value: ecriture.id.toString(),
              label: `${ecriture.date} - ${ecriture.description} (${formatAmount(ecriture.montant)})`,
            })),
          ]}
          className="w-64"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rapprochement bancaire</h1>
      </div>

      {/* File Upload */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.ofx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Formats acceptés : CSV, OFX
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FileUp className="w-4 h-4" />}
            onClick={handleUpload}
            isLoading={isLoading}
            disabled={!selectedFile || isLoading}
          >
            Importer
          </Button>
        </div>
      </Card>

      {/* Data Table */}
      {lignes.length > 0 && (
        <Card>
          <DataTable
            columns={columns}
            data={lignes}
            keyField="id"
          />
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && lignes.length === 0 && (
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun relevé importé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par importer un relevé bancaire au format CSV ou OFX.
          </p>
        </div>
      )}
    </div>
  );
};

export default Rapprochement;