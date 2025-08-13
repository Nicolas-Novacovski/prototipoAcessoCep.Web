

import React, { useState, useEffect } from 'react';
import { User, UserRole, PermissionKey, UserPermissions } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { IconEdit, IconTrash } from '../../constants';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';

const allPermissions: { key: PermissionKey; label: string; }[] = [
    { key: 'manage_editais', label: 'Gerenciar Editais' },
    { key: 'manage_chamadas', label: 'Gerenciar Chamadas Complementares' },
    { key: 'manage_analises', label: 'Acompanhar Todas Análises' },
    { key: 'manage_casos_especiais', label: 'Analisar Casos Especiais (Comissão)' },
    { key: 'view_classificacao', label: 'Visualizar Classificação' },
    { key: 'manage_usuarios', label: 'Gerenciar Usuários' },
    { key: 'view_relatorios', label: 'Gerar Relatórios' },
    { key: 'manage_email_templates', label: 'Gerenciar Templates de E-mail' },
    { key: 'manage_config', label: 'Configurações Globais (SEED)' },
    { key: 'view_audit_logs', label: 'Visualizar Logs de Auditoria' },
];

const cepDelegablePermissions: PermissionKey[] = [
    'manage_editais', 'manage_chamadas', 'manage_analises',
    'manage_casos_especiais', 'view_classificacao', 'manage_usuarios',
    'view_relatorios', 'manage_email_templates', 'view_audit_logs'
];


const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = () => {
    setIsLoading(true);
    api.getUsers().then(setUsers).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModalForNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const openConfirmModal = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setDeletingId(null);
    setIsConfirmOpen(false);
  };

  const handleSave = async (userData: Partial<User>, isNew: boolean) => {
    try {
      if (isNew) {
        await api.createUser(userData as Omit<User, 'id'>);
        addToast('Usuário criado com sucesso!', 'success');
      } else if (editingUser) {
        await api.updateUser(editingUser.id, userData);
        addToast('Usuário atualizado com sucesso!', 'success');
      }
      fetchUsers();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao salvar usuário', 'error');
    } finally {
      closeModal();
    }
  };
  
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteUser(deletingId);
      addToast('Usuário excluído com sucesso!', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao excluir usuário', 'error');
    } finally {
      closeConfirmModal();
    }
  };
  
  const handleToggleActive = async (userToToggle: User) => {
    try {
        if(currentUser?.id === userToToggle.id) {
            addToast('Você não pode desativar seu próprio usuário.', 'error');
            return;
        }
        if(currentUser?.role === UserRole.ADMIN_CEP && userToToggle.role === UserRole.ADMIN_SEED) {
             addToast('Você não tem permissão para desativar um administrador SEED.', 'error');
            return;
        }
        await api.updateUser(userToToggle.id, { isActive: !userToToggle.isActive });
        addToast(`Usuário ${userToToggle.isActive ? 'desativado' : 'ativado'} com sucesso!`, 'success');
        fetchUsers();
    } catch (err) {
        addToast(err instanceof Error ? err.message : 'Erro ao atualizar status do usuário.', 'error');
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cep-text dark:text-white">Gerenciar Usuários</h1>
        <Button onClick={openModalForNew}>Novo Usuário</Button>
      </div>
      <Card>
        <CardContent>
          {isLoading ? <Spinner /> : <UserTable users={users} onEdit={openModalForEdit} onDelete={openConfirmModal} onToggleActive={handleToggleActive} currentUser={currentUser} />}
        </CardContent>
      </Card>
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          user={editingUser}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmButtonText="Confirmar Exclusão"
      />
    </div>
  );
};

const UserTable = ({ users, onEdit, onDelete, onToggleActive, currentUser }: { users: User[]; onEdit: (user: User) => void; onDelete: (id: string) => void; onToggleActive: (user: User) => void; currentUser: User | null;}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Perfil</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {users.map(user => {
            const canToggle = !(currentUser?.id === user.id || (currentUser?.role === UserRole.ADMIN_CEP && user.role === UserRole.ADMIN_SEED));
            return (
              <tr key={user.id} className={`${!user.isActive ? 'opacity-50' : ''}`}>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <button
                        onClick={() => canToggle && onToggleActive(user)}
                        disabled={!canToggle}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cep-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                            user.isActive ? 'bg-cep-primary' : 'bg-gray-300 dark:bg-slate-600'
                        }`}
                        title={user.isActive ? 'Desativar Usuário' : 'Ativar Usuário'}
                    >
                        <span
                            aria-hidden="true"
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                user.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="secondary" onClick={() => onEdit(user)} className="p-2 h-auto">
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  {user.role !== UserRole.ADMIN_SEED && (
                    <Button variant="danger" onClick={() => onDelete(user.id)} className="p-2 h-auto">
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

const UserFormModal = ({ isOpen, onClose, onSave, user }: { isOpen: boolean; onClose: () => void; onSave: (data: Partial<User>, isNew: boolean) => void; user: User | null; }) => {
  const isNewUser = !user;
  const { user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    cpf: '',
    role: UserRole.ANALISTA,
    permissions: {},
    isActive: true,
    ...user,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (key: PermissionKey, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: checked,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData, isNewUser);
    setIsSaving(false);
  };

  const allPossibleRoles = [UserRole.ANALISTA, UserRole.ADMIN_CEP, UserRole.RESPONSAVEL, UserRole.ADMIN_SEED];
  const allowedRoles = currentUser?.role === UserRole.ADMIN_SEED
    ? allPossibleRoles
    : allPossibleRoles.filter(role => role !== UserRole.ADMIN_SEED);

  const availablePermissions = currentUser?.role === UserRole.ADMIN_SEED
    ? allPermissions
    : allPermissions.filter(p => cepDelegablePermissions.includes(p.key));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNewUser ? 'Novo Usuário' : 'Editar Usuário'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="name" name="name" label="Nome Completo" value={formData.name} onChange={handleChange} required />
        <Input id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
        <Input id="cpf" name="cpf" label="CPF (somente números)" value={formData.cpf} onChange={(e) => setFormData(prev => ({...prev, cpf: e.target.value.replace(/\D/g, '')}))} maxLength={11} disabled={!isNewUser} required />
        <Select id="role" name="role" label="Perfil" value={formData.role} onChange={handleChange}>
          {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
        
        {(formData.role === UserRole.ADMIN_CEP || formData.role === UserRole.ADMIN_SEED) && (
            <div className="space-y-2 pt-4 border-t dark:border-slate-700">
                <h3 className="text-lg font-medium text-cep-text dark:text-white">Permissões Específicas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {availablePermissions.map(perm => (
                        <div key={perm.key} className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input
                                    id={`perm-${perm.key}`}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-cep-primary focus:ring-cep-primary"
                                    checked={formData.permissions?.[perm.key] || false}
                                    onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={`perm-${perm.key}`} className="font-medium text-cep-text dark:text-slate-200">
                                    {perm.label}
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageUsers;