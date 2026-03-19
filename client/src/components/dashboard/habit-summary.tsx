import { useState } from "react";
import HabitCard from "@/components/habits/habit-card";
import { habitCategories } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HabitSummaryProps {
  habits: any[];
  completions: any[];
}

export default function HabitSummary({ habits, completions }: HabitSummaryProps) {
  if (!habits || !completions) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-32 mt-2 sm:mt-0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    );
  }

  // Mutação para alternar a conclusão do hábito
  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: number, completed: boolean }) => {
      // Verificar se já existe um registro de conclusão
      const completion = completions.find(c => c.habitId === habitId);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (completion) {
        // Atualizar conclusão existente
        return apiRequest("PUT", `/api/habits/completion/${completion.id}`, { completed });
      } else {
        // Criar nova conclusão
        return apiRequest("POST", "/api/habits/completion", { 
          habitId, 
          date: today,
          completed,
          userId: 1 // ID de usuário fixo, pois não temos autenticação
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits/completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits/completions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/streaks'] });
    },
  });

  // Calcular taxa de conclusão
  const totalHabits = habits.length;
  const completedHabits = completions.filter(c => c.completed).length;
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hábitos de Hoje</h3>
        <p className={cn(
          "text-sm font-medium",
          completionRate >= 75 ? "text-success" : 
          completionRate >= 50 ? "text-amber-500" : 
          "text-gray-500"
        )}>
          {completedHabits}/{totalHabits} concluídos ({completionRate}%)
        </p>
      </div>
      
      {habits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completion={completions.find(c => c.habitId === habit.id)}
              onToggleCompletion={(completed) => toggleCompletion.mutate({ habitId: habit.id, completed })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum hábito programado para hoje. Crie seu primeiro hábito para começar!</p>
        </div>
      )}
    </div>
  );
}
