import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import apiClient from '../../services/apiClient';

interface Permission {
  id: number;
  codename: string;
  name: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

const RolesAndPermissions: React.FC = () => {
  const { addNotification } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: [],
  });
  const [permissionFormData, setPermissionFormData] = useState<Partial<Permission>>({
    codename: '',
    name: '',
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiClient.get<Permission[]>('/api/permissions/');
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de charger les permissions.',
      });
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (roleFormData.id) {
        await apiClient.put(`/api/roles/${roleFormData.id}/`, roleFormData);
        addNotification({
          type: 'success',
          message: 'Rôle mis à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/roles/', roleFormData);
        addNotification({
          type: 'success',
          message: 'Rôle créé avec succès.',
        });
      }
      
      setShowRoleForm(false);
      setRoleFormData({
        name: '',
        description: '',
        permissions: [],
      });
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer le rôle.',
      });
    }
  };

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (permissionFormData.id) {
        await apiClient.put(`/api/permissions/${permissionFormData.id}/`, permissionFormData);
        addNotification({
          type: 'success',
          message: 'Permission mise à jour avec succès.',
        });
      } else {
        await apiClient.post('/api/permissions/', permissionFormData);
        addNotification({
          type: 'success',
          message: 'Permission créée avec succès.',
        });
      }
      
      setShowPermissionForm(false);
      setPermissionFormData({
        codename: '',
        name: '',
      });
      fetchPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
      addNotification({
        type: 'error',
        message: 'Impossible d\'enregistrer la permission.',
      });
    }
  };

  const handleRoleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/roles/${id}/`);
      addNotification({
        type: 'success',
        message: 'Rôle supprimé avec succès.',
      });
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer le rôle.',
      });
    }
  };

  const handlePermissionDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/permissions/${id}/`);
      addNotification({
        type: 'success',
        message: 'Permission supprimée avec succès.',
      });
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      addNotification({
        type: 'error',
        message: 'Impossible de supprimer la permission.',
      });
    }
  };

  const rolesColumns = [
    { header: 'Nom', accessor: 'name', sortable: true },
    { header: 'Description', accessor: 'description', sortable: true },
    {
      header: 'Permissions',
      accessor: (row: Role) => row.permissions.length,
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: (row: Role) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setRoleFormData(row);
              setShowRoleForm(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
          <button
            onClick={() => handleRoleDelete(row.id)}
            className="text-red-600 hover:text-red-900"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  const permissionsColumns = [
    { header: 'Code', accessor: 'codename', sortable: true },
    { header: 'Nom', accessor: 'name', sortable: true },
    {
      header: 'Actions',
      accessor: (row: Permission) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setPermissionFormData(row);
              setShowPermissionForm(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
          <button
            onClick={() => handlePermissionDelete(row.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Rôles et permissions</h1>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setPermissionFormData({
                codename: '',
                name: '',
              });
              setShowPermissionForm(true);
            }}
          >
            Ajouter une permission
          </Button>
          
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setRoleFormData({
                name: '',
                description: '',
                permissions: [],
              });
              setShowRoleForm(true);
            }}
          >
            Ajouter un rôle
          </Button>
        </div>
      </div>

      {/* Role Form */}
      {showRoleForm && (
        <Card title={roleFormData.id ? 'Modifier le rôle' : 'Nouveau rôle'}>
          <form onSubmit={handleRoleSubmit}>
            <div className="space-y-4">
              <Input
                label="Nom"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              
              <Input
                label="Description"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              
              <Select
                label="Permissions"
                value={roleFormData.permissions?.map(p => p.id.toString()) || []}
                onChange={(e) => {
                  const selectedPermissions = Array.from(e.target.selectedOptions, option => ({
                    id: parseInt(option.value),
                    name: option.label,
                    codename: permissions.find(p => p.id === parseInt(option.value))?.codename || '',
                  }));
                  setRoleFormData(prev => ({ ...prev, permissions: selectedPermissions }));
                }}
                options={permissions.map(permission => ({
                  value: permission.id.toString(),
                  label: permission.name,
                }))}
                multiple
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRoleForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {roleFormData.id ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Permission Form */}
      {showPermissionForm && (
        <Card title={permissionFormData.id ? 'Modifier la permission' : 'Nouvelle permission'}>
          <form onSubmit={handlePermissionSubmit}>
            <div className="space-y-4">
              <Input
                label="Code"
                value={permissionFormData.codename}
                onChange={(e) => setPermissionFormData(prev => ({ ...prev, codename: e.target.value }))}
                required
              />
              
              <Input
                label="Nom"
                value={permissionFormData.name}
                onChange={(e) => setPermissionFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPermissionForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {permissionFormData.id ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Roles Table */}
      <Card title="Rôles">
        <DataTable
          columns={rolesColumns}
          data={roles}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>

      {/* Permissions Table */}
      <Card title="Permissions">
        <DataTable
          columns={permissionsColumns}
          data={permissions}
          keyField="id"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default RolesAndPermissions;