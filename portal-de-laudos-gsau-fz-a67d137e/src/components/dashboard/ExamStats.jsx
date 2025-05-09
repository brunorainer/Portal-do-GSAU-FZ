
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

// Cores mais harmoniosas e acessíveis
const COLORS = [
  '#3b82f6', // azul primário
  '#10b981', // verde
  '#8b5cf6', // roxo
  '#f59e0b', // âmbar
  '#ef4444', // vermelho
  '#ec4899', // rosa
  '#6366f1', // índigo
  '#14b8a6', // teal
  '#f97316'  // laranja
];

export default function ExamStats({ reports }) {
  // Processar dados para o gráfico de pizza
  const examTypeData = reports.reduce((acc, report) => {
    acc[report.exam_type] = (acc[report.exam_type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(examTypeData)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      value
    }))
    .sort((a, b) => b.value - a.value); // Ordena por quantidade (decrescente)

  // Processar dados para o gráfico de barras (últimos 6 meses)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
  }).reverse();

  const monthlyData = last6Months.map(month => {
    const count = reports.filter(report => {
      const reportDate = new Date(report.created_date);
      return reportDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }) === month;
    }).length;

    return {
      month,
      exames: count
    };
  });

  // Calculando o total de exames para o título
  const totalExams = reports.length;

  // Formatador personalizado para tooltips
  const formatTooltipValue = (value, name, props) => {
    const item = pieData.find(d => d.name === name);
    const fullName = item ? item.fullName : name;
    
    return [
      `${value} exame${value !== 1 ? 's' : ''} (${(value / totalExams * 100).toFixed(1)}%)`, 
      fullName
    ];
  };

  // Renderizador customizado para as etiquetas do gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Só exibe rótulos para fatias significativas
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={10}
        fontWeight="500"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b pb-3 bg-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800">
            Distribuição por Tipo de Exame ({totalExams} exames)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    labelLine={true}
                    label={renderCustomizedLabel}
                    strokeWidth={1}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatTooltipValue}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px 12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader className="border-b pb-3 bg-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800">Evolução Mensal de Exames</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            {monthlyData.some(d => d.exames > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#4B5563', fontSize: 10 }}
                    tickLine={{ stroke: '#9CA3AF' }}
                    axisLine={{ stroke: '#9CA3AF' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fill: '#4B5563', fontSize: 10 }}
                    tickLine={{ stroke: '#9CA3AF' }}
                    axisLine={{ stroke: '#9CA3AF' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} exame${value !== 1 ? 's' : ''}`, '']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0'
                    }}
                    cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                  />
                  <Bar 
                    dataKey="exames" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {monthlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                    <LabelList 
                      dataKey="exames" 
                      position="top" 
                      fill="#4B5563"
                      fontSize={10}
                      formatter={(value) => value > 0 ? value : ''}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
