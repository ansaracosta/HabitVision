import { habitCategories } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Get color for a habit based on its category ID
 */
export const getHabitCategoryColor = (categoryId: number): string => {
  const category = habitCategories.find(c => c.id === categoryId);
  return category?.color || "#6B7280"; // Default gray color
};

/**
 * Check if a habit is scheduled for a specific day
 */
export const isHabitScheduledForDay = (habit: any, date: Date): boolean => {
  if (!habit) return false;
  
  // Mapeamento dos dias em inglês para as chaves de propriedade
  const dayMap: Record<string, string> = {
    "segunda-feira": "monday",
    "terça-feira": "tuesday",
    "quarta-feira": "wednesday",
    "quinta-feira": "thursday",
    "sexta-feira": "friday",
    "sábado": "saturday",
    "domingo": "sunday"
  };
  
  // Obter o nome do dia em português
  const dayOfWeekPt = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
  // Converter para a chave em inglês usada no banco de dados
  const dayOfWeek = dayMap[dayOfWeekPt] || format(date, 'EEEE').toLowerCase();
  
  return !!habit[dayOfWeek];
};

/**
 * Filter habits that are scheduled for a specific day
 */
export const getHabitsForDay = (habits: any[], date: Date): any[] => {
  if (!habits || !Array.isArray(habits)) return [];
  
  // Mapeamento dos dias em inglês para as chaves de propriedade
  const dayMap: Record<string, string> = {
    "segunda-feira": "monday",
    "terça-feira": "tuesday",
    "quarta-feira": "wednesday",
    "quinta-feira": "thursday",
    "sexta-feira": "friday",
    "sábado": "saturday",
    "domingo": "sunday"
  };
  
  // Obter o nome do dia em português
  const dayOfWeekPt = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
  // Converter para a chave em inglês usada no banco de dados
  const dayOfWeek = dayMap[dayOfWeekPt] || format(date, 'EEEE').toLowerCase();
  
  return habits.filter(habit => !!habit[dayOfWeek]);
};

/**
 * Calculate the completion rate for a habit
 */
export const calculateCompletionRate = (
  completions: any[], 
  totalDays: number
): { completed: number; rate: number } => {
  if (!completions || !Array.isArray(completions)) {
    return { completed: 0, rate: 0 };
  }
  
  const completed = completions.filter(c => c.completed).length;
  const rate = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
  
  return { completed, rate };
};

/**
 * Format habit time to 24h format (Brazil standard)
 */
export const formatHabitTime = (timeString: string): string => {
  if (!timeString) return "";
  
  const [hours, minutes] = timeString.split(':');
  const time = new Date();
  time.setHours(parseInt(hours), parseInt(minutes));
  
  return time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get day letter from day name (Portuguese version)
 */
export const getDayLetter = (day: string): string => {
  switch (day) {
    case 'monday': return 'S';    // Segunda
    case 'tuesday': return 'T';   // Terça
    case 'wednesday': return 'Qa'; // Quarta
    case 'thursday': return 'Qi'; // Quinta
    case 'friday': return 'Sx';   // Sexta
    case 'saturday': return 'Sb'; // Sábado
    case 'sunday': return 'D';    // Domingo
    default: return '';
  }
};

/**
 * Get active days for a habit as array of letters (Portuguese version)
 */
export const getActiveDaysLetters = (habit: any): string[] => {
  if (!habit) return [];
  
  const days = [
    { name: 'monday', letter: 'S' },     // Segunda
    { name: 'tuesday', letter: 'T' },    // Terça
    { name: 'wednesday', letter: 'Qa' }, // Quarta
    { name: 'thursday', letter: 'Qi' },  // Quinta
    { name: 'friday', letter: 'Sx' },    // Sexta
    { name: 'saturday', letter: 'Sb' },  // Sábado
    { name: 'sunday', letter: 'D' }      // Domingo
  ];
  
  return days
    .filter(day => habit[day.name])
    .map(day => day.letter);
};
