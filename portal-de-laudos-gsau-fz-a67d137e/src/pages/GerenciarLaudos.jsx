
import React, { useState, useEffect } from "react";
import { Report } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Search, 
  Eye, 
  AlertCircle, 
  Link2, 
  X, 
  Check, 
  Copy, 
  Calendar, 
  FileUp,
  Download,
  Loader2,
  ClipboardCopy,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import ReportDetails from "../components/reports/ReportDetails";

export default function GerenciarLaudos() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const reportList = await Report.list("-created_date");
      setReports(reportList);
      setFilteredReports(reportList);
    } catch (error) {
      console.error("Erro ao carregar laudos:", error);
      setError("Não foi possível carregar a lista de laudos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredReports(reports);
      return;
    }
    
    const searchTermLower = searchValue.toLowerCase();
    const filtered = reports.filter(report => 
      report.patient_name.toLowerCase().includes(searchTermLower) || 
      report.access_key.toLowerCase().includes(searchTermLower) ||
      report.exam_type.toLowerCase().includes(searchTermLower) ||
      (report.patient_id && report.patient_id.toLowerCase().includes(searchTermLower))
    );
    
    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [searchValue, reports]);

  const handleViewLaudo = (fileUrl) => {
    if (!fileUrl) {
      setError("URL do arquivo inválida.");
      return;
    }
    
    const fileUrls = Array.isArray(fileUrl) ? fileUrl : [fileUrl];

    fileUrls.forEach(url => {
      // Obter a URL de visualização adequada
      const viewerUrl = getGoogleViewerUrl(url);
      window.open(viewerUrl, '_blank');
    });
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsDialog(true);
  };

  const handleToggleStatus = async (report) => {
    setIsUpdating(true);
    try {
      await Report.update(report.id, { 
        active: !report.active 
      });
      
      // Atualiza o estado local
      const updatedReports = reports.map(r => 
        r.id === report.id ? { ...r, active: !r.active } : r
      );
      setReports(updatedReports);
      
      // Atualiza a lista filtrada também
      const updatedFiltered = filteredReports.map(r => 
        r.id === report.id ? { ...r, active: !r.active } : r
      );
      setFilteredReports(updatedFiltered);
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setError("Falha ao atualizar o status do laudo.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyAccessKey = (accessKey) => {
    navigator.clipboard.writeText(accessKey);
  };

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCopyAccessLink = (accessKey) => {
    const baseUrl = window.location.origin;
    const accessUrl = `${baseUrl}/paciente?chave=${accessKey}`;
    navigator.clipboard.writeText(accessUrl);
  };

  const handleUpdateReport = async () => {
    await loadReports(); // Recarregar a lista após atualização
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Gerenciar Laudos</h1>
          <p className="text-gray-500">Visualize, busque e gerencie todos os laudos cadastrados</p>
        </div>
        <Link to={createPageUrl("UploadLaudo")}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileUp className="mr-2 h-5 w-5" />
            Adicionar Novo Laudo
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6 shadow-md border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtrar Laudos</CardTitle>
          <CardDescription>
            Busque por nome do paciente, tipo de exame, chave de acesso ou identificador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar laudos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Total de resultados: {filteredReports.length}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium text-lg text-gray-700">
                {reports.length === 0 ? "Nenhum laudo cadastrado" : "Nenhum laudo encontrado"}
              </h3>
              <p className="text-gray-500 mb-6">
                {reports.length === 0 
                  ? "Adicione laudos para começar a gerenciar." 
                  : "Tente modificar os critérios de busca."}
              </p>
              {reports.length === 0 && (
                <Link to={createPageUrl("UploadLaudo")}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <FileUp className="mr-2 h-5 w-5" />
                    Adicionar Primeiro Laudo
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nome do Paciente</TableHead>
                    <TableHead>Tipo de Exame</TableHead>
                    <TableHead>Data do Exame</TableHead>
                    <TableHead>Chave de Acesso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acessado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((report) => (
                    <TableRow key={report.id} className="group hover:bg-gray-50">
                      <TableCell className="font-medium">{report.patient_name}</TableCell>
                      <TableCell>{report.exam_type}</TableCell>
                      <TableCell>
                        {report.exam_date 
                          ? format(new Date(report.exam_date), "dd/MM/yyyy") 
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-mono text-sm">{report.access_key}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCopyAccessKey(report.access_key)}
                          >
                            <Copy className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                            <Check className="h-3 w-3 mr-1" /> Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                            <X className="h-3 w-3 mr-1" /> Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.accessed_at ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                            <Eye className="h-3 w-3 mr-1" /> 
                            {format(new Date(report.accessed_at), "dd/MM/yyyy")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Não acessado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewLaudo(report.file_url)}
                            title="Visualizar Laudo"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewDetails(report)}
                            title="Editar Laudo e Informações"
                          >
                            <Settings className="h-4 w-4 text-purple-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyAccessLink(report.access_key)}
                            title="Copiar Link de Acesso"
                          >
                            <Link2 className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleStatus(report)}
                            disabled={isUpdating}
                            title={report.active ? "Desativar Laudo" : "Ativar Laudo"}
                          >
                            {report.active ? (
                              <X className="h-4 w-4 text-red-600" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                      let pageNumber;
                      
                      // Lógica para mostrar páginas próximas da atual
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }
                      
                      return (
                        <Button
                          key={index}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={currentPage === pageNumber ? "bg-blue-600" : ""}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Laudo</DialogTitle>
            <DialogDescription>
              Informações completas e opções de gerenciamento
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <ReportDetails 
              report={selectedReport} 
              onUpdate={handleUpdateReport}
            />
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
