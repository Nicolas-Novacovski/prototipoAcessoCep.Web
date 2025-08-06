
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
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

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchUsers = () => {
    setIsLoading(true);
    api.getUsers().then(setUsers).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleSave = async (userData: Partial<User>) => {
    if (!editingUser) return;
    try {
      await api.updateUser(editingUser.id, userData);
      addToast('Usuário atualizado com sucesso!', 'success');
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cep-text dark:text-white">Gerenciar Usuários</h1>
        {/* <Button>Novo Usuário</Button> */}
      </div>
      <Card>
        <CardContent>
          {isLoading ? <Spinner /> : <UserTable users={users} onEdit={openModalForEdit} onDelete={openConfirmModal} />}
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
      />
    </div>
  );
};

const UserTable = ({ users, onEdit, onDelete }: { users: User[]; onEdit: (user: User) => void; onDelete: (id: string) => void; }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPF</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Perfil</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.cpf}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserFormModal = ({ isOpen, onClose, onSave, user }: { isOpen: boolean; onClose: () => void; onSave: (data: Partial<User>) => void; user: User | null; }) => {
  const [formData, setFormData] = useState<Partial<User>>({ name: '', email: '', role: UserRole.ANALISTA, ...user });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const allowedRoles = [UserRole.ANALISTA, UserRole.ADMIN_CEP, UserRole.ADMIN_SEED, UserRole.RESPONSAVEL];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuário' : 'Novo Usuário'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="name" name="name" label="Nome" value={formData.name} onChange={handleChange} required />
        <Input id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
        <Input id="cpf" name="cpf" label="CPF" value={formData.cpf} disabled />
        <Select id="role" name="role" label="Perfil" value={formData.role} onChange={handleChange}>
          {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageUsers;