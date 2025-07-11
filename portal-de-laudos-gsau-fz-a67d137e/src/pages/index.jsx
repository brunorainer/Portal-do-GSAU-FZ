import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import UploadLaudo from "./UploadLaudo";

import GerenciarLaudos from "./GerenciarLaudos";

import Configuracoes from "./Configuracoes";

import paciente from "./paciente";

import PreparoExames from "./PreparoExames";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    UploadLaudo: UploadLaudo,
    
    GerenciarLaudos: GerenciarLaudos,
    
    Configuracoes: Configuracoes,
    
    paciente: paciente,
    
    PreparoExames: PreparoExames,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/UploadLaudo" element={<UploadLaudo />} />
                
                <Route path="/GerenciarLaudos" element={<GerenciarLaudos />} />
                
                <Route path="/Configuracoes" element={<Configuracoes />} />
                
                <Route path="/paciente" element={<paciente />} />
                
                <Route path="/PreparoExames" element={<PreparoExames />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}