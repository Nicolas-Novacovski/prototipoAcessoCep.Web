

import React, { useState, useEffect } from 'react';
import { EmailTemplate, Edital } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

const renderEmailHtmlForPreview = (plainText: string): string => {
    const bodyWithBreaks = plainText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, '<br />');

    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .wrapper { width: 100%; padding: 20px 0; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }
        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #0D2635; margin: 0; font-size: 24px; }
        .content { font-size: 16px; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Colégio Estadual do Paraná</h1>
            </div>
            <div class="content">
                ${bodyWithBreaks}
            </div>
            <div class="footer">
                <p>Este é um e-mail automático. Por favor, não responda.</p>
                <p>&copy; ${new Date().getFullYear()} Sistema Acesso CEP</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};


const ManageEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [selectedEditalId, setSelectedEditalId] = useState<string>('default');
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentBody, setCurrentBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getEmailTemplates(), api.getEditais()])
      .then(([templateData, editalData]) => {
        setTemplates(templateData);
        setEditais(editalData.filter(e => e.isActive));
        if (templateData.length > 0) {
          const uniqueNames = [...new Set(templateData.map(t => t.name))];
          setSelectedTemplateName(uniqueNames[0] || '');
        }
      }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTemplateName) {
      setCurrentSubject('');
      setCurrentBody('');
      return;
    }

    const editalIdForSearch = selectedEditalId === 'default' ? undefined : selectedEditalId;
    const specificTemplate = templates.find(t => t.name === selectedTemplateName && t.editalId === editalIdForSearch);

    if (specificTemplate) {
      setCurrentSubject(specificTemplate.subject);
      setCurrentBody(specificTemplate.body);
    } else {
      const defaultTemplate = templates.find(t => t.name === selectedTemplateName && !t.editalId);
      if (defaultTemplate) {
        setCurrentSubject(defaultTemplate.subject);
        setCurrentBody(defaultTemplate.body);
      } else {
        setCurrentSubject('');
        setCurrentBody('');
      }
    }
  }, [selectedTemplateName, selectedEditalId, templates]);

  const handleTemplateNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateName(e.target.value);
  };
  
  const handleEditalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEditalId(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedTemplateName) return;
    setIsSaving(true);
    try {
      const templateData: Omit<EmailTemplate, 'id'> = {
        name: selectedTemplateName,
        editalId: selectedEditalId === 'default' ? undefined : selectedEditalId,
        subject: currentSubject,
        body: currentBody,
      };

      await api.saveEmailTemplate(templateData);
      const updatedTemplates = await api.getEmailTemplates();
      setTemplates(updatedTemplates);
      
      addToast('Template salvo com sucesso!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao salvar o template.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const uniqueTemplateNames = [...new Set(templates.map(t => t.name))];
  const emailPreviewHtml = renderEmailHtmlForPreview(currentBody);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Gerenciar Templates de E-mail</h1>
      {isLoading ? <Spinner /> : (
        <Card>
          <CardHeader>
            <CardTitle>Editor de Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select id="template" label="Selecione o Template para Editar" value={selectedTemplateName} onChange={handleTemplateNameChange}>
                {uniqueTemplateNames.map(name => <option key={name} value={name}>{name}</option>)}
              </Select>
              <Select id="edital" label="Aplicar a um Edital Específico" value={selectedEditalId} onChange={handleEditalChange}>
                <option value="default">Padrão (para todos os editais)</option>
                {editais.map(e => <option key={e.id} value={e.id}>{e.number} - {e.modality}</option>)}
              </Select>
            </div>
            {selectedTemplateName && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-700">
                <div className="space-y-4">
                  <Input id="subject" label="Assunto do E-mail" value={currentSubject} onChange={e => setCurrentSubject(e.target.value)} />
                  <div>
                    <label htmlFor="body" className="block text-sm font-medium text-cep-text dark:text-slate-300">
                      Corpo do E-mail
                    </label>
                    <textarea
                      id="body"
                      rows={20}
                      className="mt-1 block w-full font-mono text-sm px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary"
                      value={currentBody}
                      onChange={e => setCurrentBody(e.target.value)}
                      placeholder="Escreva o conteúdo do e-mail aqui. Use quebras de linha para criar novos parágrafos."
                    />
                     <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Variáveis disponíveis: use <code>{`{{nomeDaVariavel}}`}</code> (ex: <code>{`{{studentName}}`}</code>, <code>{`{{protocol}}`}</code>).
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cep-text dark:text-slate-300">
                    Pré-visualização
                  </label>
                  <div className="mt-1 w-full h-[500px] border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden bg-white">
                    <iframe
                      srcDoc={emailPreviewHtml}
                      title="Pré-visualização do E-mail"
                      className="w-full h-full"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t dark:border-slate-700">
              <Button onClick={handleSave} isLoading={isSaving} disabled={!selectedTemplateName}>Salvar Template</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageEmailTemplates;