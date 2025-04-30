import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import apiClient from '../../services/apiClient';

interface Badge {
  code: string;
  name: string;
  description: string;
  icon_url: string;
}

interface UserBadge {
  badge_code: string;
  date_attribution: string;
}

interface User {
  id: number;
  username: string;
}

const Badges: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    badge_code: '',
  });

  useEffect(() => {
    Promise.all([
      fetchBadges(),
      fetchUserBadges(),
      fetchUsers(),
    ]).finally(() => setIsLoading(false));
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await apiClient.get<Badge[]>('/api/gamification/badges/');
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les badges.',
      });
    }
  };

  const fetchUserBadges = async () => {
    try {
      const response = await apiClient.get<UserBadge[]>('/api/gamification/user-badges/');
      setUserBadges(response.data);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les badges de l\'utilisateur.',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<User[]>('/api/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les utilisateurs.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.post('/api/gamification/badges/', formData);
      addNotification({
        type: 'success',
        message: 'Badge attribué avec succès.',
      });
      setShowForm(false);
      setFormData({ user_id: '', badge_code: '' });
      fetchUserBadges();
    } catch (error) {
      console.error('Error attributing badge:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'attribuer le badge.',
      });
    }
  };

  const isBadgeAwarded = (badgeCode: string) => {
    return userBadges.some(ub => ub.badge_code === badgeCode);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
        >
          Attribuer un badge
        </Button>
      </div>

      {/* Attribution Form */}
      {showForm && (
        <Card title="Attribuer un badge">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Select
                label="Utilisateur"
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                options={[
                  { value: '', label: 'Sélectionner un utilisateur' },
                  ...users.map(user => ({
                    value: user.id.toString(),
                    label: user.username,
                  })),
                ]}
                required
              />
              
              <Select
                label="Badge"
                value={formData.badge_code}
                onChange={(e) => setFormData(prev => ({ ...prev, badge_code: e.target.value }))}
                options={[
                  { value: '', label: 'Sélectionner un badge' },
                  ...badges.map(badge => ({
                    value: badge.code,
                    label: badge.name,
                  })),
                ]}
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
                Attribuer
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <Card key={badge.code} className={`transition-all duration-300 ${isBadgeAwarded(badge.code) ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {badge.icon_url ? (
                  <img
                    src={badge.icon_url}
                    alt={badge.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{badge.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{badge.description}</p>
                {isBadgeAwarded(badge.code) && (
                  <p className="mt-2 text-sm text-indigo-600">
                    Obtenu le {new Date(userBadges.find(ub => ub.badge_code === badge.code)?.date_attribution || '').toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Badges;