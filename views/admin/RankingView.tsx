

import React, { useState, useEffect, useMemo } from 'react';
import { Application, Edital, ApplicationStatus, VacancyType } from '../../types';
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

    const rankingStatusInfo = useMemo(() => {
        if (!selectedEditalId) return null;
        const selectedEdital = editais.find(e => e.id === selectedEditalId);
        if (!selectedEdital) return null;

        const parseDate = (dateString: string) => {
            const [y, m, d] = dateString.split('-').map(Number);
            return new Date(y, m - 1, d);
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const preliminaryDate = parseDate(selectedEdital.preliminaryResultDate);
        const finalDate = parseDate(selectedEdital.resultDate);

        if (today < preliminaryDate) {
            return {
                status: 'UNAVAILABLE',
                title: 'Classificação Indisponível',
                message: `A classificação preliminar será divulgada em ${preliminaryDate.toLocaleDateString('pt-BR')}.`,
                config: {
                    bg: 'bg-slate-50 dark:bg-slate-800/40',
                    border: 'border-slate-300 dark:border-slate-700/60',
                    text: 'text-slate-700 dark:text-slate-300',
                    titleText: 'text-slate-800 dark:text-slate-200',
                    icon: <IconAlertTriangle className="h-8 w-8 text-slate-500 mr-4 flex-shrink-0" />
                }
            };
        } else if (today >= preliminaryDate && today < finalDate) {
            return {
                status: 'PRELIMINARY',
                title: 'Resultado Preliminar',
                message: `O resultado final será divulgado em ${finalDate.toLocaleDateString('pt-BR')}.`,
                config: {
                    bg: 'bg-yellow-50 dark:bg-yellow-900/40',
                    border: 'border-yellow-300 dark:border-yellow-700/60',
                    text: 'text-yellow-700 dark:text-yellow-300',
                    titleText: 'text-yellow-800 dark:text-yellow-200',
                    icon: <IconAlertTriangle className="h-8 w-8 text-yellow-500 mr-4 flex-shrink-0" />
                }
            };
        } else {
            return {
                status: 'FINAL',
                title: 'Resultado Definitivo',
                message: 'Este é o resultado definitivo do processo seletivo.',
                config: {
                    bg: 'bg-teal-50 dark:bg-teal-900/40',
                    border: 'border-teal-300 dark:border-teal-700/60',
                    text: 'text-teal-700 dark:text-teal-300',
                    titleText: 'text-teal-800 dark:text-teal-200',
                    icon: <IconShieldCheck className="h-8 w-8 text-teal-500 mr-4 flex-shrink-0" />
                }
            };
        }
    }, [selectedEditalId, editais]);

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
            return app.specialNeeds && app.commissionAnalysis?.isEligible === true;
        });
        
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
                    {rankingStatusInfo && (
                         <Card className={`${rankingStatusInfo.config.bg} ${rankingStatusInfo.config.border}`}>
                            <CardContent className="flex items-start md:items-center">
                                {rankingStatusInfo.config.icon}
                                <div>
                                    <CardTitle className={`${rankingStatusInfo.config.titleText} text-lg`}>{rankingStatusInfo.title}</CardTitle>
                                    <p className={`${rankingStatusInfo.config.text} mt-1 text-sm`}>{rankingStatusInfo.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {rankingStatusInfo?.status !== 'UNAVAILABLE' && (
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
                    )}
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