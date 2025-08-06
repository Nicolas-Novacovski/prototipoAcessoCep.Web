import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { APP_TITLE } from '../constants';
import Input from '../components/ui/Input';

const Login = () => {
  const [cpf, setCpf] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(cpf)) {
      addToast('CPF inválido. Digite 11 números, sem pontos ou traços.', 'error');
      return;
    }
    try {
      await login(cpf);
      addToast('Login realizado com sucesso!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      addToast(message, 'error');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('https://www.cep.pr.gov.br/sites/cep/arquivos_restritos/files/imagem/2023-12/611bcadf08090-cep.jpg')" }}
    >
      <div className="absolute inset-0 bg-cep-header bg-opacity-60" />
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white shadow-lg">{APP_TITLE}</h1>
            <p className="text-slate-200 mt-2">Sistema Classificatório Unificado</p>
        </div>
        <Card className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
                <CardTitle>Acesso ao Sistema</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <Input
                            id="cpf"
                            label="CPF (somente números)"
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                            maxLength={11}
                            placeholder="Digite seu CPF"
                            required
                        />
                         <div className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
                            <p className='italic mb-1'>Acesso simulando a Central CELEPAR.</p>
                            <p><strong>Responsável:</strong> 44444444444</p>
                            <p><strong>Analista:</strong> 33333333333</p>
                            <p><strong>Admin CEP:</strong> 22222222222</p>
                        </div>
                    </div>
                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Entrar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;