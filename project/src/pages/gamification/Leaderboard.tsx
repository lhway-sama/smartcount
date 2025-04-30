import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { RefreshCw, Trophy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface LeaderboardEntry {
  user_id: number;
  username: string;
  points: number;
  position: number;
}

const Leaderboard: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<LeaderboardEntry[]>('/api/gamification/leaderboard/');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger le classement.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const columns = [
    { 
      header: 'Rang',
      accessor: 'position',
      sortable: true,
      cell: (row: LeaderboardEntry) => {
        const rankColors = {
          1: 'text-yellow-500',
          2: 'text-gray-500',
          3: 'text-amber-700',
        };
        return (
          <div className="flex items-center">
            <Trophy className={`w-5 h-5 mr-2 ${rankColors[row.position as keyof typeof rankColors] || 'hidden'}`} />
            <span>{row.position}</span>
          </div>
        );
      },
    },
    { header: 'Utilisateur', accessor: 'username', sortable: true },
    { 
      header: 'Points',
      accessor: 'points',
      sortable: true,
      cell: (row: LeaderboardEntry) => (
        <span className="font-semibold">{row.points} pts</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Classement</h1>
        
        <Button
          variant="outline"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchLeaderboard}
          isLoading={isLoading}
        >
          Actualiser
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={leaderboard}
          keyField="user_id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default Leaderboard;