# Sistema de Acesso CEP

Uma plataforma unificada para gerenciar processos classificatórios para ingresso de novos estudantes no Colégio Estadual do Paraná (CEP). O sistema abrange múltiplos editais, desde a inscrição e análise curricular até a confirmação da vaga, incluindo análise documental, conversão de pareceres, classificação automática e gestão de recursos.

## ✨ Key Features

O sistema é projetado para atender às necessidades de diferentes perfis de usuário, cada um com um conjunto específico de funcionalidades.

### Para Responsáveis (Pais/Guardiões)
- **Inscrição Simplificada:** Um fluxo guiado para inscrever estudantes, seja da rede pública (via CGM) ou de escolas particulares.
- **Acompanhamento em Tempo Real:** Visualização do status da inscrição através de um stepper visual.
- **Gestão de Documentos:** Upload e correção de documentos pendentes.
- **Recursos e Confirmação:** Possibilidade de interpor recursos administrativos e aceitar a vaga em caso de classificação.

### Para Analistas
- **Painel de Análise:** Uma dashboard centralizada com todas as inscrições que requerem análise.
- **Validação de Documentos:** Ferramenta de visualização de PDFs lado a lado com os formulários de validação.
- **Análise Curricular:** Formulário para conversão de notas e pareceres.
- **Pareceres Automatizados:** Geração automática de justificativas com base nas ações de validação.

### Para Administradores (CEP & SEED)
- **Gestão de Editais:** Criação e gerenciamento completo dos editais, incluindo prazos, vagas e requisitos customizados.
- **Gerenciamento de Usuários:** Controle sobre os perfis de acesso ao sistema.
- **Monitoramento Geral:** Visão completa de todas as inscrições e seus status.
- **Geração de Relatórios:** Exportação de dados importantes em formato CSV.

## 🚀 Technology Stack

Este é um projeto puramente de frontend que utiliza uma arquitetura moderna **sem a necessidade de um passo de compilação (build)**. Ele carrega suas dependências como módulos ES diretamente no navegador, o que simplifica o desenvolvimento e a implantação.

- **React 19:** Para a construção da interface de usuário.
- **TypeScript:** Para tipagem estática e um código mais robusto (verificado pelo seu editor, mas não compilado separadamente).
- **React Router:** Para o roteamento do lado do cliente em uma Single Page Application (SPA).
- **Tailwind CSS:** Utilizado via CDN para estilização rápida e consistente.
- **pdfjs-dist:** Para a renderização e visualização de documentos PDF diretamente no navegador.
- **ESM Modules (via esm.sh):** As dependências são carregadas via `importmap` no `index.html`, eliminando a necessidade de `npm install` ou de ferramentas como Webpack/Vite.

## ⚙️ Running the Project

Como o projeto não requer um processo de build, a execução é muito simples.

1.  **Clone o repositório:**
    ```bash
    git clone <repository_url>
    ```

2.  **Inicie um servidor local:**
    Você pode usar qualquer servidor estático. Uma opção simples é o `live-server` do Node.js, que pode ser executado com `npx`.

    ```bash
    npx live-server
    ```

    Isso iniciará um servidor local e abrirá o `index.html` no seu navegador. O aplicativo estará pronto para uso.

## ☁️ Deployment (Vercel)

Este projeto está pronto para ser implantado na Vercel. A configuração necessária para uma SPA (Single Page Application) está definida no arquivo `vercel.json`. Basta conectar seu repositório Git à Vercel e usar as seguintes configurações:

- **Framework Preset:** `Other`
- **Build Command:** (deixe em branco)
- **Output Directory:** (deixe em branco)
- **Install Command:** (deixe em branco)

A Vercel fará o deploy automático dos arquivos estáticos.