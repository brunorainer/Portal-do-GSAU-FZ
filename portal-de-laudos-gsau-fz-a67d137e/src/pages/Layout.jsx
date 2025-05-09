

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { 
  FileText, 
  Upload, 
  LayoutDashboard, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  Settings,
  ExternalLink,
  Calendar
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isPatientAccess = location.pathname.includes('paciente');
  
  useEffect(() => {
    async function loadUserData() {
      try {
        if (!isPatientAccess) {
          const userData = await User.me();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.log("Usuário não autenticado");
        if (!isPatientAccess) {
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [isPatientAccess]);

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  const handleButtonClick = (item) => {
    if (item.url === '/paciente') {
      window.open(item.url, '_blank');
    } else {
      navigate(item.url);
    }
  };

  // Se for a página do paciente, não aplicamos o layout, pois a página tem seu próprio layout
  if (isPatientAccess || currentPageName === 'paciente') {
    return children;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  const menuItems = [
    { name: "Painel", icon: <LayoutDashboard className="h-5 w-5" />, url: "/Dashboard" },
    { name: "Upload de Laudos", icon: <Upload className="h-5 w-5" />, url: "/UploadLaudo" },
    { name: "Gerenciar Laudos", icon: <FileText className="h-5 w-5" />, url: "/GerenciarLaudos" },
    { name: "Preparo de Exames", icon: <Calendar className="h-5 w-5" />, url: "/PreparoExames" },
    { name: "Portal do Paciente", icon: <ExternalLink className="h-5 w-5" />, url: "/paciente", external: true },
    { name: "Configurações", icon: <Settings className="h-5 w-5" />, url: "/Configuracoes" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {currentUser && (
        <header className="bg-sky-700 text-slate-100 px-4 py-3 shadow-sm lg:px-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f262b_gsau-fz.png" 
                  alt="GSAU-FZ Logo" 
                  className="h-16 w-auto"
                />
                <FileText className="h-12 w-12 text-white" />
                <h1 className="font-semibold text-3xl text-white hidden md:block">Portal de Laudos - GSAU-FZ</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-white">{currentUser?.full_name}</p>
                <p className="text-xs text-slate-200">{currentUser?.clinic_name || 'Administrador'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-white hover:text-red-200 rounded-full hover:bg-sky-800"
                aria-label="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile sidebar */}
      {currentUser && (
        <div className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`absolute top-0 left-0 w-64 h-full bg-white transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f262b_gsau-fz.png" 
                  alt="GSAU-FZ Logo" 
                  className="h-14 w-auto"
                />
                <FileText className="h-7 w-7 text-blue-600" />
                <h2 className="font-semibold text-lg text-gray-800">Portal de Laudos - GSAU-FZ</h2>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-600 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="py-4">
              {menuItems.map(item => (
                item.external ? (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.url}
                    className={`flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-800 ${
                      location.pathname === item.url ? 'bg-blue-50 text-blue-800 border-r-4 border-blue-600' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        {currentUser && (
          <aside className="bg-blue-100 hidden lg:block w-64 shadow-md">
            <div className="p-6 border-b">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1f262b_gsau-fz.png" 
                alt="GSAU-FZ Logo" 
                className="h-32 w-auto mx-auto mb-4"
              />
              <h2 className="font-semibold text-xl text-gray-800 text-center">Portal de Laudos - GSAU-FZ</h2>
              <div className="text-center mt-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="font-medium text-gray-800">{currentUser?.full_name}</p>
                <p className="text-sm text-gray-500">{currentUser?.clinic_name || 'Administrador'}</p>
              </div>
            </div>
            <nav className="bg-slate-100 p-4 space-y-1">
              {menuItems.map(item => (
                <Link
                  key={item.name}
                  to={item.external ? '#' : item.url}
                  onClick={() => item.external ? window.open(item.url, '_blank') : null}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-800 transition-colors ${
                    location.pathname === item.url ? 'bg-blue-50 text-blue-800' : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        )}
        
        <main className="bg-slate-200 p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

