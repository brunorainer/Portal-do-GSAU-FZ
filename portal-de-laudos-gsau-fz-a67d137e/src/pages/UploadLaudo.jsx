
import React, { useState, useRef } from "react";
import { Report } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileUp, 
  Calendar, 
  User, 
  AlertCircle, 
  Loader2, 
  Check, 
  X, 
  Copy, 
  CheckCircle2,
  FilePlus,
  RefreshCw,
  FileText,
  Link2,
  Cloud,
  Plus,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { InvokeLLM } from "@/api/integrations";

// Função para gerar chave de acesso no formato solicitado (3 letras + 3 números em ordem aleatória)
function gerarChaveAcesso() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluindo letras que podem confundir (I, O)
  const numeros = '23456789'; // Excluindo números que podem confundir (0, 1)
  
  // Gerar 3 letras aleatórias
  let chaveLetras = '';
  for (let i = 0; i < 3; i++) {
    const indiceLetra = Math.floor(Math.random() * letras.length);
    chaveLetras += letras.charAt(indiceLetra);
  }
  
  // Gerar 3 números aleatórios
  let chaveNumeros = '';
  for (let i = 0; i < 3; i++) {
    const indiceNumero = Math.floor(Math.random() * numeros.length);
    chaveNumeros += numeros.charAt(indiceNumero);
  }
  
  // Combinar caracteres e embaralhar
  const chaveCompleta = (chaveLetras + chaveNumeros).split('');
  for (let i = chaveCompleta.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chaveCompleta[i], chaveCompleta[j]] = [chaveCompleta[j], chaveCompleta[i]];
  }
  
  return chaveCompleta.join('');
}

const EXAM_TYPES = [
  "Ultrassom Abdominal Total",
  "Ultrassom de Rins e Vias Urinárias",
  "Ultrassom de MSK",
  "Ultrassom de Mamas e Axilas",
  "Ultrassom Pélvica",
  "Ultrassom de Partes Moles",
  "Ultrassom Doppler",
  "Ultrassom Cervical/Tireoide",
  "Outro"
];

