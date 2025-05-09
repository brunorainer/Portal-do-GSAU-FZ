
import React, { useState, useEffect } from "react";
import { Report } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Search, 
  Key, 
  AlertCircle, 
  Check, 
  Calendar, 
  Download, 
  FileUp, 
  ArrowRight,
  Loader2, 
  ExternalLink,
  AlertTriangle,
  Phone,
  Link2,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SendEmail } from "@/api/integrations";

export default function PacientePage() {
  const [accessKey, setAccessKey] = useState("");
  const [reports, setReports] = useState([]); // Array de laudos
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clinicInfo, setClinicInfo] = useState(null);
  const [keyFromUrl, setKeyFromUrl] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    fullName: '',
    saram: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  
  // Verificar se há uma chave na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chave = urlParams.get('chave');
    if (chave) {
      setAccessKey(chave);
      setKeyFromUrl(true);
      handleSearch(chave);
    }
  }, []);
  
  const loadClinicInfo = async () => {
    try {
      // Buscar o primeiro usuário admin
      const users = await User.list();
      const adminUser = users.find(user => user.role === 'admin');
      
      if (adminUser && (adminUser.clinic_name || adminUser.phone)) {
        setClinicInfo({
          name: adminUser.clinic_name,
          phone: adminUser.phone,
          logo_url: adminUser.logo_url
        });
      }
    } catch (error) {
      console.error("Erro ao carregar informações da clínica:", error);
    }
  };
  
  useEffect(() => {
    loadClinicInfo();
  }, []);
  
  const handleSearch = async (key = null) => {
    const searchKey = key || accessKey.trim();
    
    if (!searchKey) {
      setError("Por favor, insira uma chave de acesso");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const foundReports = await Report.filter({ access_key: searchKey });
      
      if (foundReports.length === 0) {
        setError("Nenhum laudo encontrado com esta chave de acesso");
        setReports([]);
        setShowRequestForm(true); // Mostrar formulário de solicitação
        return;
      }
      
      // Verifica se os laudos estão ativos e atualiza acessos
      const activeReports = [];
      for (const report of foundReports) {
        if (report.active) {
          // Atualiza o contador de acessos e a data do último acesso
          await Report.update(report.id, {
            accessed_at: new Date().toISOString(),
            access_count: (report.access_count || 0) + 1
          });
          
          activeReports.push({
            ...report,
            accessed_at: new Date().toISOString(),
            access_count: (report.access_count || 0) + 1
          });
        }
      }
      
      if (activeReports.length === 0) {
        setError("Este laudo não está mais disponível para acesso");
        setReports([]);
        return;
      }
      
      setReports(activeReports);
      
    } catch (error) {
      console.error("Erro ao buscar laudo:", error);
      setError("Ocorreu um erro ao buscar o laudo. Por favor, tente novamente.");
      setShowRequestForm(true); // Mostrar formulário de solicitação em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Enviar email de notificação com novo endereço
      await SendEmail({
        to: "brunorainer10@gmail.com",
        subject: "Nova Solicitação de Laudo no Portal",
        body: `ATENÇÃO! A PACIENTE ${requestForm.fullName.toUpperCase()}, SOLICITOU LAUDOS NO PORTAL, SEU EMAIL É ${requestForm.email.toUpperCase()}\n\nInformações adicionais:\nSARAM: ${requestForm.saram}`
      });

      setRequestSuccess(true);
      setShowRequestForm(false);

      // Limpar formulário
      setRequestForm({
        fullName: '',
        saram: '',
        email: ''
      });
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setError("Erro ao enviar solicitação. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAccessKeyChange = (e) => {
    // Converter para maiúsculas e limitar a 6 caracteres
    setAccessKey(e.target.value.toUpperCase().substring(0, 6));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Função aprimorada para obter a URL de visualização do Google
  const getGoogleViewerUrl = (fileUrl) => {
    // Verifica se é um link direto do Google Drive
    if (fileUrl && fileUrl.includes('drive.google.com')) {
      // Se já for uma URL de visualização, retorná-la diretamente
      if (fileUrl.includes('/preview')) {
        return fileUrl;
      }
      
      try {
        const url = new URL(fileUrl);
        let fileId;
        
        if (url.pathname.includes('/d/')) {
          fileId = url.pathname.split('/d/')[1].split('/')[0];
        } else if (url.pathname.includes('open')) {
          fileId = url.searchParams.get('id');
        } else {
          fileId = url.searchParams.get('id');
        }
        
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      } catch (error) {
        console.error("Erro ao processar URL do Drive:", error);
      }
    }
    
    // Para outros tipos de arquivo, usar o Google Docs Viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  const handleViewFile = (fileUrl) => {
    if (!fileUrl) {
      setError("URL do arquivo inválida.");
      return;
    }

    // Sempre usar a função aprimorada para visualização
    const viewerUrl = getGoogleViewerUrl(fileUrl);
    window.open(viewerUrl, '_blank');
  };
  
  const handleSidebarClick = (item) => {
    if (item.name === "Portal de Laudos") {
      // Limpar o estado e voltar para a tela inicial
      setReports([]);
      setAccessKey("");
      setKeyFromUrl(false);
      // Limpar a URL (remover parâmetros)
      window.history.pushState({}, '', '/paciente');
    } else if (item.url) {
      window.location.href = item.url;
    } else if (item.name !== "Portal de Laudos") {
      alert("Em breve!");
    }
    
    // Fechar o menu mobile após clicar
    setSidebarOpen(false);
  };

  // Itens do menu lateral atualizados
  const sidebarItems = [
    { name: "Portal de Laudos", icon: FileText, active: true },
    { name: "Guia deseda", icon: Calendar },
    { name: "Contatos", icon: Phone },
    { name: "Links Úteis", icon: Link2 },
    { name: "Sugestões", icon: MessageSquare }
  ];
  
  return (
    <div className="min-h-screen flex">
      {/* Barra lateral em desktop */}
      <aside className="hidden lg:block bg-blue-100 w-64 fixed h-full shadow-lg z-10">
        <div className="flex flex-col h-full">
          {/* Logo e título */}
          <div className="p-6 border-b">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f262b_gsau-fz.png" 
              alt="GSAU-FZ Logo" 
              className="h-32 w-auto mx-auto mb-4"
            />
            <h2 className="font-semibold text-xl text-gray-800 text-center">GSAU-FZ</h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              Grupo de Saúde Fortaleza
            </p>
          </div>
          
          {/* Menu de navegação */}
          <nav className="flex-1 bg-blue-50 py-6 px-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleSidebarClick(item)}
                className={`flex items-center w-full px-4 py-3 space-x-3 rounded-lg transition text-left ${
                  item.active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
              </button>
            ))}
          </nav>
          
          {/* Informações de contato */}
          <div className="bg-amber-50 p-4 m-4 rounded-lg border border-amber-200">
            <h3 className="font-medium text-amber-800 mb-2 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Central de Atendimento
            </h3>
            <div className="text-sm text-amber-700 space-y-1">
              <p>SAME - GSAU-FZ</p>
              <p>(85) 3216-3052</p>
              <p>(85) 3216-3051</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Menu lateral em mobile (slide out) */}
      <div className={`lg:hidden fixed inset-0 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className={`absolute top-0 left-0 w-64 h-full bg-blue-100 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo e título */}
            <div className="flex flex-col items-center py-6 bg-blue-100 border-b border-blue-200">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f262b_gsau-fz.png" 
                alt="GSAU-FZ Logo" 
                className="h-24 w-auto mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800">GSAU-FZ</h2>
              <p className="text-sm text-gray-600">Grupo de Saúde Fortaleza</p>
            </div>
            
            {/* Menu de navegação */}
            <nav className="flex-1 bg-blue-50 py-6 px-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSidebarClick(item)}
                  className={`flex items-center w-full px-4 py-3 space-x-3 rounded-lg transition ${
                    item.active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
            
            {/* Informações de contato */}
            <div className="bg-amber-50 p-4 m-4 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Central de Atendimento
              </h3>
              <div className="text-sm text-amber-700 space-y-1">
                <p>SAME - GSAU-FZ</p>
                <p>(85) 3216-3052</p>
                <p>(85) 3216-3051</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal e cabeçalho */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Cabeçalho */}
        <header className="bg-sky-700 text-white py-4 px-6 shadow-md flex items-center">
          <button 
            className="lg:hidden mr-4 text-white p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f262b_gsau-fz.png" 
              alt="GSAU-FZ Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-xl font-bold">Portal de Laudos - GSAU-FZ</h1>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-grow p-6 bg-slate-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Portal do Paciente</h2>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!reports.length > 0 && (
              <>
                <Card className="mb-8 shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Acesso ao Laudo</CardTitle>
                    <CardDescription>
                      Digite a chave de acesso fornecida
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Digite sua chave de acesso"
                            value={accessKey}
                            onChange={handleAccessKeyChange}
                            className="pl-10 text-center tracking-widest font-mono uppercase text-lg py-6"
                            maxLength={6}
                            autoFocus={!keyFromUrl}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 px-6"
                          disabled={isLoading || accessKey.length !== 6}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <ArrowRight className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="pt-4 text-center border-t">
                    <p className="text-sm text-gray-500 w-full">
                      A chave de acesso está na guia de Marcação do Exame. Caso não consiga acessar, ligue para a SAME do GSAU-FZ - (85) 3216-3052 ou 3216-3051
                    </p>
                  </CardFooter>
                </Card>

                {showRequestForm && (
                  <Card className="mb-8 shadow-lg border-0">
                    <CardHeader className="pb-4">
                      <CardTitle>Solicitar</CardTitle>
                      <div className="flex items-center mb-6">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/db793d_CapturadeTela2025-05-01as220509.png"
                          alt="Alerta"
                          className="w-16 h-16 mr-4"
                        />
                        <CardDescription className="text-3xl font-bold text-red-600">
                          Não encontrou seu laudo? Preencha seus dados abaixo para solicitar.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleRequestSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Nome Completo <span className="text-red-500">*</span></Label>
                          <Input
                            id="fullName"
                            value={requestForm.fullName}
                            onChange={(e) => setRequestForm({...requestForm, fullName: e.target.value})}
                            required
                            placeholder="Digite seu nome completo"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="saram">SARAM <span className="text-red-500">*</span></Label>
                          <Input
                            id="saram"
                            value={requestForm.saram}
                            onChange={(e) => setRequestForm({...requestForm, saram: e.target.value})}
                            required
                            placeholder="Digite seu SARAM"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            type="email"
                            value={requestForm.email}
                            onChange={(e) => setRequestForm({...requestForm, email: e.target.value})}
                            required
                            placeholder="Digite seu e-mail para contato"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando solicitação...
                            </>
                          ) : (
                            'Enviar Solicitação'
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {requestSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Solicitação enviada com sucesso! Em breve entraremos em contato através do e-mail fornecido.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {reports.length > 0 && (
              <Card className="mb-8 shadow-lg border-0">
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Laudos Encontrados ({reports.length})
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2">Informações do Paciente</h3>
                      <p className="text-blue-700 font-medium text-lg">
                        {reports[0].patient_name}
                      </p>
                      {reports[0].patient_id && (
                        <p className="text-blue-600 text-sm">
                          SARAM: {reports[0].patient_id}
                        </p>
                      )}
                    </div>
                  
                    {/* Lista de exames disponíveis */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Exames Disponíveis:</h3>
                      <div className="space-y-4">
                        {reports.map((report, index) => (
                          <div key={report.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                                  <h4 className="font-medium text-gray-900">
                                    {report.exam_type}
                                  </h4>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>
                                    {report.exam_date 
                                      ? format(new Date(report.exam_date), "dd/MM/yyyy", { locale: ptBR }) 
                                      : "Data não informada"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  onClick={() => handleViewFile(report.file_url)}
                                  className="bg-amber-500 hover:bg-amber-600"
                                  size="sm"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Button>
                                
                                <a 
                                  href={getGoogleViewerUrl(report.file_url)}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={`laudo_${report.patient_name.replace(/\s+/g, '_')}_${index+1}.pdf`}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-amber-800">Informações Importantes</h4>
                          <p className="text-amber-700 text-sm">
                            Visualize ou baixe seus laudos para consulta. Em caso de dúvidas, entre em contato com a clínica.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <div className="w-full text-center">
                    <p className="text-gray-500 text-sm">
                      Último acesso em: {format(new Date(reports[0].accessed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            )}

            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                Informações Importantes
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span>A chave de acesso é única e exclusiva para seu exame.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Por segurança, cada acesso ao laudo é registrado no sistema.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Recomendamos que você salve uma cópia do seu laudo em seu dispositivo.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span>Em caso de dúvidas, entre em contato com a clínica.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Buttons (visible only on mobile) */}
          <div className="lg:hidden grid grid-cols-2 gap-4 mt-8">
            {sidebarItems.map((item) => (
              <Button
                key={item.name}
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => handleSidebarClick({ name: item.name, url: item.url })}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </Button>
            ))}
          </div>
        </main>
        
        {/* Rodapé */}
        <footer className="bg-white py-4 shadow-inner border-t">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-bold text-white bg-sky-700 py-3 rounded-lg">Grupo de Saúde Fortaleza - GSAU-FZ</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
