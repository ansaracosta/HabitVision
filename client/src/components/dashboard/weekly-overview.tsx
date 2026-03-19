import { format, startOfWeek, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { habitCategories } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

interface WeeklyOverviewProps {
  habits?: any[];
}

// Stable mock completions based on habit id + day index (no Math.random at render)
function getMockCompleted(habitId: number, dayIndex: number): boolean {
  return ((habitId * 3 + dayIndex * 7) % 10) > 2; // ~70% fill
}

export default function WeeklyOverview({ habits }: WeeklyOverviewProps) {
  const today = new Date();
  const startOfTheWeek = startOfWeek(today, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startOfTheWeek, i);
    return {
      short: format(date, "EEE", { locale: ptBR }),
      day: format(date, "d"),
      date: format(date, "yyyy-MM-dd"),
      isToday: isToday(date),
    };
  });

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visão Semanal</h3>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[480px] border-collapse">
          {/* ── Header ── */}
          <thead>
            <tr>
              {/* Habit name column */}
              <th className="text-left pb-2 pr-3 w-[30%]">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Hábito
                </span>
              </th>

              {/* Day columns */}
              {weekDays.map((day) => (
                <th key={day.date} className="pb-2 px-1 text-center">
                  <span className="block text-xs font-medium text-gray-400 capitalize">
                    {day.short}
                  </span>
                  <span
                    className={`mt-1 mx-auto flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                      day.isToday
                        ? "bg-primary text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {day.day}
                  </span>
                </th>
              ))}

              {/* Count column */}
              <th className="pb-2 pl-2 text-right w-10">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Total
                </span>
              </th>
            </tr>

            {/* Separator */}
            <tr>
              <td colSpan={9}>
                <div className="h-px bg-gray-100 mb-1" />
              </td>
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {habits ? (
              habits.map((habit, habitIndex) => {
                const category = habitCategories.find(
                  (c) => c.id === habit.categoryId
                );
                const completions = weekDays.map((_, dayIndex) =>
                  getMockCompleted(habit.id, dayIndex)
                );
                const completedCount = completions.filter(Boolean).length;

                return (
                  <tr
                    key={habit.id}
                    className={`group ${
                      habitIndex % 2 === 0 ? "bg-transparent" : "bg-gray-50"
                    }`}
                  >
                    {/* Habit name */}
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: category?.color ?? "#6B7280" }}
                        />
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {habit.name}
                        </span>
                      </div>
                    </td>

                    {/* Day cells */}
                    {completions.map((completed, dayIndex) => (
                      <td key={dayIndex} className="py-2 px-1 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                            completed
                              ? "text-white"
                              : "bg-gray-100 text-gray-300"
                          }`}
                          style={
                            completed
                              ? { backgroundColor: category?.color ?? "#6B7280" }
                              : {}
                          }
                        >
                          {completed ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          ) : (
                            <X className="w-3 h-3" strokeWidth={2.5} />
                          )}
                        </span>
                      </td>
                    ))}

                    {/* Count */}
                    <td className="py-2 pl-2 text-right">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: category?.color ?? "#6B7280" }}
                      >
                        {completedCount}/7
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Skeleton rows */
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-2 pr-3">
                    <Skeleton className="h-5 w-28" />
                  </td>
                  {weekDays.map((_, j) => (
                    <td key={j} className="py-2 px-1 text-center">
                      <Skeleton className="h-7 w-7 rounded-full mx-auto" />
                    </td>
                  ))}
                  <td className="py-2 pl-2">
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
