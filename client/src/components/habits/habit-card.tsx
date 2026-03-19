import { ZapIcon, CheckIcon, MoreVertical, Trash2 } from "lucide-react";
import { habitCategories } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: any;
  completion?: any;
  onToggleCompletion: (completed: boolean) => void;
  onDelete?: () => void;
  isDetailView?: boolean;
}

export default function HabitCard({ 
  habit, 
  completion, 
  onToggleCompletion, 
  onDelete,
  isDetailView = false 
}: HabitCardProps) {
  // Encontrar cor da categoria
  const category = habitCategories.find(c => c.id === habit.categoryId);
  const categoryColor = category?.color || "#6B7280";
  
  // Verificar se o hábito está concluído
  const isCompleted = completion?.completed || false;
  
  // Formatar hora e duração do hábito
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Tradução para dias da semana
  const diasSemana = {
    'monday': 'segunda',
    'tuesday': 'terça',
    'wednesday': 'quarta',
    'thursday': 'quinta',
    'friday': 'sexta',
    'saturday': 'sábado',
    'sunday': 'domingo'
  };
  
  return (
    <div className={cn(
      "border border-gray-200 rounded-lg bg-white p-4",
      isDetailView && "flex flex-col sm:flex-row sm:items-center justify-between"
    )}>
      <div className={isDetailView ? "w-full sm:w-3/4" : ""}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: categoryColor }}
            ></div>
            <h4 className="font-medium text-gray-900">{habit.name}</h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleCompletion(!isCompleted)}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                isCompleted 
                  ? "border-success bg-success text-white" 
                  : "border-gray-300 bg-white"
              )}
            >
              {isCompleted && <CheckIcon className="h-4 w-4" />}
            </button>
            
            {onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Hábito
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          {habit.time ? formatTime(habit.time) : "Qualquer hora"} {habit.duration ? `- ${habit.duration} min` : ""}
        </p>
        
        {!isDetailView && (
          <div className="flex items-center">
            <div className="flex items-center text-xs font-medium text-gray-500 mr-4">
              <ZapIcon className="h-4 w-4 mr-1 text-success" />
              <span>Sequência de 7 dias</span>
            </div>
            <div className="flex items-center text-xs font-medium text-gray-500">
              <CheckIcon className="h-4 w-4 mr-1 text-primary" />
              <span>24/30 dias</span>
            </div>
          </div>
        )}
        
        {isDetailView && habit.notes && (
          <p className="text-sm text-gray-600 mt-2">{habit.notes}</p>
        )}
      </div>
      
      {isDetailView && (
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2 text-xs">
          {Object.entries(diasSemana).map(([day, label]) => (
            <div 
              key={day}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                habit[day] ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
              )}
              title={label}
            >
              {label.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
