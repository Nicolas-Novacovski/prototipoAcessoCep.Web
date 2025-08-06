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

Este é um projeto puramente de frontend, utilizando tecnologias modernas para criar uma experiência de usuário rica e interativa sem a necessidade de um backend dedicado (os dados são mockados).

- **React 19:** Para a construção da interface de usuário.
- **TypeScript:** Para tipagem estática e um código mais robusto.
- **React Router:** Para o roteamento do lado do cliente em uma Single Page Application (SPA).
- **Tailwind CSS:** Para a estilização rápida e consistente.
- **pdfjs-dist:** Para a renderização e visualização de documentos PDF diretamente no navegador.
- **ESM Modules (via esm.sh):** O projeto carrega suas dependências diretamente no navegador, eliminando a necessidade de um passo de build local.

## ⚙️ Running the Project

Como o projeto utiliza import maps e carrega módulos ES via CDN (`esm.sh`), não há necessidade de `npm install` ou de um processo de build complexo como Webpack ou Vite.

1.  **Clone o repositório:**
    ```bash
    git clone <repository_url>
    ```

2.  **Inicie um servidor local:**
    Você pode usar qualquer servidor estático. Uma opção simples é o `live-server`, que pode ser executado com o `npx`.

    ```bash
    npx live-server
    ```

    Isso iniciará um servidor local e abrirá o `index.html` no seu navegador. O aplicativo estará pronto para uso.

## ☁️ Deployment (Vercel)

Este projeto está pronto para ser implantado na Vercel. A configuração necessária para uma SPA (Single Page Application) está definida no arquivo `vercel.json`. Basta conectar seu repositório Git à Vercel para fazer o deploy automático.
