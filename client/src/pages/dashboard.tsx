import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import HabitSummary from "@/components/dashboard/habit-summary";
import WeeklyOverview from "@/components/dashboard/weekly-overview";
import StreaksStats from "@/components/dashboard/streaks-stats";
import AppUsageTracker from "@/components/stats/app-usage-tracker";
import { Button } from "@/components/ui/button";
import { StudySessionCard } from "@/components/study/study-session-card";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreateHabitDialog from "@/components/habits/create-habit-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { toast } = useToast();
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);

  // Fetch today's date
  const today = format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ptBR });

  // Fetch today's habits and completions
  const { data: habits, isLoading: habitsLoading } = useQuery({
    queryKey: ['/api/habits'],
  });

  const { data: completions, isLoading: completionsLoading } = useQuery({
    queryKey: ['/api/habits/completions/today'],
  });

  // Fetch today's study sessions
  const { data: studySessions, isLoading: studySessionsLoading } = useQuery({
    queryKey: ['/api/study-sessions/today'],
  });

  // Fetch study sessions content
  const { data: studyTopics } = useQuery({
    queryKey: ['/api/reference/study-topics'],
  });

  // For each study session, fetch its content
  const sessionsWithContent = useQuery({
    queryKey: ['/api/study-sessions-with-content'],
    queryFn: async () => {
      if (!studySessions) return [];
      
      const sessionsWithContent = await Promise.all(
        studySessions.map(async (session: any) => {
          const response = await fetch(`/api/study-session-content/${session.id}`);
          const content = await response.json();
          return { ...session, content };
        })
      );
      
      return sessionsWithContent;
    },
    enabled: !!studySessions,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Dashboard Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Painel</h2>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <div className="mt-3 md:mt-0 flex space-x-3">
          <div className="relative">
            <Button variant="outline" className="text-sm">
              Esta Semana
            </Button>
          </div>
          <Button onClick={() => setIsCreateHabitOpen(true)} className="bg-primary text-white md:hidden">
            + Novo Hábito
          </Button>
        </div>
      </div>

      {/* Today's Habits */}
      {habitsLoading || completionsLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : (
        <HabitSummary habits={habits} completions={completions} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Overview */}
        <div className="lg:col-span-2">
          <WeeklyOverview habits={habits} />
        </div>

        {/* Streaks & Stats */}
        <div>
          <StreaksStats />
        </div>
      </div>

      {/* Study Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Plano de Estudos de Hoje</h3>
          <Button 
            className="mt-2 sm:mt-0 bg-secondary text-white"
            onClick={() => toast({
              title: "Recurso em desenvolvimento",
              description: "O acompanhamento de sessões de estudo estará disponível em breve!"
            })}
          >
            Iniciar Sessão de Estudo
          </Button>
        </div>
        
        {studySessionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionsWithContent.data?.map((session: any) => (
              <StudySessionCard 
                key={session.id}
                session={session}
                topic={studyTopics?.find((t: any) => t.id === session.topicId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* App Usage Tracking */}
      <div className="mt-6">
        <AppUsageTracker />
      </div>

      {/* Mobile Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6">
        <Button 
          onClick={() => setIsCreateHabitOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg"
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Create Habit Dialog */}
      <CreateHabitDialog 
        open={isCreateHabitOpen}
        onOpenChange={setIsCreateHabitOpen}
      />
    </div>
  );
}
