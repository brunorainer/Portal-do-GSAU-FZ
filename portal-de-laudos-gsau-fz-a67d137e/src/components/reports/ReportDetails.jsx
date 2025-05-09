
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  User,
  FileText,
  Clock,
  Key,
  Check,
  X,
  Eye,
  FileUp,
  ClipboardCopy,
  Link as LinkIcon,
  Download,
  ExternalLink,
  AlertTriangle,
  Pencil,
  Copy,
  Save,
  Loader2,
  AlertCircle,
  Upload
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadFile } from "@/api/integrations";

const Report = {
  update: async (id, data) => {
    // Simulação de uma chamada de API para atualizar os dados
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Laudo com ID ${id} atualizado com os dados:`, data);
        resolve();
      }, 500);
    });
  }
};

export default function ReportDetails({ report, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editStatus, setEditStatus] = useState({ success: false, error: null });
  const [newFile, setNewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (report) {
      setEditData({
        patient_name: report.patient_name || '',
        patient_id: report.patient_id || '',
        exam_type: report.exam_type || '',
        exam_date: report.exam_date || '',
        file_url: report.file_url || '',
        access_key: report.access_key || ''
      });
    }
  }, [report]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditStatus({ success: false, error: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setEditStatus({ success: false, error: 'O arquivo deve ter no máximo 10MB' });
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setEditStatus({ success: false, error: 'Apenas arquivos PDF e Word são permitidos' });
        return;
      }
      setNewFile(file);
      setEditStatus({ success: false, error: null });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setIsUploading(true);
    setEditStatus({ success: false, error: null });

    try {
      let updatedData = { ...editData };

      // Se há um novo arquivo para upload
      if (newFile) {
        try {
          const { file_url } = await UploadFile({ file: newFile });
          updatedData.file_url = file_url;
        } catch (error) {
          throw new Error('Erro ao fazer upload do novo arquivo');
        }
      }

      await Report.update(report.id, updatedData);
      setEditStatus({ success: true, error: null });
      setIsEditing(false);
      setNewFile(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar laudo:', error);
      setEditStatus({ success: false, error: 'Erro ao salvar as alterações.' });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      patient_name: report.patient_name || '',
      patient_id: report.patient_id || '',
      exam_type: report.exam_type || '',
      exam_date: report.exam_date || '',
      file_url: report.file_url || '',
      access_key: report.access_key || ''
    });
    setEditStatus({ success: false, error: null });
  };

  const handleCopyAccessKey = () => {
    navigator.clipboard.writeText(report.access_key);
  };

  const handleCopyAccessLink = () => {
    const baseUrl = window.location.origin;
    const accessUrl = `${baseUrl}/paciente?chave=${report.access_key}`;
    navigator.clipboard.writeText(accessUrl);
  };

  const isWordFile = (url) => {
    return url && (
      url.toLowerCase().endsWith('.doc') ||
      url.toLowerCase().endsWith('.docx') ||
      url.includes('msword') ||
      url.includes('openxmlformats-officedocument.wordprocessingml.document')
    );
  };

  const isPdfFile = (url) => {
    return url && (
      url.toLowerCase().endsWith('.pdf') ||
      url.includes('application/pdf')
    );
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

  // Função para visualização de arquivos
  const handleViewFile = (fileUrl) => {
    if (!fileUrl) {
      alert("URL do arquivo inválida.");
      return;
    }

    // Usar a função aprimorada para visualização
    const viewerUrl = getGoogleViewerUrl(fileUrl);
    window.open(viewerUrl, '_blank');
  };

  const getDownloadUrl = (fileUrl) => {
    // Se for um arquivo do Google Drive
    if (fileUrl.includes('drive.google.com')) {
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
          // Download como PDF
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      } catch (error) {
        console.error("Erro ao processar URL do Drive:", error);
      }
    }

    // Se for um arquivo Word, usar Google Docs para converter para PDF
    if (isWordFile(fileUrl)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true&export=download`;
    }

    // Para outros arquivos, retornar a URL original
    return fileUrl;
  };

  if (!report || !editData) return null;

  return (
    <div className="space-y-6 py-4">
      {editStatus.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{editStatus.error}</AlertDescription>
        </Alert>
      )}

      {editStatus.success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Alterações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Informações do Laudo</h3>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="patient_name">Nome do Paciente</Label>
            {isEditing ? (
              <Input
                id="patient_name"
                name="patient_name"
                value={editData.patient_name}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-gray-900">{report.patient_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="patient_id">SARAM</Label>
            {isEditing ? (
              <Input
                id="patient_id"
                name="patient_id"
                value={editData.patient_id}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-gray-900">{report.patient_id || 'Não informado'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="exam_type">Tipo de Exame</Label>
            {isEditing ? (
              <Input
                id="exam_type"
                name="exam_type"
                value={editData.exam_type}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-gray-900">{report.exam_type}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="exam_date">Data do Exame</Label>
            {isEditing ? (
              <Input
                id="exam_date"
                name="exam_date"
                type="date"
                value={editData.exam_date}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-gray-900">
                {report.exam_date ? format(new Date(report.exam_date), "PPP", { locale: ptBR }) : 'Não informada'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="access_key">Chave de Acesso</Label>
            {isEditing ? (
              <Input
                id="access_key"
                name="access_key"
                value={editData.access_key}
                onChange={handleInputChange}
                className="mt-1"
                maxLength={6}
              />
            ) : (
              <div className="mt-1 flex items-center">
                <span className="font-mono text-gray-900">{report.access_key}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(report.access_key)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Arquivo do Laudo</Label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900 truncate max-w-xs">
                      {newFile ? newFile.name : report.file_url.split('/').pop()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Novo Arquivo
                  </Button>
                </div>

                {newFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">Novo arquivo selecionado</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewFile(null)}
                      >
                        <X className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {newFile.name} ({(newFile.size / 1024 / 1024).toFixed(2)}MB)
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Aceita arquivos PDF e Word até 10MB
                </p>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900 truncate max-w-xs">
                    {report.file_url.split('/').pop()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getGoogleViewerUrl(report.file_url), '_blank')}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                  <a
                    href={getGoogleViewerUrl(report.file_url)}
                    download={`laudo_${report.patient_name.replace(/\s+/g, '_')}.pdf`}
                    className="inline-flex items-center px-2 py-1 text-sm"
                  >
                    <Download className="h-4 w-4 text-gray-600" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {(isLoading || isUploading) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {newFile ? 'Enviando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      )}

      <div className="pt-6 border-t">
        <h4 className="font-medium text-gray-700 mb-3">Informações Adicionais</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-600">Data do Upload:</span>
            <p className="font-medium">
              {format(new Date(report.created_date), "PPP 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-600">Último Acesso:</span>
            <p className="font-medium">
              {report.accessed_at
                ? format(new Date(report.accessed_at), "PPP 'às' HH:mm", { locale: ptBR })
                : 'Nunca acessado'}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-600">Número de Acessos:</span>
            <p className="font-medium">{report.access_count || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-600">Status:</span>
            <p className="font-medium">
              {report.active ? (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  <Check className="h-3.5 w-3.5 mr-1" /> Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                  <X className="h-3.5 w-3.5 mr-1" /> Inativo
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
