

import React, { useState, useEffect } from 'react';
import { Edital, ComplementaryCall } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { IconTrash, IconFileText, IconX } from '../../constants';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

type ComplementaryCallFormData = Omit<ComplementaryCall, 'id' | 'pdfUrl' | 'pdfFileName'>;

const ManageComplementaryCalls = () => {
  const [calls, setCalls] = useState<ComplementaryCall[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([api.getComplementaryCalls(), api.getEditais()])
        .then(([callData, editalData]) => {
            setCalls(callData);
            setEditais(editalData);
        })
        .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModalForNew = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openConfirmModal = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setDeletingId(null);
    setIsConfirmOpen(false);
  };

  const handleSave = async (callData: Omit<ComplementaryCall, 'id'>) => {
    try {
      await api.createComplementaryCall(callData);
      addToast('Chamada complementar criada com sucesso!', 'success');
      fetchData();
      closeModal();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao salvar chamada', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteComplementaryCall(deletingId);
      addToast('Chamada complementar excluída com sucesso!', 'success');
      fetchData();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao excluir chamada', 'error');
    } finally {
      closeConfirmModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cep-text dark:text-white">Gerenciar Chamadas Complementares</h1>
        <Button onClick={openModalForNew}>Nova Chamada</Button>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <ComplementaryCallTable calls={calls} editais={editais} onDelete={openConfirmModal} />
          )}
        </CardContent>
      </Card>
      {isModalOpen && (
        <ComplementaryCallFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          editais={editais}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta chamada complementar? Esta ação não pode ser desfeita."
        confirmButtonText="Confirmar Exclusão"
      />
    </div>
  );
};

const ComplementaryCallTable = ({ calls, editais, onDelete }: { calls: ComplementaryCall[]; editais: Edital[], onDelete: (id: string) => void; }) => {
    const getEditalName = (editalId: string) => {
        const edital = editais.find(e => e.id === editalId);
        return edital ? `${edital.number} - ${edital.modality}` : 'Edital não encontrado';
    };
    
    return (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Edital Associado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data de Início</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
            </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {calls.map(call => (
                <tr key={call.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{call.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getEditalName(call.editalId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(call.startDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="danger" onClick={() => onDelete(call.id)} className="p-2 h-auto"><IconTrash className="h-4 w-4" /></Button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

const ComplementaryCallFormModal = ({ isOpen, onClose, onSave, editais }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<ComplementaryCall, 'id'>) => void; editais: Edital[]; }) => {
  const [formData, setFormData] = useState<ComplementaryCallFormData>({
    title: '',
    editalId: '',
    startDate: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            addToast('Apenas arquivos PDF são permitidos.', 'error');
            e.target.value = ''; // Reset input
            return;
        }
        setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
        addToast('É necessário anexar um arquivo PDF para a chamada.', 'error');
        return;
    }
    if (!formData.editalId) {
        addToast('Selecione um edital.', 'error');
        return;
    }
    setIsSaving(true);
    // In a real app, this would involve uploading the file to a server.
    // Here we mock it by creating an object URL.
    const dataToSave: Omit<ComplementaryCall, 'id'> = {
        ...formData,
        pdfUrl: URL.createObjectURL(pdfFile),
        pdfFileName: pdfFile.name,
    };
    await onSave(dataToSave);
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Nova Chamada Complementar'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="title" name="title" label="Título da Chamada" value={formData.title} onChange={handleChange} placeholder="Ex: 2ª Chamada Complementar" required />
        <Select id="editalId" name="editalId" label="Edital Associado" value={formData.editalId} onChange={handleChange} required>
            <option value="">Selecione um Edital</option>
            {editais.filter(e => e.isActive).map(e => <option key={e.id} value={e.id}>{e.number} - {e.modality}</option>)}
        </Select>
        
        <Input id="startDate" name="startDate" label="Data de Início da Vigência" type="date" value={formData.startDate} onChange={handleChange} required />
        
        <div>
            <label className="block text-sm font-medium text-cep-text dark:text-slate-300">
                Arquivo PDF da Chamada
            </label>
            {!pdfFile ? (
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cep-primary/10 file:text-cep-primary hover:file:bg-cep-primary/20"
                    required
                />
            ) : (
                 <div className="flex items-center text-cep-text dark:text-slate-200 bg-gray-50 dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600 mt-1">
                    <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="flex-1 truncate" title={pdfFile.name}>{pdfFile.name}</span>
                    <button 
                        type="button"
                        onClick={() => setPdfFile(null)} 
                        className="ml-4 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        aria-label={`Remover ${pdfFile.name}`}
                    >
                        <IconX className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>Salvar Chamada</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageComplementaryCalls;