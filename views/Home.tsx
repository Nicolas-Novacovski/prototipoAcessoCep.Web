



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/mockApi';
import { Edital, ComplementaryCall } from '../types';
import Spinner from '../components/ui/Spinner';
import { IconChevronDown, IconBuilding, IconSun, IconUserCircle, IconArrowRight, IconMoon, IconFileText } from '../constants';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/ui/Modal';

const FaqItem = ({ question, children }: { question: string, children: React.ReactNode }) => (
    <details className="p-4 rounded-lg bg-slate-50 border border-slate-200 group transition-all duration-300 dark:bg-slate-800/50 dark:border-slate-700">
        <summary className="flex items-center justify-between cursor-pointer font-medium text-cep-text dark:text-slate-200">
            {question}
            <IconChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="mt-4 text-slate-600 text-sm dark:text-slate-400">
            {children}
        </div>
    </details>
);

const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
                horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutos: Math.floor((difference / 1000 / 60) % 60),
                segundos: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.keys(timeLeft).map(interval => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
            return null;
        }

        return (
            <div key={interval} className="flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm p-3 rounded-lg w-20 h-20">
                <span className="text-3xl font-bold text-white">{String(timeLeft[interval]).padStart(2, '0')}</span>
                <span className="text-xs uppercase text-slate-300">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex space-x-2 md:space-x-4">
            {timerComponents.length ? timerComponents : <span className="text-white">Inscrições encerradas.</span>}
        </div>
    );
};


