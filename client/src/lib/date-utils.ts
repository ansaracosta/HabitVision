import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  subDays, 
  isSameDay,
  isToday,
  parseISO,
  isAfter,
  isBefore
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Get formatted date string
 */
export const formatDate = (date: Date | string, formatString: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

/**
 * Get formatted date string in Brazilian format (dd/MM/yyyy)
 */
export const formatDateBr = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Get today's date as a string
 */
export const getToday = (formatString: string = 'yyyy-MM-dd'): string => {
  return format(new Date(), formatString);
};

/**
 * Format time to 24h format (more common in Brazil)
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return format(date, 'HH:mm');
};

/**
 * Get array of days for the current week
 */
export const getWeekDays = (startDate?: Date): { 
  date: Date;
  dateString: string;
  day: string;
  shortDay: string;
  isToday: boolean;
}[] => {
  const today = new Date();
  const start = startDate || startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  
  return Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(start, index);
    return {
      date,
      dateString: format(date, 'yyyy-MM-dd'),
      day: format(date, 'd'),
      shortDay: format(date, 'EEE', { locale: ptBR }),
      isToday: isSameDay(date, today)
    };
  });
};

/**
 * Get date range for a specific timeframe
 */
export const getDateRangeForTimeframe = (timeframe: 'day' | 'week' | 'month' | 'year'): {
  startDate: string;
  endDate: string;
} => {
  const today = new Date();
  
  switch (timeframe) {
    case 'day':
      return {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
    case 'week':
      return {
        startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      };
    case 'month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd')
      };
    case 'year':
      return {
        startDate: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'),
        endDate: format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd')
      };
    default:
      return {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
  }
};

/**
 * Format duration in minutes to readable format (1h 30min)
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};
