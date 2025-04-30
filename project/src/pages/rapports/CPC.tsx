import React, { useState } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import apiClient from '../../services/apiClient';

const CPC: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [periode, setPeriode] = useState(new Date().getFullYear().toString());

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/rapports/cpc/?periode=${periode}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setPdfUrl(url);
      
      addNotification({
        type: 'success',
        message: 'Compte de résultat généré avec succès.',
      });
    } catch (error) {
      console.error('Error generating CPC:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de générer le compte de résultat.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `compte-resultat-${periode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Compte de résultat</h1>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-64">
            <Select
              label="Période"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              options={[
                { value: '2023', label: '2023' },
                { value: '2024', label: '2024' },
                { value: '2025', label: '2025' },
              ]}
            />
          </div>
          
          <Button
            variant="primary"
            onClick={handleGenerate}
            isLoading={isLoading}
          >
            Générer CPC
          </Button>
          
          {pdfUrl && (
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
            >
              Télécharger
            </Button>
          )}
        </div>

        {pdfUrl && (
          <div className="mt-6 border rounded-lg overflow-hidden h-[800px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Compte de résultat PDF"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default CPC;