const Home = () => {
    const [editais, setEditais] = useState<Edital[]>([]);
    const [complementaryCalls, setComplementaryCalls] = useState<ComplementaryCall[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [openEdital, setOpenEdital] = useState<Edital | null>(null);
    const { theme, toggleTheme } = useTheme();

    const [isCallsModalOpen, setIsCallsModalOpen] = useState(false);
    const [selectedEditalCalls, setSelectedEditalCalls] = useState<ComplementaryCall[]>([]);

    useEffect(() => {
        Promise.all([api.getEditais(), api.getComplementaryCalls()])
            .then(([editalData, callData]) => {
                const activeEditais = editalData.filter(e => e.isActive);
                setEditais(activeEditais);
                setComplementaryCalls(callData);
                const currentlyOpen = activeEditais.find(edital => {
                    const now = new Date();
                    const start = new Date(edital.inscriptionStart);
                    const end = new Date(edital.inscriptionEnd);
                    return now >= start && now <= end;
                });
                setOpenEdital(currentlyOpen || null);
            })
            .finally(() => setIsLoading(false));
    }, []);
    
    const isEditalOpen = (edital: Edital) => {
        return openEdital?.id === edital.id;
    };

    const handleScrollToEditais = () => {
        const editaisSection = document.getElementById('editais');
        if (editaisSection) {
            editaisSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    const openCallsModal = (calls: ComplementaryCall[]) => {
        setSelectedEditalCalls(calls);
        setIsCallsModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-slate-900 text-cep-text dark:text-slate-300 min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative h-screen flex flex-col items-center justify-center text-center text-white">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-bottom bg-fixed"
                        style={{ backgroundImage: `url('https://www.cep.pr.gov.br/sites/cep/arquivos_restritos/files/imagem/2023-12/611bcadf08090-cep.jpg')` }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-cep-header/70" />

                    {/* Header */}
                    <header className="absolute top-0 left-0 right-0 z-20 p-4">
                         <div className="container mx-auto flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xl font-bold text-white">
                                <IconBuilding className="h-6 w-6"/>
                                ACESSO CEP
                            </div>
                            <div className="flex items-center gap-4 text-white">
                               <button onClick={toggleTheme} title="Mudar tema" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  {theme === 'light' ? <IconMoon className="h-5 w-5"/> : <IconSun className="h-5 w-5"/>}
                               </button>
                               <button onClick={() => navigate('/login')} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  ACESSO
                                  <IconUserCircle className="h-5 w-5"/>
                               </button>
                            </div>
                        </div>
                    </header>

                    {/* Hero Content */}
                    <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight">
                            Venha estudar no <br/><span className="text-cep-accent">Maior Colégio</span> do Paraná
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-3xl mx-auto">
                            Junte-se à comunidade do Colégio Estadual do Paraná. Inscrições abertas por tempo limitado.
                        </p>
                        <button 
                          onClick={handleScrollToEditais} 
                          className="mt-8 inline-flex items-center gap-3 bg-cep-accent text-cep-header font-bold py-3 px-8 rounded-lg hover:bg-cep-accent/90 transition-colors text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cep-header focus:ring-cep-accent"
                        >
                           INSCREVA-SE AGORA
                           <IconArrowRight className="h-5 w-5" />
                        </button>
                         {openEdital && (
                            <div className="mt-12">
                                <CountdownTimer endDate={openEdital.inscriptionEnd} />
                            </div>
                         )}
                    </div>
                    
                    {/* Scroll Down Indicator */}
                    <div className="absolute bottom-10 z-10">
                         <button onClick={handleScrollToEditais} aria-label="Rolar para baixo" className="animate-bounce p-2">
                            <IconChevronDown className="h-8 w-8" />
                         </button>
                    </div>
                </section>
                
                <section id="editais" className="py-20 bg-white dark:bg-cep-header">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-cep-text dark:text-white">Consulte os Editais</h2>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">Informações detalhadas sobre os processos seletivos abertos e futuros.</p>
                        </div>
                        {isLoading ? <Spinner /> : (
                            editais.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {editais.map(edital => {
                                        const isOpen = isEditalOpen(edital);
                                        const now = new Date();
                                        const activeCalls = complementaryCalls.filter(c => 
                                            c.editalId === edital.id && 
                                            now >= new Date(c.startDate)
                                        );
                                        return (
                                            <div key={edital.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col transition-transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-cep-primary dark:text-cep-accent">{edital.modality}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        isOpen 
                                                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-200 dark:text-teal-900' 
                                                        : 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-300'
                                                    }`}>
                                                        {isOpen ? 'Aberto' : 'Fechado'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-semibold mt-2 text-cep-text dark:text-white">Edital {edital.number}</h3>
                                                <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 space-y-2 flex-grow">
                                                    <p><span className="font-semibold text-slate-800 dark:text-slate-100">Vagas:</span> {edital.vacancyDetails.reduce((sum, v) => sum + v.count, 0)}</p>
                                                    <p><span className="font-semibold text-slate-800 dark:text-slate-100">Inscrições:</span> {new Date(edital.inscriptionStart).toLocaleDateString('pt-BR')} a {new Date(edital.inscriptionEnd).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                                <div className="mt-6">
                                                    {activeCalls.length > 0 ? (
                                                        <button 
                                                            onClick={() => openCallsModal(activeCalls)}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors"
                                                        >
                                                            Ver Chamadas Complementares
                                                        </button>
                                                    ) : isOpen ? (
                                                         <button onClick={() => navigate('/login')} className="w-full bg-cep-primary hover:bg-cep-secondary text-white py-2 rounded-lg font-bold transition-colors">
                                                            Inscrever-se
                                                         </button>
                                                    ) : (
                                                        <button className="w-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 py-2 rounded-lg font-bold cursor-not-allowed" disabled>
                                                            Ver detalhes
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                             ) : (
                                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <IconFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"/>
                                    <h3 className="mt-4 text-lg font-medium text-cep-text dark:text-white">Nenhum edital aberto no momento</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Por favor, volte mais tarde para verificar novas oportunidades.</p>
                                </div>
                            )
                        )}
                    </div>
                </section>

                <section className="py-20 bg-slate-100 dark:bg-slate-800/50">
                     <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-cep-text dark:text-white">Perguntas Frequentes</h2>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">Tire suas dúvidas sobre o processo de inscrição e seleção.</p>
                        </div>
                        <div className="space-y-4">
                            <FaqItem question="QUAIS SÃO OS PRAZOS DE INSCRIÇÃO?">
                                <p>Os prazos de inscrição variam para cada edital. Consulte a seção "Consulte os Editais" acima para ver as datas específicas de cada processo seletivo. É fundamental ficar atento ao período de inscrição, pois não são aceitas inscrições fora do prazo.</p>
                            </FaqItem>
                            <FaqItem question="QUAIS DOCUMENTOS SÃO NECESSÁRIOS?">
                                <p>A lista de documentos obrigatórios está definida em cada edital. Geralmente, inclui histórico escolar, comprovante de residência, documentos de identidade do aluno e do responsável. Para vagas de educação especial, é necessário um laudo médico.</p>
                            </FaqItem>
                            <FaqItem question="COMO FUNCIONA A SELEÇÃO POR COTAS?">
                                <p>O Colégio Estadual do Paraná segue as diretrizes da legislação vigente para a reserva de vagas. A política de cotas é detalhada no texto de cada edital, especificando os percentuais e os documentos comprobatórios necessários para cada modalidade de cota.</p>
                            </FaqItem>
                             <FaqItem question="POSSO EDITAR MINHA INSCRIção APÓS FINALIZAÇÃO?">
                                <p>Durante o período em que as inscrições estiverem abertas, você pode acessar o sistema com seu login e senha para editar suas informações. Após o encerramento do prazo de inscrição, não é mais possível realizar alterações.</p>
                            </FaqItem>
                        </div>
                     </div>
                </section>
            </main>

            <footer className="bg-white dark:bg-cep-header border-t border-slate-200 dark:border-slate-800 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} COLÉGIO ESTADUAL DO PARANÁ. TODOS OS DIREITOS RESERVADOS.
                    <p>Desenvolvido para o Futuro da Educação.</p>
                </div>
            </footer>
            
            <Modal
                isOpen={isCallsModalOpen}
                onClose={() => setIsCallsModalOpen(false)}
                title="Chamadas Complementares Disponíveis"
                size="lg"
            >
                <div className="space-y-3">
                    {selectedEditalCalls.map(call => (
                        <div key={call.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <IconFileText className="h-5 w-5 mr-3 text-cep-primary flex-shrink-0"/>
                                <span className="font-medium text-cep-text dark:text-slate-200 truncate" title={call.title}>
                                    {call.title}
                                </span>
                            </div>
                            <button 
                                onClick={() => window.open(call.pdfUrl, '_blank')}
                                className="bg-cep-secondary hover:bg-cep-primary text-white text-sm font-bold py-1 px-4 rounded-md transition-colors flex-shrink-0"
                            >
                                Abrir PDF
                            </button>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}

export default Home;