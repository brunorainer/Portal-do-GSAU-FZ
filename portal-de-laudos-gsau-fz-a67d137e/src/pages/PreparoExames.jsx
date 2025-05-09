
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Phone, 
  Calendar, 
  Mail, 
  AlertCircle, 
  Check, 
  MessageSquare, 
  Link2 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PreparoExames() {
  const sidebarItems = [
    { name: "Portal de Laudos", icon: <FileText className="h-5 w-5" />, active: false },
    { name: "Preparo de Exames", icon: <Calendar className="h-5 w-5" />, active: true },
    { name: "Contatos", icon: <Phone className="h-5 w-5" />, active: false },
    { name: "Links Úteis", icon: <Link2 className="h-5 w-5" />, active: false },
    { name: "Sugestões", icon: <MessageSquare className="h-5 w-5" />, active: false }
  ];

  // Dados dos exames e seus preparos
  const examPreps = [
    {
      id: "abdominal",
      title: "Ultrassonografia Abdominal Total",
      preparo: [
        "Jejum de 8 horas (inclusive água)",
        "Não fumar durante o período de jejum",
        "Evitar alimentos que produzam gases no dia anterior (feijão, repolho, couve, refrigerante, etc.)",
        "Tomar 40 gotas de Luftal (simeticona) 1 hora antes do exame",
        "Trazer exames anteriores relacionados, se houver"
      ],
      observacoes: "Este exame avalia fígado, vesícula biliar, pâncreas, baço, rins, bexiga e grandes vasos abdominais. A bexiga não precisa estar cheia para este exame."
    },
    {
      id: "pelvica",
      title: "Ultrassonografia Pélvica",
      preparo: [
        "Beber 1 litro de água 1 hora antes do exame",
        "Não urinar após beber a água",
        "A bexiga deve estar bem cheia no momento do exame",
        "Não é necessário jejum",
        "Trazer exames anteriores relacionados, se houver"
      ],
      observacoes: "Este exame avalia útero, ovários, bexiga e próstata (no caso dos homens). A bexiga cheia é fundamental para a boa visualização dos órgãos pélvicos."
    },
    {
      id: "obstetrica",
      title: "Ultrassonografia Obstétrica",
      preparo: [
        "Até 12 semanas de gestação: beber 1 litro de água 1 hora antes do exame e não urinar",
        "Acima de 12 semanas: não é necessário preparo específico",
        "Trazer exames anteriores e cartão de pré-natal"
      ],
      observacoes: "Este exame avalia o desenvolvimento fetal, placenta, líquido amniótico e colo uterino. No primeiro trimestre, a bexiga cheia é importante para melhor visualização."
    },
    {
      id: "tireoide",
      title: "Ultrassonografia da Tireoide",
      preparo: [
        "Não é necessário preparo específico",
        "Evitar o uso de colares e brincos no dia do exame",
        "Trazer exames anteriores relacionados e exames laboratoriais da tireoide, se houver"
      ],
      observacoes: "Este exame avalia a glândula tireoide e estruturas adjacentes no pescoço. É um exame rápido e não invasivo."
    },
    {
      id: "mamas",
      title: "Ultrassonografia de Mamas",
      preparo: [
        "Não é necessário preparo específico",
        "Evitar o uso de talcos, cremes ou desodorantes na região das mamas no dia do exame",
        "Trazer mamografias e ultrassonografias anteriores, se houver"
      ],
      observacoes: "Este exame avalia o tecido mamário e é complementar à mamografia. É recomendado para mulheres jovens, gestantes ou com mamas densas."
    },
    {
      id: "partes-moles",
      title: "Ultrassonografia de Partes Moles",
      preparo: [
        "Não é necessário preparo específico",
        "Usar roupas confortáveis que permitam fácil acesso à região a ser examinada",
        "Trazer exames anteriores relacionados, se houver"
      ],
      observacoes: "Este exame avalia estruturas superficiais como músculos, tendões, ligamentos e outras estruturas de tecidos moles. É útil para avaliar nódulos, cistos e outras alterações."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Preparação para Exames de Ultrassonografia</h2>
      
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader className="bg-blue-50">
          <CardTitle>Instruções básicas para garantir a qualidade do seu exame</CardTitle>
          <CardDescription className="text-blue-800">
            A preparação adequada permite uma melhor visualização dos órgãos e estruturas, resultando em um diagnóstico mais preciso.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-700 mb-6">
            Para garantir a melhor qualidade do seu exame de ultrassonografia, é importante seguir algumas orientações básicas. 
            Cada tipo de exame possui um preparo específico que deve ser seguido corretamente.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-amber-800">Importante</h4>
                <p className="text-amber-700">
                  Caso tenha alguma dúvida específica sobre a preparação para o seu exame, entre em contato conosco pelos telefones: 
                  <strong> (85) 3216-3052</strong> ou <strong>3216-3051</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Acordeão de tipos de exames */}
          <h3 className="font-semibold text-lg mb-4">Preparo para Exames</h3>
          <Accordion type="single" collapsible className="w-full">
            {examPreps.map((exam) => (
              <AccordionItem key={exam.id} value={exam.id}>
                <AccordionTrigger className="text-left font-medium text-blue-800">
                  {exam.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4">
                    <h4 className="font-medium mb-2">Preparo:</h4>
                    <ul className="space-y-2 pl-2">
                      {exam.preparo.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h4 className="font-medium mt-4 mb-2">Observações:</h4>
                    <p className="text-gray-700 pl-2">{exam.observacoes}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-lg border-0">
        <CardHeader className="bg-blue-50">
          <CardTitle>No Dia do Exame</CardTitle>
          <CardDescription className="text-blue-800">
            Orientações para o dia do seu exame
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <span>Chegue com 15 minutos de antecedência</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <span>Traga documento de identificação com foto</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <span>Traga a solicitação médica do exame</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <span>Traga exames anteriores relacionados</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <span>Informe ao médico sobre alergias, medicamentos em uso e condições médicas relevantes</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <span>Use roupas confortáveis e de fácil remoção</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card className="bg-sky-50 border border-sky-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start">
            <Phone className="h-6 w-6 text-sky-700 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-sky-900 mb-1">Dúvidas ou Informações Adicionais</h3>
              <p className="text-sky-800 mb-3">
                Se você tiver alguma dúvida ou precisar de informações adicionais sobre o preparo dos exames,
                entre em contato conosco:
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-sky-700 mr-2" />
                  <span className="text-sky-800">(85) 3216-3052</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-sky-700 mr-2" />
                  <span className="text-sky-800">(85) 3216-3051</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
