import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import HabitCard from "@/components/habits/habit-card";
import CreateHabitDialog from "@/components/habits/create-habit-dialog";
import { useState } from "react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, CalendarIcon, ListIcon } from "lucide-react";

export default function Habits() {
  const { toast } = useToast();
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<string>("list");

  const { data: habits, isLoading: habitsLoading } = useQuery({
    queryKey: ['/api/habits'],
  });

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const { data: completions, isLoading: completionsLoading } = useQuery({
    queryKey: ['/api/habits/completions', formattedDate],
    queryFn: async () => {
      if (isToday(selectedDate)) {
        const res = await fetch('/api/habits/completions/today');
        return await res.json();
      }
      return [];
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: number, completed: boolean }) => {
      const completion = completions?.find((c: any) => c.habitId === habitId);
      if (completion) {
        return apiRequest("PUT", `/api/habits/completion/${completion.id}`, { completed });
      } else {
        return apiRequest("POST", "/api/habits/completion", {
          habitId,
          date: formattedDate,
          completed,
          userId: 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits/completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits/completions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/streaks'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar hábito",
        description: "Não foi possível atualizar o status do hábito."
      });
    }
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: number) => {
      return apiRequest("DELETE", `/api/habits/${habitId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Hábito excluído",
        description: "O hábito foi excluído com sucesso."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Falha ao excluir hábito",
        description: "Não foi possível excluir o hábito. Tente novamente."
      });
    }
  });

  const filteredHabits = habits?.filter((habit: any) => {
    const day = format(selectedDate, 'EEEE').toLowerCase();
    return habit[day] === true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hábitos</h2>
          <p className="text-sm text-gray-500">
            {isToday(selectedDate)
              ? 'Hoje'
              : format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex space-x-3">
          <Tabs defaultValue={viewType} onValueChange={setViewType} className="w-[220px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">
                <ListIcon className="h-4 w-4 mr-1" /> Lista
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-1" /> Calendário
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => setIsCreateHabitOpen(true)}
            className="bg-primary text-white hidden md:flex"
          >
            + Novo Hábito
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Data</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            locale={ptBR}
          />
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {viewType === 'list' ? 'Lista de Hábitos' : 'Visão de Calendário'}
          </h3>

          {habitsLoading || completionsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : viewType === 'list' ? (
            filteredHabits?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredHabits.map((habit: any) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completion={completions?.find((c: any) => c.habitId === habit.id)}
                    onToggleCompletion={(completed) => toggleCompletion.mutate({ habitId: habit.id, completed })}
                    onDelete={() => deleteHabit.mutate(habit.id)}
                    isDetailView={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum hábito agendado para este dia.</p>
                <Button
                  onClick={() => setIsCreateHabitOpen(true)}
                  className="bg-primary text-white"
                >
                  Criar Meu Primeiro Hábito
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Visualização de calendário em breve!</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 right-6">
        <Button
          onClick={() => setIsCreateHabitOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg"
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>

      <CreateHabitDialog
        open={isCreateHabitOpen}
        onOpenChange={setIsCreateHabitOpen}
      />
    </div>
  );
}
