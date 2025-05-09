
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Building2, AlertCircle, Save, Loader2, Settings, Upload } from "lucide-react";

export default function Configuracoes() {
  const [userData, setUserData] = useState({
    clinic_name: "",
    phone: "",
    logo_url: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    async function loadUserData() {
      try {
        const user = await User.me();
        setUserData({
          clinic_name: user.clinic_name || "",
          phone: user.phone || "",
          logo_url: user.logo_url || ""
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setError("Não foi possível carregar suas informações.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMessage("");
    
    try {
      await User.updateMyUserData(userData);
      setSuccessMessage("Configurações salvas com sucesso!");
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setError("Ocorreu um erro ao salvar suas configurações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configurações da Clínica
          </CardTitle>
          <CardDescription>
            Configure as informações que serão exibidas para os pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="config-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">
                Nome da Clínica ou Profissional
              </Label>
              <Input
                id="clinic_name"
                name="clinic_name"
                value={userData.clinic_name}
                onChange={handleInputChange}
                placeholder="Ex: Clínica de Ultrassonografia São Lucas"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone de Contato
              </Label>
              <Input
                id="phone"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="Ex: (11) 95555-5555"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">
                URL do Logo (opcional)
              </Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={userData.logo_url}
                onChange={handleInputChange}
                placeholder="Ex: https://minhaclinica.com/logo.png"
              />
              <p className="text-sm text-gray-500">
                Insira o link para o logo da sua clínica hospedado em algum serviço (opcional)
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end pt-4 border-t">
          <Button 
            type="submit"
            form="config-form"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salvar Configurações
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-lg border-0 mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            Portal do Paciente
          </CardTitle>
          <CardDescription>
            Informações sobre o acesso dos pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="font-medium text-blue-800 mb-3">Link para Acesso do Paciente</h3>
            <p className="text-blue-700 mb-4">
              Os pacientes podem acessar seus laudos através do seguinte link:
            </p>
            <div className="p-3 bg-white rounded border font-mono text-sm break-all">
              {window.location.origin}/paciente
            </div>
          </div>
          
          <p className="text-gray-700">
            Forneça a chave de acesso única para cada paciente, gerada automaticamente 
            durante o upload do laudo. Com esta chave, o paciente poderá acessar e 
            baixar seu exame de forma segura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
