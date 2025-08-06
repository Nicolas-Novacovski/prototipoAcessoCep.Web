
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-cep-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-cep-text dark:text-white">Página Não Encontrada</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Voltar ao Painel</Button>
      </Link>
    </div>
  );
};

export default NotFound;