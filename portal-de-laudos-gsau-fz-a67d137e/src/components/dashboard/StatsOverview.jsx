
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const colorVariants = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  purple: "bg-purple-600",
  amber: "bg-amber-600",
  red: "bg-red-600"
};

const colorVariantsLight = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800"
};

export default function StatsOverview({ title, value, icon, description, color = "blue", isLoading = false }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start">
          <div className="p-5 flex-1">
            <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-gray-800 mb-2">{value}</div>
            )}
            <div className="text-xs text-gray-500">{description}</div>
          </div>
          <div className={`w-16 h-16 flex items-center justify-center ${colorVariants[color]}`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
