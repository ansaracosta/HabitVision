import { CheckIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface StudySessionCardProps {
  session: any;
  topic: any;
  onToggleContent?: (contentId: number, completed: boolean) => void;
  onToggleSession?: (completed: boolean) => void;
}

export default function StudySessionCard({ 
  session, 
  topic, 
  onToggleContent, 
  onToggleSession 
}: StudySessionCardProps) {
  // Obter rótulo de status e cor
  const getStatusInfo = () => {
    if (session.completed) {
      return {
        label: "Concluído",
        className: "bg-green-100 text-green-800"
      };
    }
    
    const completedItems = session.content?.filter((item: any) => item.completed).length || 0;
    const totalItems = session.content?.length || 0;
    
    if (completedItems > 0 && completedItems < totalItems) {
      return {
        label: "Em andamento",
        className: "bg-indigo-100 text-indigo-800"
      };
    }
    
    return {
      label: "Não iniciado",
      className: "bg-gray-100 text-gray-800"
    };
  };
  
  const status = getStatusInfo();
  const topicColor = topic?.color || "#8B5CF6";
  
  // Calcular conteúdo concluído
  const completedContent = session.content?.filter((item: any) => item.completed).length || 0;
  const totalContent = session.content?.length || 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: topicColor }}
            ></div>
            <h4 className="font-medium text-gray-900">{topic?.name || "Sessão de Estudo"}</h4>
          </div>
          <p className="text-xs text-gray-500 mt-1">Sessão de {session.duration} min</p>
        </div>
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
          status.className
        )}>
          {status.label}
        </span>
      </div>
      
      <div className="mb-3">
        <h5 className="text-xs font-medium text-gray-700 mb-2">Conteúdo de Hoje</h5>
        {session.content && session.content.length > 0 ? (
          <ul className="space-y-1">
            {session.content.map((item: any) => (
              <li key={item.id} className="flex items-center text-sm text-gray-600">
                {onToggleContent ? (
                  <Checkbox 
                    id={`content-${item.id}`}
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      onToggleContent(item.id, checked as boolean)
                    }
                    className="mr-1.5 h-4 w-4"
                  />
                ) : (
                  <CheckIcon 
                    className={cn(
                      "h-4 w-4 mr-1.5", 
                      item.completed ? "text-success" : "text-gray-300"
                    )}
                  />
                )}
                {item.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum item de conteúdo definido.</p>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {session.completed 
            ? `${session.duration} min concluídos`
            : completedContent > 0 
              ? `${Math.floor(session.duration * (completedContent / totalContent))} min concluídos` 
              : "0 min concluídos"
          }
        </div>
        <span className={cn(
          "font-medium",
          session.completed ? "text-success" : 
          completedContent > 0 ? "text-secondary" : "text-gray-500"
        )}>
          {completedContent}/{totalContent} tópicos
        </span>
      </div>
      
      {onToggleSession && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleSession(!session.completed)}
            className={cn(
              "w-full py-1.5 rounded-md text-xs font-medium",
              session.completed
                ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                : "bg-secondary text-white hover:bg-secondary/90"
            )}
          >
            {session.completed ? "Marcar como Incompleto" : "Marcar como Concluído"}
          </button>
        </div>
      )}
    </div>
  );
}

export { StudySessionCard };
