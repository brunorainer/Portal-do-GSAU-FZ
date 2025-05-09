
import React from "react";
import { format } from "date-fns";
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Loader2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function RecentActivity({ reports, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-medium text-lg text-gray-700">Nenhum laudo cadastrado</h3>
        <p className="text-sm">Comece a adicionar laudos para visualizar atividades recentes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <div key={report.id} className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 text-sm">{report.patient_name}</h4>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                {report.exam_type}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Exame: {report.exam_date && format(new Date(report.exam_date), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Upload: {format(new Date(report.created_date), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="flex items-center">
                <User className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Chave de acesso: {report.access_key}</span>
              </div>
            </div>
            <div className="mt-2">
              {report.accessed_at ? (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 text-xs">
                  Acessado {format(new Date(report.accessed_at), "dd/MM/yyyy HH:mm")}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                  Ainda não acessado
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
