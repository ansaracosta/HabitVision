import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppUsageTracker() {
  // Fetch app usage data
  const { data: todayUsage, isLoading: todayLoading } = useQuery({
    queryKey: ['/api/app-usage/today'],
  });

  const { data: weekUsage, isLoading: weekLoading } = useQuery({
    queryKey: ['/api/app-usage/week'],
  });

  const { data: mostUsedApp, isLoading: mostUsedLoading } = useQuery({
    queryKey: ['/api/app-usage/most-used'],
  });

  // Calculate totals
  const calculateTotalMinutes = (usage: any[] | undefined) => {
    if (!usage) return 0;
    return usage.reduce((total, app) => total + app.durationMinutes, 0);
  };

  const todayTotal = calculateTotalMinutes(todayUsage);
  const weekTotal = calculateTotalMinutes(weekUsage);
  
  // Meta diária simulada - em um app real, isso viria das configurações do usuário
  const dailyGoal = 150; // minutos
  const dailyProgress = Math.min(Math.round((todayTotal / dailyGoal) * 100), 100);

  // Formatar exibição de tempo (ex: 1h 45m)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoramento de Uso de Aplicativos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {todayLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 mb-1">Hoje</p>
              <p className="text-xl font-semibold text-gray-900">{formatTime(todayTotal)}</p>
              <div className="flex items-center text-xs text-success mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                15% em relação a ontem
              </div>
            </CardContent>
          </Card>
        )}

        {weekLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 mb-1">Esta Semana</p>
              <p className="text-xl font-semibold text-gray-900">{formatTime(weekTotal)}</p>
              <div className="flex items-center text-xs text-success mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                8% em relação à semana passada
              </div>
            </CardContent>
          </Card>
        )}

        {mostUsedLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 mb-1">App Mais Usado</p>
              <p className="text-xl font-semibold text-gray-900">{mostUsedApp?.appName || "Nenhum"}</p>
              <p className="text-xs text-gray-500 mt-1">
                {mostUsedApp ? formatTime(mostUsedApp.totalMinutes) : "0m"} esta semana
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 mb-1">Meta Diária</p>
            <p className="text-xl font-semibold text-gray-900">{formatTime(dailyGoal)}</p>
            <div className="w-full mt-2">
              <Progress 
                value={dailyProgress} 
                className="h-2"
                indicatorClassName="bg-success"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
