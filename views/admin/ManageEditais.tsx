


import React, { useState, useEffect } from 'react';
import { Edital, EditalModalities, EditalFormData, VacancyDetail, VacancyType, VacancyShift, CustomRequirement } from '../../types';
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

const ManageEditais = () => {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingEdital, setEditingEdital] = useState<Edital | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchEditais = () => {
    setIsLoading(true);
    api.getEditais().then(setEditais).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchEditais();
  }, []);

  const openModalForNew = () => {
    setEditingEdital(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (edital: Edital) => {
    setEditingEdital(edital);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEdital(null);
  };

  const openConfirmModal = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setDeletingId(null);
    setIsConfirmOpen(false);
  };

  const handleSave = async (formData: EditalFormData) => {
    try {
      if (editingEdital) {
        await api.updateEdital(editingEdital.id, formData);
        addToast('Edital atualizado com sucesso!', 'success');
      } else {
        await api.createEdital(formData);
        addToast('Edital criado com sucesso!', 'success');
      }
      fetchEditais();
      closeModal();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao salvar edital', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteEdital(deletingId);
      addToast('Edital excluído com sucesso!', 'success');
      fetchEditais();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao excluir edital', 'error');
    } finally {
      closeConfirmModal();
    }
  };
  
  const handleToggleActive = async (edital: Edital) => {
    try {
        const updatedData = { ...edital, inscriptionStart: edital.inscriptionStart.split('T')[0], inscriptionEnd: edital.inscriptionEnd.split('T')[0], analysisStart: edital.analysisStart.split('T')[0], analysisEnd: edital.analysisEnd.split('T')[0], preliminaryResultDate: edital.preliminaryResultDate.split('T')[0], appealStartDate: edital.appealStartDate.split('T')[0], appealEndDate: edital.appealEndDate.split('T')[0], resultDate: edital.resultDate.split('T')[0], vacancyAcceptanceStartDate: edital.vacancyAcceptanceStartDate.split('T')[0], vacancyAcceptanceDate: edital.vacancyAcceptanceDate.split('T')[0] };
        await api.updateEdital(edital.id, { ...updatedData, isActive: !edital.isActive });
        addToast(`Edital ${edital.isActive ? 'desativado' : 'ativado'} com sucesso!`, 'success');
        fetchEditais();
    } catch (err) {
        addToast(err instanceof Error ? err.message : 'Erro ao atualizar status do edital.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cep-text dark:text-white">Gerenciar Editais</h1>
        <Button onClick={openModalForNew}>Novo Edital</Button>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <EditalTable editais={editais} onEdit={openModalForEdit} onDelete={openConfirmModal} onToggleActive={handleToggleActive} />
          )}
        </CardContent>
      </Card>
      {isModalOpen && (
        <EditalFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          edital={editingEdital}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este edital? Esta ação e suas chamadas complementares serão removidas. A ação não pode ser desfeita."
        confirmButtonText="Confirmar Exclusão"
      />
    </div>
  );
};

const EditalTable = ({ editais, onEdit, onDelete, onToggleActive }: { editais: Edital[]; onEdit: (edital: Edital) => void; onDelete: (id: string) => void; onToggleActive: (edital: Edital) => void; }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Número</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Modalidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vagas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Inscrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resultados</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {editais.map(edital => (
            <tr key={edital.id} className={`${!edital.isActive ? 'bg-slate-50 dark:bg-slate-800/60 opacity-60' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                    onClick={() => onToggleActive(edital)}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cep-primary ${
                        edital.isActive ? 'bg-cep-primary' : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                    title={edital.isActive ? 'Desativar Edital' : 'Ativar Edital'}
                >
                    <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            edital.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{edital.number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{edital.modality}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{edital.vacancyDetails.reduce((sum, v) => sum + v.count, 0)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(edital.inscriptionStart).toLocaleDateString('pt-BR')} - {new Date(edital.inscriptionEnd).toLocaleDateString('pt-BR')}
              </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 <div>Preliminar: {new Date(edital.preliminaryResultDate).toLocaleDateString('pt-BR')}</div>
                 <div>Final: {new Date(edital.resultDate).toLocaleDateString('pt-BR')}</div>
                 <div>Aceite: {new Date(edital.vacancyAcceptanceStartDate).toLocaleDateString('pt-BR')} - {new Date(edital.vacancyAcceptanceDate).toLocaleDateString('pt-BR')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button variant="secondary" onClick={() => onEdit(edital)} className="p-2 h-auto">
                  <IconEdit className="h-4 w-4" />
                </Button>
                <Button variant="danger" onClick={() => onDelete(edital.id)} className="p-2 h-auto"><IconTrash className="h-4 w-4" /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EditalFormModal = ({ isOpen, onClose, onSave, edital }: { isOpen: boolean; onClose: () => void; onSave: (data: EditalFormData) => void; edital: Edital | null; }) => {
  const [formData, setFormData] = useState<Omit<Edital, 'id'>>({
    number: '',
    modality: EditalModalities.FUNDAMENTAL_6_ANO,
    vacancyDetails: [],
    year: new Date().getFullYear() + 1,
    inscriptionStart: '',
    inscriptionEnd: '',
    analysisStart: '',
    analysisEnd: '',
    preliminaryResultDate: '',
    appealStartDate: '',
    appealEndDate: '',
    resultDate: '',
    vacancyAcceptanceStartDate: '',
    vacancyAcceptanceDate: '',
    customRequirements: [],
    additionalDocuments: [],
    isActive: true,
    editalPdfUrl: '',
    ...(edital ? { 
        ...edital, 
        vacancyDetails: edital.vacancyDetails || [],
        inscriptionStart: edital.inscriptionStart.split('T')[0], 
        inscriptionEnd: edital.inscriptionEnd.split('T')[0], 
        analysisStart: edital.analysisStart.split('T')[0], 
        analysisEnd: edital.analysisEnd.split('T')[0],
        preliminaryResultDate: edital.preliminaryResultDate.split('T')[0],
        appealStartDate: edital.appealStartDate.split('T')[0],
        appealEndDate: edital.appealEndDate.split('T')[0],
        resultDate: edital.resultDate.split('T')[0],
        vacancyAcceptanceStartDate: edital.vacancyAcceptanceStartDate.split('T')[0],
        vacancyAcceptanceDate: edital.vacancyAcceptanceDate.split('T')[0],
        customRequirements: edital.customRequirements || [],
        additionalDocuments: edital.additionalDocuments || [],
        editalPdfUrl: edital.editalPdfUrl || '',
    } : {}),
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
  };
  
  const handleVacancyDetailChange = (id: string, field: keyof Omit<VacancyDetail, 'id'>, value: string | number) => {
    setFormData(prev => ({
        ...prev,
        vacancyDetails: prev.vacancyDetails.map(detail =>
            detail.id === id ? { ...detail, [field]: field === 'count' ? parseInt(String(value), 10) || 0 : value } : detail
        )
    }));
  };

  const handleAddVacancyDetail = () => {
    setFormData(prev => ({
        ...prev,
        vacancyDetails: [
            ...(prev.vacancyDetails || []),
            {
                id: `vd-${Date.now()}`,
                count: 10,
                type: VacancyType.AMPLA_CONCORRENCIA,
                shift: VacancyShift.MANHA,
            }
        ]
    }));
  };
  
  const handleRemoveVacancyDetail = (idToRemove: string) => {
    setFormData(prev => ({
        ...prev,
        vacancyDetails: (prev.vacancyDetails || []).filter(detail => detail.id !== idToRemove)
    }));
  };

  const handleAddRequirement = (type: 'checklist' | 'document') => {
      if (type === 'checklist' && newRequirement.trim()) {
          const requirement: CustomRequirement = { id: `cr-${Date.now()}`, label: newRequirement.trim() };
          setFormData(prev => ({ ...prev, customRequirements: [...(prev.customRequirements || []), requirement] }));
          setNewRequirement('');
      } else if (type === 'document' && newDocument.trim()) {
          const document: CustomRequirement = { id: `ad-${Date.now()}`, label: newDocument.trim() };
          setFormData(prev => ({ ...prev, additionalDocuments: [...(prev.additionalDocuments || []), document] }));
          setNewDocument('');
      }
  };

  const handleRemoveRequirement = (idToRemove: string, type: 'checklist' | 'document') => {
      if (type === 'checklist') {
          setFormData(prev => ({ ...prev, customRequirements: (prev.customRequirements || []).filter(req => req.id !== idToRemove) }));
      } else {
          setFormData(prev => ({ ...prev, additionalDocuments: (prev.additionalDocuments || []).filter(doc => doc.id !== idToRemove) }));
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Cast formData to EditalFormData before saving
    const { id, ...formDataToSave } = formData as Edital;
    await onSave(formDataToSave);
    setIsSaving(false);
  };
  
  const RequirementManager = ({ title, description, items, onAdd, onRemove, inputValue, onInputChange, placeholder, type }: {
    title: string;
    description: string;
    items: CustomRequirement[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    inputValue: string;
    onInputChange: (value: string) => void;
    placeholder: string;
    type: 'checklist' | 'document';
  }) => (
        <div className="space-y-2 pt-4 border-t dark:border-slate-700">
            <h3 className="text-lg font-medium text-cep-text dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 rounded-md bg-slate-50 dark:bg-slate-800/50 p-2 border dark:border-slate-700">
                {items.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">Nenhum item adicionado.</p>
                ) : items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 text-sm bg-white dark:bg-slate-700 rounded-md shadow-sm">
                        <span>{item.label}</span>
                        <button type="button" onClick={() => onRemove(item.id)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                            <IconTrash className="h-4 w-4 text-red-500"/>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex items-end gap-2 pt-2">
                <Input 
                    id={`new-${type}`}
                    name={`new-${type}`}
                    label={`Novo ${type === 'checklist' ? 'item de checklist' : 'documento'}`}
                    value={inputValue}
                    onChange={e => onInputChange(e.target.value)}
                    className="flex-grow"
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onAdd();
                        }
                    }}
                />
                <Button type="button" variant="secondary" onClick={onAdd}>Adicionar</Button>
            </div>
        </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={edital ? 'Editar Edital' : 'Novo Edital'} size="3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="number" name="number" label="Número do Edital" value={formData.number} onChange={handleChange} required />
        <Select id="modality" name="modality" label="Modalidade" value={formData.modality} onChange={handleChange}>
          {Object.values(EditalModalities).map(m => <option key={m} value={m}>{m}</option>)}
        </Select>
        <Input id="year" name="year" label="Ano" type="number" value={formData.year} onChange={handleChange} required />
        <Input id="editalPdfUrl" name="editalPdfUrl" label="URL do PDF do Edital" value={formData.editalPdfUrl || ''} onChange={handleChange} placeholder="https://..." />
        
        <div className="space-y-4 pt-4 border-t dark:border-slate-700">
            <h3 className="text-lg font-medium text-cep-text dark:text-white">Quadro de Vagas</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {formData.vacancyDetails.map((detail) => (
                    <div key={detail.id} className="grid grid-cols-10 gap-x-3 items-center p-3 border dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Qtd.</label>
                            <Input id={`count-${detail.id}`} name="count" label="" type="number" value={detail.count} onChange={e => handleVacancyDetailChange(detail.id, 'count', e.target.value)} required />
                        </div>
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Modalidade da Vaga</label>
                            <Select id={`type-${detail.id}`} name="type" label="" value={detail.type} onChange={e => handleVacancyDetailChange(detail.id, 'type', e.target.value as VacancyType)}>
                                {Object.values(VacancyType).map(vt => <option key={vt} value={vt}>{vt}</option>)}
                            </Select>
                        </div>
                        <div className="col-span-3">
                             <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Turno</label>
                            <Select id={`shift-${detail.id}`} name="shift" label="" value={detail.shift} onChange={e => handleVacancyDetailChange(detail.id, 'shift', e.target.value as VacancyShift)}>
                                {Object.values(VacancyShift).map(vs => <option key={vs} value={vs}>{vs}</option>)}
                            </Select>
                        </div>
                        <div className="col-span-1 self-end pb-1">
                            <Button type="button" variant="danger" onClick={() => handleRemoveVacancyDetail(detail.id)} className="p-2 h-auto w-full">
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <Button type="button" variant="secondary" onClick={handleAddVacancyDetail}>
                Adicionar Vaga
            </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
            <Input id="inscriptionStart" name="inscriptionStart" label="Início das Inscrições" type="date" value={formData.inscriptionStart} onChange={handleChange} required />
            <Input id="inscriptionEnd" name="inscriptionEnd" label="Fim das Inscrições" type="date" value={formData.inscriptionEnd} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input id="analysisStart" name="analysisStart" label="Início da Análise" type="date" value={formData.analysisStart} onChange={handleChange} required />
            <Input id="analysisEnd" name="analysisEnd" label="Fim da Análise" type="date" value={formData.analysisEnd} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-1 gap-4">
             <Input id="preliminaryResultDate" name="preliminaryResultDate" label="Data de Divulgação dos Resultados Preliminares" type="date" value={formData.preliminaryResultDate} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input id="appealStartDate" name="appealStartDate" label="Início do Período de Recursos" type="date" value={formData.appealStartDate} onChange={handleChange} required />
            <Input id="appealEndDate" name="appealEndDate" label="Fim do Período de Recursos" type="date" value={formData.appealEndDate} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-1 gap-4">
            <Input id="resultDate" name="resultDate" label="Data de Divulgação dos Resultados Finais" type="date" value={formData.resultDate} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input id="vacancyAcceptanceStartDate" name="vacancyAcceptanceStartDate" label="Início do Aceite da Vaga" type="date" value={formData.vacancyAcceptanceStartDate} onChange={handleChange} required />
            <Input id="vacancyAcceptanceDate" name="vacancyAcceptanceDate" label="Fim do Aceite da Vaga" type="date" value={formData.vacancyAcceptanceDate} onChange={handleChange} required />
        </div>
        
        <RequirementManager
            title="Documentos Adicionais"
            description="Adicione documentos que serão solicitados no formulário de inscrição (ex: 'Declaração de Vacinação')."
            items={formData.additionalDocuments || []}
            onAdd={() => handleAddRequirement('document')}
            onRemove={(id) => handleRemoveRequirement(id, 'document')}
            inputValue={newDocument}
            onInputChange={setNewDocument}
            placeholder="Digite o nome do documento"
            type="document"
        />

        <RequirementManager
            title="Itens de Checklist Adicionais"
            description="Adicione requisitos que não são documentos (ex: 'Candidato reside em Curitiba'). Eles aparecerão como um checklist para o analista."
            items={formData.customRequirements || []}
            onAdd={() => handleAddRequirement('checklist')}
            onRemove={(id) => handleRemoveRequirement(id, 'checklist')}
            inputValue={newRequirement}
            onInputChange={setNewRequirement}
            placeholder="Digite o texto do requisito"
            type="checklist"
        />

        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageEditais;