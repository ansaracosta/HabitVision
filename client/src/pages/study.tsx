import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StudySessionCard } from "@/components/study/study-session-card";
import { PlusIcon, BookOpenIcon } from "lucide-react";
import { useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

const studySessionSchema = z.object({
  topicId: z.string(),
  date: z.string(),
  duration: z.string().default("60"),
  contentItems: z.array(z.string())
});

export default function Study() {
  const { toast } = useToast();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);

  const { data: studySessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/study-sessions'],
  });

  const { data: studyTopics } = useQuery({
    queryKey: ['/api/reference/study-topics'],
  });

  const { data: studyContent } = useQuery({
    queryKey: ['/api/reference/study-content'],
  });

  const sessionsWithContent = useQuery({
    queryKey: ['/api/study-sessions-with-content'],
    queryFn: async () => {
      if (!studySessions) return [];
      return Promise.all(
        studySessions.map(async (session: any) => {
          const response = await fetch(`/api/study-session-content/${session.id}`);
          const content = await response.json();
          return { ...session, content };
        })
      );
    },
    enabled: !!studySessions,
  });

  const form = useForm({
    resolver: zodResolver(studySessionSchema),
    defaultValues: {
      topicId: "",
      date: format(startOfToday(), 'yyyy-MM-dd'),
      duration: "60",
      contentItems: []
    }
  });

  const createSession = useMutation({
    mutationFn: async (values: z.infer<typeof studySessionSchema>) => {
      const sessionRes = await apiRequest("POST", "/api/study-sessions", {
        topicId: parseInt(values.topicId),
        date: values.date,
        duration: parseInt(values.duration),
        completed: false,
        userId: 1
      });
      const session = await sessionRes.json();
      await Promise.all(values.contentItems.map(content =>
        apiRequest("POST", "/api/study-session-content", {
          sessionId: session.id,
          content,
          completed: false
        })
      ));
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions-with-content'] });
      setIsCreateSessionOpen(false);
      toast({
        title: "Sessão de estudo criada",
        description: "Sua sessão de estudo foi agendada com sucesso."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Falha ao criar sessão",
        description: "Não foi possível criar a sessão de estudo. Tente novamente."
      });
    }
  });

  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, completed }: { sessionId: number, completed: boolean }) => {
      return apiRequest("PUT", `/api/study-sessions/${sessionId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions-with-content'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar sessão",
        description: "Não foi possível atualizar o status da sessão de estudo."
      });
    }
  });

  const updateContentStatus = useMutation({
    mutationFn: async ({ contentId, completed }: { contentId: number, completed: boolean }) => {
      return apiRequest("PUT", `/api/study-session-content/${contentId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions-with-content'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar conteúdo",
        description: "Não foi possível atualizar o status do conteúdo."
      });
    }
  });

  const groupedSessions = sessionsWithContent.data?.reduce((acc: any, session: any) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const [selectedTopic, setSelectedTopic] = useState("");
  const contentOptions = selectedTopic && studyContent ?
    studyContent[selectedTopic as keyof typeof studyContent] || [] : [];

  const hasData = !sessionsLoading && !sessionsWithContent.isLoading && sessionsWithContent.data?.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Planos de Estudo</h2>
          <p className="text-sm text-gray-500">Planos de aprendizado estruturados para seus estudos diários</p>
        </div>
        <div className="mt-3 md:mt-0">
          <Button onClick={() => setIsCreateSessionOpen(true)} className="bg-primary text-white">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Nova Sessão de Estudo
          </Button>
        </div>
      </div>

      {sessionsLoading || sessionsWithContent.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : hasData ? (
        <div className="space-y-6">
          {Object.entries(groupedSessions || {})
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, sessions]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  {format(new Date(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
                    <span className="ml-2 text-sm font-medium text-primary">(Hoje)</span>
                  }
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(sessions as any[]).map((session: any) => (
                    <StudySessionCard
                      key={session.id}
                      session={session}
                      topic={studyTopics?.find((t: any) => t.id === session.topicId)}
                      onToggleContent={(contentId, completed) =>
                        updateContentStatus.mutate({ contentId, completed })
                      }
                      onToggleSession={(completed) =>
                        updateSessionStatus.mutate({ sessionId: session.id, completed })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão de estudo ainda</h3>
          <p className="text-gray-500 mb-6">Crie sua primeira sessão de estudo para começar o aprendizado estruturado.</p>
          <Button onClick={() => setIsCreateSessionOpen(true)} className="bg-primary text-white">
            Criar Sessão de Estudo
          </Button>
        </div>
      )}

      <div className="lg:hidden fixed bottom-6 right-6">
        <Button
          onClick={() => setIsCreateSessionOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg"
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Sessão de Estudo</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => createSession.mutate(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="topicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tópico de Estudo</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const topic = studyTopics?.find((t: any) => t.id === parseInt(value))?.name || "";
                        setSelectedTopic(topic);
                        form.setValue("contentItems", []);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tópico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studyTopics?.map((topic: any) => (
                          <SelectItem key={topic.id} value={topic.id.toString()}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma data" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 7 }).map((_, index) => {
                          const date = addDays(startOfToday(), index);
                          return (
                            <SelectItem key={index} value={format(date, 'yyyy-MM-dd')}>
                              {index === 0 ? 'Hoje' : format(date, "EEEE, d 'de' MMM", { locale: ptBR })}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1h30</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentItems"
                render={() => (
                  <FormItem>
                    <FormLabel>Conteúdos</FormLabel>
                    <div className="border rounded-md p-3 space-y-2">
                      {contentOptions.length > 0 ? (
                        contentOptions.map((item: string) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={item}
                              onCheckedChange={(checked) => {
                                const currentItems = form.getValues().contentItems;
                                if (checked) {
                                  form.setValue("contentItems", [...currentItems, item]);
                                } else {
                                  form.setValue("contentItems", currentItems.filter(i => i !== item));
                                }
                              }}
                            />
                            <label htmlFor={item} className="text-sm">{item}</label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 py-2">
                          Selecione um tópico para ver os conteúdos disponíveis
                        </p>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateSessionOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-white" disabled={createSession.isPending}>
                  {createSession.isPending ? "Criando..." : "Criar Sessão"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
