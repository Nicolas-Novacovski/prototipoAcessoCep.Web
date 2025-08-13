

import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, PermissionKey } from '../../types';
import { APP_TITLE, IconLayoutDashboard, IconFileText, IconUserCheck, IconSettings, IconUsers, IconBarChart, IconLogOut, IconPlusCircle, IconTrendingUp, IconMail, IconShieldCheck, IconListDetails } from '../../constants';

const adminNavLinksConfig: { key: PermissionKey; to: string; icon: React.ReactNode; label: string; }[] = [
    { key: 'manage_editais', to: '/admin/editais', icon: <IconFileText className="h-5 w-5" />, label: 'Gerenciar Editais' },
    { key: 'manage_chamadas', to: '/admin/chamadas', icon: <IconPlusCircle className="h-5 w-5" />, label: 'Chamadas Comp.' },
    { key: 'manage_analises', to: '/admin/analises', icon: <IconUserCheck className="h-5 w-5" />, label: 'Acompanhar Análises' },
    { key: 'manage_casos_especiais', to: '/admin/casos-especiais', icon: <IconShieldCheck className="h-5 w-5" />, label: 'Análise Especial' },
    { key: 'view_classificacao', to: '/classificacao', icon: <IconTrendingUp className="h-5 w-5" />, label: 'Classificação' },
    { key: 'manage_usuarios', to: '/admin/usuarios', icon: <IconUsers className="h-5 w-5" />, label: 'Gerenciar Usuários' },
    { key: 'view_relatorios', to: '/admin/relatorios', icon: <IconBarChart className="h-5 w-5" />, label: 'Relatórios' },
    { key: 'manage_email_templates', to: '/admin/email-templates', icon: <IconMail className="h-5 w-5" />, label: 'Templates de E-mail' },
    { key: 'view_audit_logs', to: '/admin/logs', icon: <IconListDetails className="h-5 w-5" />, label: 'Logs de Auditoria' },
    { key: 'manage_config', to: '/admin/config', icon: <IconSettings className="h-5 w-5" />, label: 'Configurações' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 50);
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch(user.role) {
      case UserRole.RESPONSAVEL:
        return [
          { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Minhas Inscrições' },
        ];
      case UserRole.ANALISTA:
        return [
          { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Meu Painel' },
          { to: '/analise', icon: <IconUserCheck className="h-5 w-5" />, label: 'Fila de Análise' },
          { to: '/classificacao', icon: <IconTrendingUp className="h-5 w-5" />, label: 'Classificação' },
          { to: '/analise/relatorios', icon: <IconBarChart className="h-5 w-5" />, label: 'Meus Relatórios' },
        ];
      case UserRole.ADMIN_CEP:
      case UserRole.ADMIN_SEED:
        const adminLinks: { to: string; icon: React.ReactNode; label: string; }[] = [
          { to: '/dashboard', icon: <IconLayoutDashboard className="h-5 w-5" />, label: 'Painel Geral' },
        ];
        
        if (user.permissions) {
            adminNavLinksConfig.forEach(linkConfig => {
                if (user.permissions![linkConfig.key]) {
                    const { key, ...navLink } = linkConfig;
                    adminLinks.push(navLink);
                }
            });
        }
        return adminLinks;
      default:
        return [];
    }
  };

  const links = getNavLinks();

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
            end={link.to === '/dashboard' || link.to === '/analise'}
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