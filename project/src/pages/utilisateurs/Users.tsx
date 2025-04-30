import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  is_active: boolean;
  roles: Role[];
}

const Users: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<User> & { mot_de_passe?: string }>({
    username: '',
    nom: '',
    prenom: '',
    email: '',
    is_active: true,
    roles: [],
    mot_de_passe: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get<Role[]>('/api/roles/');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les rôles.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await apiClient.put(`/api/users/${formData.id}/`, formData);
        addNotification({
          type: 'success',
          message: 'Utilisateur mis à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/users/', formData);
        addNotification({
          type: 'success',
          message: 'Utilisateur créé avec succès.',
        });
      }
      
      setShowForm(false);
      setFormData({
        username: '',
        nom: '',
        prenom: '',
        email: '',
        is_active: true,
        roles: [],
        mot_de_passe: '',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer l\'utilisateur.',
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await apiClient.patch(`/api/users/${user.id}/`, {
        is_active: !user.is_active,
      });
      
      addNotification({
        type: 'success',
        message: `Utilisateur ${user.is_active ? 'désactivé' : 'activé'} avec succès.`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de modifier le statut de l\'utilisateur.',
      });
    }
  };

  const columns = [
    { header: 'Nom d\'utilisateur', accessor: 'username', sortable: true },
    { header: 'Nom', accessor: 'nom', sortable: true },
    { header: 'Prénom', accessor: 'prenom', sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    {
      header: 'Actif',
      accessor: (row: User) => (
        <input
          type="checkbox"
          checked={row.is_active}
          onChange={() => handleToggleActive(row)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      ),
    },
    {
      header: 'Rôles',
      accessor: (row: User) => row.roles.map(role => role.name).join(', '),
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setFormData({
                ...row,
                mot_de_passe: '',
              });
              setShowForm(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({
              username: '',
              nom: '',
              prenom: '',
              email: '',
              is_active: true,
              roles: [],
              mot_de_passe: '',
            });
            setShowForm(true);
          }}
        >
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card title={formData.id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
              
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
              
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              
              {!formData.id && (
                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData(prev => ({ ...prev, mot_de_passe: e.target.value }))}
                  required={!formData.id}
                />
              )}
              
              <Select
                label="Rôles"
                value={formData.roles?.map(r => r.id.toString()) || []}
                onChange={(e) => {
                  const selectedRoles = Array.from(e.target.selectedOptions, option => ({
                    id: parseInt(option.value),
                    name: option.label,
                  }));
                  setFormData(prev => ({ ...prev, roles: selectedRoles }));
                }}
                options={roles.map(role => ({
                  value: role.id.toString(),
                  label: role.name,
                }))}
                multiple
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
          data={users}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default Users;