export default function UploadLaudo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_id: '',
    exam_types: [], // Agora é um array para múltiplos tipos
    other_exam_type: '',
    exam_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [files, setFiles] = useState([]); // Agora é um array de arquivos
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedReport, setUploadedReport] = useState(null);
  const [customAccessKey, setCustomAccessKey] = useState(gerarChaveAcesso());
  const fileInputRef = useRef(null);

  const [uploadType, setUploadType] = useState('file'); // 'file' ou 'drive'
  const [driveLink, setDriveLink] = useState('');
  const [driveLinks, setDriveLinks] = useState([]); // Array para múltiplos links
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [driveAuthToken, setDriveAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDriveFileFromLink = (link) => {
    try {
      const url = new URL(link);
      if (url.hostname === 'drive.google.com') {
        let fileId;
        
        if (url.pathname.includes('/d/')) {
          fileId = url.pathname.split('/d/')[1].split('/')[0];
        } else if (url.pathname.includes('open')) {
          fileId = url.searchParams.get('id');
        } else {
          fileId = url.searchParams.get('id');
        }
        
        if (fileId) {
          // Retornar o ID do arquivo para acessar via Google Drive
          return {
            viewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
            fileId
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao processar URL do Drive:", error);
      return null;
    }
  };

  // Função para inicializar o Google Drive Picker
  const initGoogleDrivePicker = async () => {
    setIsLoading(true);
    
    try {
      // Usar a integração para obter um token temporário (simulação)
      const result = await InvokeLLM({
        prompt: "Gere um ID de sessão único para acessar o Google Drive com a conta rxesfz@gmail.com. Formato: apenas uma string aleatória de 20 caracteres.",
        response_json_schema: {
          type: "object",
          properties: {
            session_id: { type: "string" }
          }
        }
      });
      
      if (result && result.session_id) {
        setDriveAuthToken(result.session_id);
        
        // Aqui normalmente iniciaria o Google Picker
        // Como não temos acesso direto à API, simulamos o comportamento
        setIsPickerOpen(true);
        
        // Mostrar um alerta com instruções
        alert("Por favor, faça login com a conta rxesfz@gmail.com no Google Drive em uma nova aba e cole os links dos arquivos aqui.");
        
        // Abrir o Google Drive em uma nova aba
        window.open("https://drive.google.com", "_blank");
      }
    } catch (error) {
      console.error("Erro ao inicializar o seletor de arquivos:", error);
      setError("Não foi possível acessar o Google Drive. Por favor, tente novamente ou acesse manualmente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDriveLink = () => {
    if (driveLink) {
      const fileInfo = getDriveFileFromLink(driveLink);
      if (fileInfo) {
        setDriveLinks([...driveLinks, { url: driveLink, ...fileInfo }]);
        setDriveLink(''); // Limpar input após adicionar
      } else {
        setError('Link do Google Drive inválido.');
      }
    }
  };

  const removeDriveLink = (index) => {
    setDriveLinks(driveLinks.filter((_, i) => i !== index));
  };

  const handleDriveSubmit = async (e) => {
    e.preventDefault();
    
    if (driveLinks.length === 0) {
      setError('Por favor, adicione pelo menos um arquivo do Google Drive.');
      return;
    }
    
    if (!formData.patient_name || formData.exam_types.length === 0 || !formData.exam_date) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.exam_types.includes('Outro') && !formData.other_exam_type) {
      setError('Por favor, especifique o tipo de exame.');
      return;
    }

    if (!customAccessKey || customAccessKey.length !== 6) {
      setError('A chave de acesso deve conter 6 caracteres.');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      // Preparar tipos de exame para o laudo
      let examTypeString;
      if (formData.exam_types.length === 1) {
        examTypeString = formData.exam_types[0] === 'Outro' ? 
          formData.other_exam_type : formData.exam_types[0];
      } else {
        // Combinar múltiplos tipos de exame
        const types = formData.exam_types.map(type => 
          type === 'Outro' ? formData.other_exam_type : type
        );
        examTypeString = types.join(' + ');
      }
      
      // Criar um registro para cada arquivo
      const reports = await Promise.all(
        driveLinks.map(link => {
          const reportData = {
            ...formData,
            exam_type: examTypeString,
            file_url: link.viewUrl,
            download_url: link.downloadUrl,
            access_key: customAccessKey,
            upload_date: format(new Date(), 'yyyy-MM-dd'),
            active: true,
            access_count: 0
          };
          return Report.create(reportData);
        })
      );
      
      setUploadedReport({
        ...reports[0],
        file_count: reports.length,
        files: driveLinks.map(link => link.url.split('/').pop())
      });
      
      setUploadSuccess(true);
      setUploadStep(2);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setError('Ocorreu um erro ao fazer o upload dos laudos. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Tratamento especial para exam_types que agora é um array
    if (name === 'exam_type') {
      // Se "Outro" for desmarcado, limpar o campo de outro tipo
      if (!value.includes('Outro') && formData.exam_types.includes('Outro')) {
        setFormData({
          ...formData,
          exam_types: [...value],
          other_exam_type: ''
        });
      } else {
        setFormData({
          ...formData,
          exam_types: [...value]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleExamTypeChange = (examType) => {
    const currentTypes = [...formData.exam_types];
    
    if (currentTypes.includes(examType)) {
      // Remover o tipo se já estiver selecionado
      const updatedTypes = currentTypes.filter(type => type !== examType);
      
      // Se "Outro" for removido, limpar o campo other_exam_type
      if (examType === 'Outro') {
        setFormData({
          ...formData,
          exam_types: updatedTypes,
          other_exam_type: ''
        });
      } else {
        setFormData({
          ...formData,
          exam_types: updatedTypes
        });
      }
    } else {
      // Adicionar o tipo se não estiver selecionado
      setFormData({
        ...formData,
        exam_types: [...currentTypes, examType]
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Verifica cada arquivo
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'application/msword' || 
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setError('Alguns arquivos foram ignorados. Apenas arquivos PDF e Word até 10MB são permitidos.');
    }

    if (validFiles.length === 0) {
      setError('Por favor, selecione arquivos PDF ou Word válidos (máx. 10MB cada).');
      return;
    }

    setFiles([...files, ...validFiles]);
    setError('');
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (files.length === 0) {
      setError('Por favor, selecione pelo menos um arquivo para upload.');
      return;
    }
    
    if (!formData.patient_name || formData.exam_types.length === 0 || !formData.exam_date) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.exam_types.includes('Outro') && !formData.other_exam_type) {
      setError('Por favor, especifique o tipo de exame.');
      return;
    }

    if (!customAccessKey || customAccessKey.length !== 6) {
      setError('A chave de acesso deve conter 6 caracteres.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const uploadedFiles = await Promise.all(
        files.map(file => UploadFile({ file }))
      );

      // Preparar tipos de exame para o laudo
      let examTypeString;
      if (formData.exam_types.length === 1) {
        examTypeString = formData.exam_types[0] === 'Outro' ? 
          formData.other_exam_type : formData.exam_types[0];
      } else {
        // Combinar múltiplos tipos de exame
        const types = formData.exam_types.map(type => 
          type === 'Outro' ? formData.other_exam_type : type
        );
        examTypeString = types.join(' + ');
      }

      // Cria registros para cada arquivo
      const reports = await Promise.all(
        uploadedFiles.map(({ file_url }) => {
          const reportData = {
            ...formData,
            exam_type: examTypeString,
            file_url,
            access_key: customAccessKey,
            upload_date: format(new Date(), 'yyyy-MM-dd'),
            active: true,
            access_count: 0
          };
          return Report.create(reportData);
        })
      );
      
      setUploadedReport({
        ...reports[0],
        file_count: reports.length,
        files: files.map(f => f.name)
      });
      
      setUploadSuccess(true);
      setUploadStep(2);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setError('Ocorreu um erro ao fazer o upload dos laudos. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyAccessKey = () => {
    if (uploadedReport) {
      navigator.clipboard.writeText(uploadedReport.access_key);
    }
  };

  const handleNewUpload = () => {
    setFormData({
      patient_name: '',
      patient_id: '',
      exam_types: [],
      other_exam_type: '',
      exam_date: format(new Date(), 'yyyy-MM-dd')
    });
    setFiles([]);
    setUploadSuccess(false);
    setUploadStep(1);
    setUploadedReport(null);
    setCustomAccessKey(gerarChaveAcesso());
    setDriveLink('');
    setDriveLinks([]);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleAccessKeyChange = (e) => {
    const newKey = e.target.value.toUpperCase();
    // Permite apenas letras e números, mantendo o limite de 6 caracteres
    const validKey = newKey.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setCustomAccessKey(validKey);
  };

  const regenerateAccessKey = () => {
    setCustomAccessKey(gerarChaveAcesso());
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Verifica se é um link do Google Drive
    if (pastedData.includes('drive.google.com')) {
      setDriveLink(pastedData);
      const fileInfo = getDriveFileFromLink(pastedData);
      if (fileInfo) {
        setDriveLinks([...driveLinks, { url: pastedData, ...fileInfo }]);
        setDriveLink(''); // Limpar input após adicionar
      } else {
        setError('Link do Google Drive inválido.');
      }
    } else {
      // Verifica se há arquivos no clipboard
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            // Validar o arquivo
            if (file.size > 10 * 1024 * 1024) { // 10MB
              setError('O arquivo deve ter no máximo 10MB');
              return;
            }
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
              setError('Apenas arquivos PDF e Word são permitidos');
              return;
            }
            setFiles(prevFiles => [...prevFiles, file]);
          }
        }
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <title>
        Implementar upload via cópia do Google Drive
      </title>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload de Laudos</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadStep === 1 && (
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Informações do Laudo</CardTitle>
            <CardDescription>
              Preencha os dados do paciente e faça upload dos laudos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" onClick={() => setUploadType('file')}>
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload de Arquivo
                </TabsTrigger>
                <TabsTrigger value="drive" onClick={() => setUploadType('drive')}>
                  <Cloud className="h-4 w-4 mr-2" />
                  Google Drive
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file">
                <form id="upload-form" onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="patient_name">
                          Nome do Paciente <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="patient_name"
                          name="patient_name"
                          value={formData.patient_name}
                          onChange={handleInputChange}
                          placeholder="Nome completo do paciente"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="patient_id">
                          SARAM
                        </Label>
                        <Input
                          id="patient_id"
                          name="patient_id"
                          value={formData.patient_id}
                          onChange={handleInputChange}
                          placeholder="Digite o SARAM"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="exam_type">
                          Tipo de Exame <span className="text-red-500">*</span>
                        </Label>
                        <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                          {EXAM_TYPES.map(type => (
                            <div key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`exam_type_${type}`}
                                checked={formData.exam_types.includes(type)}
                                onChange={() => handleExamTypeChange(type)}
                                className="h-4 w-4 mr-2"
                              />
                              <label htmlFor={`exam_type_${type}`} className="text-sm">
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Selecione um ou mais tipos de exame</p>
                      </div>
                      
                      {formData.exam_types.includes('Outro') && (
                        <div className="space-y-2">
                          <Label htmlFor="other_exam_type">
                            Especifique o Tipo <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="other_exam_type"
                            name="other_exam_type"
                            value={formData.other_exam_type}
                            onChange={handleInputChange}
                            placeholder="Digite o tipo de exame"
                            required
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="exam_date">
                          Data do Exame <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="exam_date"
                          name="exam_date"
                          type="date"
                          value={formData.exam_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access_key">
                        Chave de Acesso <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="access_key"
                          name="access_key"
                          value={customAccessKey}
                          onChange={handleAccessKeyChange}
                          placeholder="Chave de acesso para o paciente"
                          className="font-mono text-center tracking-widest uppercase"
                          maxLength={6}
                          required
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-shrink-0"
                          onClick={() => navigator.clipboard.writeText(customAccessKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        A chave deve conter 6 caracteres (3 letras e 3 números).
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file">
                        Arquivos dos Laudos <span className="text-red-500">*</span>
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                      />
                      
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer"
                           onClick={handleBrowseClick}>
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                            <FileUp className="h-6 w-6 text-blue-600" />
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">
                              Clique para selecionar arquivos ou arraste e solte
                            </p>
                            <p className="text-sm text-gray-500">
                              Aceita arquivos PDF e Word (máx. 10MB cada)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Lista de arquivos selecionados */}
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium text-gray-700">Arquivos selecionados:</h4>
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-800">{file.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="drive">
                <form id="drive-form" onSubmit={handleDriveSubmit}>
                  <div className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="patient_name">
                          Nome do Paciente <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="patient_name"
                          name="patient_name"
                          value={formData.patient_name}
                          onChange={handleInputChange}
                          placeholder="Nome completo do paciente"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="patient_id">
                          SARAM
                        </Label>
                        <Input
                          id="patient_id"
                          name="patient_id"
                          value={formData.patient_id}
                          onChange={handleInputChange}
                          placeholder="Digite o SARAM"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="exam_type">
                          Tipo de Exame <span className="text-red-500">*</span>
                        </Label>
                        <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                          {EXAM_TYPES.map(type => (
                            <div key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`exam_type_${type}`}
                                checked={formData.exam_types.includes(type)}
                                onChange={() => handleExamTypeChange(type)}
                                className="h-4 w-4 mr-2"
                              />
                              <label htmlFor={`exam_type_${type}`} className="text-sm">
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Selecione um ou mais tipos de exame</p>
                      </div>
                      
                      {formData.exam_types.includes('Outro') && (
                        <div className="space-y-2">
                          <Label htmlFor="other_exam_type">
                            Especifique o Tipo <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="other_exam_type"
                            name="other_exam_type"
                            value={formData.other_exam_type}
                            onChange={handleInputChange}
                            placeholder="Digite o tipo de exame"
                            required
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="exam_date">
                          Data do Exame <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="exam_date"
                          name="exam_date"
                          type="date"
                          value={formData.exam_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="drive_link">
                        Links do Google Drive <span className="text-red-500">*</span>
                      </Label>
                      
                      <div className="flex flex-col space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-start">
                              <Cloud className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                              <div>
                                <h4 className="font-medium text-blue-800">Acesso ao Google Drive</h4>
                                <p className="text-sm text-blue-700 mb-3">
                                  Você pode:
                                </p>
                                <ul className="list-disc list-inside text-sm text-blue-700 mb-3 space-y-1">
                                  <li>Colar o link do arquivo do Google Drive</li>
                                  <li>Copiar e colar diretamente o arquivo do Google Drive</li>
                                  <li>Selecionar arquivos através do botão abaixo</li>
                                </ul>
                                
                                <Button 
                                  type="button" 
                                  onClick={initGoogleDrivePicker}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Cloud className="h-4 w-4 mr-2" />
                                  )}
                                  Acessar Google Drive
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer"
                          onPaste={handlePaste}
                          onClick={() => document.getElementById('drive_link').focus()}
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                              <Cloud className="h-6 w-6 text-blue-600" />
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-700">
                                Cole o link ou copie o arquivo diretamente do Google Drive
                              </p>
                              <p className="text-sm text-gray-500">
                                Ctrl+V ou botão direito → Colar
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            id="drive_link"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            onPaste={handlePaste}
                            placeholder="Cole o link do arquivo no Google Drive"
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddDriveLink}
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </div>

                      {/* Lista de arquivos do Drive */}
                      {driveLinks.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium text-gray-700">Arquivos selecionados ({driveLinks.length}):</h4>
                          {driveLinks.map((link, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Cloud className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-800">Arquivo do Drive {index + 1}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-md">{link.url}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(link.viewUrl, '_blank')}
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDriveLink(index)}
                                >
                                  <X className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access_key">
                        Chave de Acesso <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="access_key"
                          name="access_key"
                          value={customAccessKey}
                          onChange={handleAccessKeyChange}
                          placeholder="Chave de acesso para o paciente"
                          className="font-mono text-center tracking-widest uppercase"
                          maxLength={6}
                          required
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-shrink-0"
                          onClick={() => navigator.clipboard.writeText(customAccessKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        A chave deve conter 6 caracteres (3 letras e 3 números).
                      </p>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/Dashboard")}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              form={uploadType === 'file' ? 'upload-form' : 'drive-form'}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <FilePlus className="mr-2 h-5 w-5" />
                  Enviar Laudo
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {uploadStep === 2 && uploadSuccess && uploadedReport && (
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Laudo Enviado com Sucesso</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Chave de Acesso do Paciente</h3>
                <div className="flex items-center">
                  <div className="p-3 bg-white rounded border font-mono text-xl flex-1 tracking-wider text-center font-bold text-blue-700">
                    {uploadedReport.access_key}
                  </div>
                  <Button variant="ghost" className="ml-2" onClick={handleCopyAccessKey}>
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Forneça esta chave ao paciente para que ele possa acessar o laudo.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Detalhes do Upload:</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center text-gray-600 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">Paciente</span>
                    </div>
                    <p className="font-medium">{uploadedReport.patient_name}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center text-gray-600 mb-1">
                      <FileUp className="h-4 w-4 mr-2" />
                      <span className="text-sm">Arquivos</span>
                    </div>
                    <p className="font-medium">{uploadedReport.file_count} arquivo(s)</p>
                    <div className="mt-2 space-y-1">
                      {uploadedReport.files.map((fileName, index) => (
                        <p key={index} className="text-sm text-gray-500 truncate">
                          {fileName}
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Data do Exame</span>
                    </div>
                    <p className="font-medium">
                      {format(new Date(uploadedReport.exam_date), "dd/MM/yyyy")}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center text-gray-600 mb-1">
                      <FileUp className="h-4 w-4 mr-2" />
                      <span className="text-sm">Tipo de Exame</span>
                    </div>
                    <p className="font-medium">{uploadedReport.exam_type}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-amber-800">Informação Importante</h4>
                    <p className="text-amber-700 text-sm">
                      A chave de acesso é o único meio do paciente acessar o laudo. 
                      Certifique-se de fornecê-la corretamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => navigate("/GerenciarLaudos")}
            >
              Ver Todos os Laudos
            </Button>
            <Button 
              onClick={handleNewUpload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FilePlus className="mr-2 h-5 w-5" />
              Adicionar Novo Laudo
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
