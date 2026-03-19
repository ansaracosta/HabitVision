import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { habitCategories } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  time: z.string().optional(),
  duration: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  monday: z.boolean().default(true),
  tuesday: z.boolean().default(true),
  wednesday: z.boolean().default(true),
  thursday: z.boolean().default(true),
  friday: z.boolean().default(true),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
  notes: z.string().optional(),
});

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateHabitDialog({ open, onOpenChange }: CreateHabitDialogProps) {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<string[]>(["Seg", "Ter", "Qua", "Qui", "Sex"]);
  
  // Mapear abreviações de dias para nomes de campos do formulário
  const dayMap: Record<string, string> = {
    "Seg": "monday",       // Segunda
    "Ter": "tuesday",      // Terça
    "Qua": "wednesday",    // Quarta
    "Qui": "thursday",     // Quinta
    "Sex": "friday",       // Sexta
    "Sab": "saturday",     // Sábado
    "Dom": "sunday"        // Domingo
  };
  
  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      time: "",
      duration: undefined,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      notes: "",
    },
  });
  
  // Mutação para criar um hábito
  const createHabit = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/habits", {
        ...values,
        categoryId: parseInt(values.categoryId),
        userId: 1, // Código fixo para demonstração
      });
    },
    onSuccess: () => {
      // Reiniciar formulário e fechar diálogo
      form.reset();
      onOpenChange(false);
      
      // Invalidar consultas para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      
      toast({
        title: "Hábito criado",
        description: "Seu novo hábito foi criado com sucesso."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Falha ao criar hábito",
        description: "Ocorreu um erro ao criar seu hábito. Por favor, tente novamente."
      });
    }
  });

  // Manipular alterações nos dias
  const handleDaysChange = (value: string[]) => {
    setSelectedDays(value);
    
    // Primeiro atualizar todos os campos de dias para falso
    Object.values(dayMap).forEach((day) => {
      form.setValue(day as any, false);
    });
    
    // Depois definir os dias selecionados como verdadeiro
    value.forEach((abbr) => {
      const day = dayMap[abbr];
      if (day) {
        form.setValue(day as any, true);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Hábito</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => createHabit.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Meditação Matinal" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {habitCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="ex: 15" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormItem>
              <FormLabel>Repetir</FormLabel>
              <ToggleGroup 
                type="multiple" 
                variant="outline"
                value={selectedDays}
                onValueChange={handleDaysChange}
              >
                <ToggleGroupItem value="Seg" className="w-9 h-8" title="Segunda">S</ToggleGroupItem>
                <ToggleGroupItem value="Ter" className="w-9 h-8" title="Terça">T</ToggleGroupItem>
                <ToggleGroupItem value="Qua" className="w-9 h-8" title="Quarta">Qa</ToggleGroupItem>
                <ToggleGroupItem value="Qui" className="w-9 h-8" title="Quinta">Qi</ToggleGroupItem>
                <ToggleGroupItem value="Sex" className="w-9 h-8" title="Sexta">Sx</ToggleGroupItem>
                <ToggleGroupItem value="Sab" className="w-9 h-8" title="Sábado">Sb</ToggleGroupItem>
                <ToggleGroupItem value="Dom" className="w-9 h-8" title="Domingo">D</ToggleGroupItem>
              </ToggleGroup>
            </FormItem>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione quaisquer detalhes adicionais aqui..." 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-white"
                disabled={createHabit.isPending}
              >
                {createHabit.isPending ? "Criando..." : "Criar Hábito"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
