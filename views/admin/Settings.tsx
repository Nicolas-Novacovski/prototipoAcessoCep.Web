
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Configurações do Sistema</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações Globais (SEED)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Esta área é reservada para configurações avançadas do sistema, gerenciadas apenas pelo administrador técnico (SEED).
          </p>
          <div className="mt-6 space-y-4">
            {/* Placeholder for future settings */}
            <div className="p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-cep-text dark:text-white">Integração SERE</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Parâmetros de conexão com o sistema SERE.</p>
            </div>
             <div className="p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-cep-text dark:text-white">Parâmetros de Segurança</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configurações de autenticação e políticas de senha.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;