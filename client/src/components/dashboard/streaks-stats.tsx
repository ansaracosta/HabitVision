import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function StreaksStats() {
  // Buscar sequências atuais
  const { data: streaks, isLoading: streaksLoading } = useQuery({
    queryKey: ['/api/stats/streaks'],
  });

  // Buscar estatísticas gerais
  const { data: overallStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/overall'],
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequências e Estatísticas</h3>
      
      {/* Sequências Atuais */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sequências Atuais</h4>
        {streaksLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {streaks?.map((streak: any) => (
              <div key={streak.habitId} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{streak.habitName}</span>
                  <span className="text-sm font-medium text-success">{streak.streak} dias</span>
                </div>
                <Progress
                  value={Math.min(streak.streak * 10, 100)}
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-success"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo de Estatísticas */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Este Mês</h4>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-primary">{overallStats?.completionRate || 0}%</div>
              <div className="text-xs text-gray-500">Taxa de Conclusão</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-primary">{overallStats?.longestStreak || 0}</div>
              <div className="text-xs text-gray-500">Sequência Mais Longa</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-primary">{overallStats?.totalHabits || 0}</div>
              <div className="text-xs text-gray-500">Total de Hábitos</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-primary">{overallStats?.habitsCompleted || 0}</div>
              <div className="text-xs text-gray-500">Hábitos Concluídos</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
