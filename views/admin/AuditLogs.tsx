
import React, { useState, useEffect, useMemo } from 'react';
import { LogEntry, User } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const AuditLogs = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter states
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        Promise.all([api.getLogs(), api.getUsers()])
            .then(([logData, userData]) => {
                setLogs(logData);
                setUsers(userData);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const uniqueActions = useMemo(() => [...new Set(logs.map(log => log.action))].sort(), [logs]);

    const filteredLogs = useMemo(() => {
        let currentLogs = [...logs];

        if (selectedUserId !== 'all') {
            currentLogs = currentLogs.filter(log =>
                log.actorId === selectedUserId ||
                (log.action === 'SEND_EMAIL' && log.targetId === selectedUserId)
            );
        }
        
        if (selectedAction !== 'all') {
            currentLogs = currentLogs.filter(log => log.action === selectedAction);
        }

        if (startDate) {
            // Using setUTCHours to avoid timezone issues when comparing a date string with a datetime string
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            currentLogs = currentLogs.filter(log => new Date(log.timestamp) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            currentLogs = currentLogs.filter(log => new Date(log.timestamp) <= end);
        }

        if (searchText.trim()) {
            const lowercasedText = searchText.toLowerCase();
            currentLogs = currentLogs.filter(log =>
                log.actorName.toLowerCase().includes(lowercasedText) ||
                log.action.toLowerCase().replace(/_/g, ' ').includes(lowercasedText) ||
                log.details.toLowerCase().includes(lowercasedText) ||
                (log.targetId && log.targetId.toLowerCase().includes(lowercasedText))
            );
        }

        return currentLogs;
    }, [selectedUserId, selectedAction, startDate, endDate, searchText, logs]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-cep-text dark:text-white">Logs de Auditoria</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Filtros de Pesquisa</CardTitle>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
                        <Input
                            id="search-filter"
                            label="Busca Livre"
                            type="text"
                            placeholder="Buscar em detalhes, ação, autor..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="md:col-span-2"
                        />
                        <Select
                            id="user-filter"
                            label="Filtrar por Usuário"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="all">Todos os Usuários</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </Select>
                        <Select
                            id="action-filter"
                            label="Filtrar por Tipo de Ação"
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                        >
                            <option value="all">Todas as Ações</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                            ))}
                        </Select>
                        <Input
                            id="start-date-filter"
                            label="Data Inicial"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                            id="end-date-filter"
                            label="Data Final"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data/Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Autor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ação</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Detalhes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">
                                                {log.actorName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{log.action}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                                                {log.details}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                                Nenhum log encontrado para os filtros aplicados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuditLogs;
