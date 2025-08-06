
import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { APP_TITLE, IconLayoutDashboard, IconFileText, IconUserCheck, IconSettings, IconUsers, IconBarChart, IconLogOut } from '../../constants';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Navigate home first to allow the route change to process.
    // Then, clear the auth state in a timeout. This prevents the
    // ProtectedRoute from re-rendering on the old page and
    // redirecting to /login before the navigation to '/' completes.
    navigate('/');
    setTimeout(() => {
      logout();
    }, 50);
  };

  const navLinks = {
    [UserRole.RESPONSAVEL]: [
      { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Minhas Inscrições' },
    ],
    [UserRole.ANALISTA]: [
      { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Painel de Análise' },
    ],
    [UserRole.ADMIN_CEP]: [
      { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Painel Geral' },
      { to: '/admin/editais', icon: <IconFileText className="h-5 w-5" />, label: 'Gerenciar Editais' },
      { to: '/admin/analises', icon: <IconUserCheck className="h-5 w-5" />, label: 'Acompanhar Análises' },
      { to: '/admin/usuarios', icon: <IconUsers className="h-5 w-5" />, label: 'Gerenciar Usuários' },
      { to: '/admin/relatorios', icon: <IconBarChart className="h-5 w-5" />, label: 'Relatórios' },
    ],
     [UserRole.ADMIN_SEED]: [
      { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Painel Geral' },
      { to: '/admin/editais', icon: <IconFileText className="h-5 w-5" />, label: 'Gerenciar Editais' },
      { to: '/admin/usuarios', icon: <IconUsers className="h-5 w-5" />, label: 'Gerenciar Usuários' },
      { to: '/admin/config', icon: <IconSettings className="h-5 w-5" />, label: 'Configurações' },
    ],
  };

  const links = user ? navLinks[user.role] : [];

  return (
    <aside className="w-64 h-full flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 text-cep-text dark:text-slate-300 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-cep-primary">{APP_TITLE}</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-cep-primary/10 text-cep-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`
            }
          >
            {link.icon}
            <span className="ml-3">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <IconLogOut className="h-5 w-5" />
            <span className="ml-3">Sair</span>
          </button>
      </div>
    </aside>
  );
};

const Header = () => {
    const { user } = useAuth();
    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-end px-6">
            <div className="text-right">
                <p className="font-semibold text-cep-text dark:text-white">{user?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.role}</p>
            </div>
        </header>
    )
}

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-cep-bg dark:bg-slate-900">
      <div className="w-64 flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full">
        <div className="sticky top-0 z-10">
          <Header />
        </div>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
