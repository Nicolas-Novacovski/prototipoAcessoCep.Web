
import React, { useState, useEffect, useMemo } from 'react';
import { Application, Edital, ApplicationStatus, VacancyType, ValidationStatus } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import { IconAlertTriangle, IconShieldCheck } from '../../constants';

const RankingList = ({ title, applications, vacancyCount }: { title: string; applications: Application[]; vacancyCount: number; }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {vacancyCount} {vacancyCount === 1 ? 'vaga ofertada' : 'vagas ofertadas'}
                </p>
            </CardHeader>
            <CardContent>
                {applications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Candidato</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pontuação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {applications.map((app, index) => {
                                    const isClassified = index < vacancyCount;
                                    return (
                                        <tr key={app.id} className={isClassified ? 'bg-teal-50 dark:bg-teal-900/30' : ''}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{index + 1}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.student.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-cep-primary dark:text-cep-accent">{app.finalScore?.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum candidato classificado nesta modalidade.</p>
                )}
            </CardContent>
        </Card>
    );
};


const RankingView = () => {
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [editais, setEditais] = useState<Edital[]>([]);
    const [selectedEditalId, setSelectedEditalId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([api.getAllApplications(), api.getEditais()])
            .then(([apps, eds]) => {
                setAllApplications(apps);
                setEditais(eds.filter(e => e.isActive));
                if (eds.length > 0) {
                   const firstActiveEdital = eds.find(e => e.isActive);
                   if(firstActiveEdital) setSelectedEditalId(firstActiveEdital.id);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const { generalList, specialNeedsList, generalVacancyCount, specialVacancyCount } = useMemo(() => {
        if (!selectedEditalId) {
            return { generalList: [], specialNeedsList: [], generalVacancyCount: 0, specialVacancyCount: 0 };
        }

        const selectedEdital = editais.find(e => e.id === selectedEditalId);
        if (!selectedEdital) {
            return { generalList: [], specialNeedsList: [], generalVacancyCount: 0, specialVacancyCount: 0 };
        }
        
        const generalVacancyCount = selectedEdital.vacancyDetails.find(v => v.type === VacancyType.AMPLA_CONCORRENCIA)?.count || 0;
        const specialVacancyCount = selectedEdital.vacancyDetails.find(v => v.type === VacancyType.EDUCACAO_ESPECIAL)?.count || 0;

        const eligibleStatuses = [
            ApplicationStatus.ANALISE_CONCLUIDA,
            ApplicationStatus.CLASSIFICADO_PRELIMINAR,
            ApplicationStatus.CLASSIFICADO_FINAL,
            ApplicationStatus.VAGA_ACEITA,
        ];

        const approvedApps = allApplications.filter(app =>
            app.edital.id === selectedEditalId &&
            eligibleStatuses.includes(app.status) &&
            app.finalScore != null
        );

        const sortedApps = approvedApps.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
        
        const specialNeedsList = sortedApps.filter(app => {
            if (!app.specialNeeds || !app.specialNeedsDocument) return false;
            // Check the status of the laudo from the documents array
            const laudo = app.documents.find(d => d.id === app.specialNeedsDocument?.id);
            return laudo?.validationStatus === ValidationStatus.VALIDO;
        });
        
        // General list includes everyone who was approved, including special needs candidates
        // as they can also compete for general spots.
        const generalList = sortedApps;

        return { generalList, specialNeedsList, generalVacancyCount, specialVacancyCount };

    }, [selectedEditalId, allApplications, editais]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-cep-text dark:text-white">Classificação de Candidatos</h1>
                {editais.length > 0 && (
                    <Select
                        id="edital-select"
                        label=""
                        value={selectedEditalId}
                        onChange={(e) => setSelectedEditalId(e.target.value)}
                        className="min-w-[300px]"
                    >
                        {editais.map(edital => (
                            <option key={edital.id} value={edital.id}>
                                Edital {edital.number} - {edital.modality}
                            </option>
                        ))}
                    </Select>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : selectedEditalId ? (
                 <>
                    <Card className="bg-blue-50 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700/60">
                        <CardContent className="flex items-start md:items-center">
                             <IconShieldCheck className="h-8 w-8 text-blue-500 mr-4 flex-shrink-0" />
                             <div>
                                <CardTitle className="text-blue-800 dark:text-blue-200 text-lg">Regras de Classificação</CardTitle>
                                <ul className="text-blue-700 dark:text-blue-300 mt-1 text-sm list-disc list-inside space-y-1">
                                    <li>Candidatos de Educação Especial (com laudo válido) concorrem primeiramente às vagas reservadas.</li>
                                    <li>Todos os candidatos, incluindo os de Educação Especial, concorrem às vagas de Ampla Concorrência.</li>
                                    <li>Esta é uma visualização preliminar e pode ser alterada após o período de recursos.</li>
                                </ul>
                             </div>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <RankingList
                            title="Educação Especial"
                            applications={specialNeedsList}
                            vacancyCount={specialVacancyCount}
                        />
                        <RankingList
                            title="Ampla Concorrência"
                            applications={generalList}
                            vacancyCount={generalVacancyCount}
                        />
                    </div>
                </>
            ) : (
                <Card>
                    <CardContent className="text-center py-16">
                        <IconAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-cep-text dark:text-white">Nenhum edital ativo encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Não há editais ativos para exibir a classificação.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RankingView;
