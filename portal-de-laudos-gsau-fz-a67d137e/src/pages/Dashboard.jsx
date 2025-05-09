
import React, { useState, useEffect } from "react";
import { Report } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FileText, 
  Upload, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import RecentActivity from "../components/dashboard/RecentActivity";
import StatsOverview from "../components/dashboard/StatsOverview";
import ExamStats from "../components/dashboard/ExamStats";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    month: 0,
    recentAccesses: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await User.me();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Redirecionar para a página de login
        window.location.href = "/login";
      }
    }
    
    checkAuth();
  }, []);

  useEffect(() => {
    async function loadReportsData() {
      try {
        const reportsList = await Report.list("-created_date");
        setReports(reportsList);
        
        // Calcular estatísticas
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const todayReports = reportsList.filter(report => {
          const reportDate = new Date(report.created_date);
          return reportDate >= today;
        });
        
        const monthReports = reportsList.filter(report => {
          const reportDate = new Date(report.created_date);
          return reportDate >= thisMonth;
        });
        
        const recentAccesses = reportsList.filter(report => 
          report.accessed_at && new Date(report.accessed_at) >= thisMonth
        ).length;
        
        setStats({
          total: reportsList.length,
          today: todayReports.length,
          month: monthReports.length,
          recentAccesses
        });
      } catch (error) {
        console.error("Erro ao carregar laudos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadReportsData();
  }, []);

  const recentReports = reports.slice(0, 5);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Painel</h1>
        <p className="text-gray-500">
          Bem-vindo ao Portal de Laudos. Visualize estatísticas e atividades recentes.
        </p>
      </div>

      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsOverview 
          title="Total de Laudos"
          value={stats.total}
          icon={<FileText className="h-5 w-5" />}
          description="Laudos cadastrados"
          color="blue"
          isLoading={isLoading}
        />
        
        <StatsOverview 
          title="Laudos Hoje"
          value={stats.today}
          icon={<Calendar className="h-5 w-5" />}
          description="Adicionados hoje"
          color="green"
          isLoading={isLoading}
        />
        
        <StatsOverview 
          title="Laudos no Mês"
          value={stats.month}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Adicionados este mês"
          color="purple"
          isLoading={isLoading}
        />
        
        <StatsOverview 
          title="Acessos Recentes"
          value={stats.recentAccesses}
          icon={<Eye className="h-5 w-5" />}
          description="Visualizações este mês"
          color="amber"
          isLoading={isLoading}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas de Exames</h2>
        <ExamStats reports={reports} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Laudos Recentes
              </CardTitle>
              <Link to={createPageUrl("GerenciarLaudos")}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                  Ver Todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <RecentActivity reports={recentReports} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to={createPageUrl("UploadLaudo")}>
                <Button className="w-full h-14 justify-start bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Adicionar Laudo</p>
                    <p className="text-xs opacity-90">Fazer upload de novo laudo</p>
                  </div>
                </Button>
              </Link>
              
              <Link to={createPageUrl("GerenciarLaudos")}>
                <Button variant="outline" className="w-full h-14 justify-start">
                  <FileText className="h-5 w-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Gerenciar Laudos</p>
                    <p className="text-xs text-gray-500">Visualizar e gerenciar laudos</p>
                  </div>
                </Button>
              </Link>
              
              <Link to={createPageUrl("Configuracoes")}>
                <Button variant="outline" className="w-full h-14 justify-start">
                  <Users className="h-5 w-5 mr-3 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Configurações</p>
                    <p className="text-xs text-gray-500">Configurar informações da clínica</p>
                  </div>
                </Button>
              </Link>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <Clock className="h-4 w-4" />
                    <h4 className="font-medium">Data Atual</h4>
                  </div>
                  <p className="text-amber-800 font-medium">
                    {format(new Date(), "PPPP", { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
