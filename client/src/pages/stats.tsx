import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, Line, Pie, BarChart, LineChart, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AppUsageTracker from "@/components/stats/app-usage-tracker";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Stats() {
  const [timeframe, setTimeframe] = useState("month");
  const isMobile = useIsMobile();
  
  // Get date range based on timeframe
  const today = new Date();
  const getDateRange = () => {
    switch (timeframe) {
      case "week":
        return {
          startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      case "month":
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd')
        };
      case "year":
        return {
          startDate: format(subDays(today, 365), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      default:
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd')
        };
    }
  };
  
  const { startDate, endDate } = getDateRange();
  
  // Fetch overall stats
  const { data: overallStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/overall', startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/stats/overall?startDate=${startDate}&endDate=${endDate}`);
      return res.json();
    },
  });
  
  // Fetch habit streaks
  const { data: streaks, isLoading: streaksLoading } = useQuery({
    queryKey: ['/api/stats/streaks'],
  });
  
  // Fetch habits
  const { data: habits, isLoading: habitsLoading } = useQuery({
    queryKey: ['/api/habits'],
  });

  // Fetch app usage data
  const { data: appUsage, isLoading: appUsageLoading } = useQuery({
    queryKey: ['/api/app-usage/week'],
  });

  // Process data for charts
  const streakChartData = streaks && Array.isArray(streaks) ? streaks.map((streak: any) => ({
    name: streak.habitName,
    streak: streak.streak,
    fill: getHabitColor(streak.habitId)
  })) : [];
  
  // Generate mock data for charts - in a real app, this would come from the API
  // This is just for visual representation
  const habitCompletionData = habits && Array.isArray(habits) ? habits.map((habit: any) => ({
    name: habit.name,
    completion: Math.floor(Math.random() * 100),
    fill: getHabitColor(habit.id)
  })) : [];
  
  const weeklyProgressData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    return {
      name: format(date, 'EEE', { locale: ptBR }),
      completion: Math.floor(Math.random() * 100),
    };
  });
  
  function getHabitColor(habitId: number) {
    // Simple way to get consistent colors for habits
    const colors = [
      "#4F46E5", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", 
      "#3B82F6", "#EC4899", "#14B8A6"
    ];
    return colors[habitId % colors.length];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Estatísticas</h2>
          <p className="text-sm text-gray-500">Veja seu progresso em hábitos e estudos</p>
        </div>
        <div className="mt-3 md:mt-0">
          <Select
            defaultValue={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.completionRate || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Maior Sequência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.longestStreak || 0} dias</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total de Hábitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.totalHabits || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Hábitos Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.habitsCompleted || 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* App Usage Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Aplicativos</h3>
        <AppUsageTracker />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <Tabs defaultValue="streaks">
          <TabsList className="mb-4">
            <TabsTrigger value="streaks">Sequências</TabsTrigger>
            <TabsTrigger value="completion">Taxas de Conclusão</TabsTrigger>
            <TabsTrigger value="progress">Progresso Semanal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="streaks">
            <Card>
              <CardHeader>
                <CardTitle>Sequências Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                {streaksLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={streakChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <Bar dataKey="streak" fill="#8884d8" label={{ position: 'top' }} />
                        <text x="50%" y="15" textAnchor="middle" className="text-lg font-semibold">
                          Sequências de Hábitos
                        </text>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completion">
            <Card>
              <CardHeader>
                <CardTitle>Taxas de Conclusão de Hábitos</CardTitle>
              </CardHeader>
              <CardContent>
                {habitsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={habitCompletionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="completion"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weeklyProgressData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <Line
                        type="monotone"
                        dataKey="completion"
                        stroke="#4F46E5"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
