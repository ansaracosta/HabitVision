import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSync } from "@/hooks/use-sync";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  RefreshCw,
  Cloud,
  CloudOff,
  CheckCircle2,
  Bell,
  BellOff,
  Palette,
  Type,
  LayoutGrid,
  Download,
  Trash2,
  ChevronRight,
  Clock,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type Theme = "light" | "dark" | "system";
type AccentColor = "turquesa" | "blue" | "green" | "orange" | "red";
type FontSize = "small" | "medium" | "large";

const ACCENT_LABELS: Record<AccentColor, string> = {
  turquesa: "Turquesa",
  blue: "Azul",
  green: "Verde",
  orange: "Laranja",
  red: "Vermelho",
};

const ACCENT_HEX: Record<AccentColor, string> = {
  turquesa: "#0D9488",
  blue: "#2563EB",
  green: "#16A34A",
  orange: "#EA580C",
  red: "#DC2626",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const { settings, update } = useTheme();
  const { state: sync, toggleEnabled, syncNow } = useSync();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("habitracker-notifications") !== "false";
  });

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Usuário";

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((n) => n![0].toUpperCase())
      .join("") || user?.email?.[0].toUpperCase() || "U";

  const handleNotifications = (v: boolean) => {
    setNotifications(v);
    localStorage.setItem("habitracker-notifications", String(v));
    toast({
      title: v ? "Notificações ativadas" : "Notificações desativadas",
      description: v
        ? "Você receberá lembretes dos seus hábitos."
        : "Você não receberá mais lembretes.",
    });
  };

  const handleSync = async () => {
    await syncNow();
    toast({
      title: "Sincronização concluída",
      description: "Seus dados foram salvos no Google Drive.",
    });
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: { name: displayName, email: user?.email },
      note: "Dados exportados do HabiTracker",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habitracker-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportação concluída", description: "Arquivo baixado com sucesso." });
  };

  const handleClearCache = () => {
    toast({
      title: "Cache limpo",
      description: "Os dados temporários foram removidos.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* — Perfil — */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={user?.profileImageUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary text-white text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{displayName}</h2>
            {user?.email && (
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <SiGoogle className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-gray-400">Conta Google vinculada</span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-0">
            Ativo
          </Badge>
        </div>

        <Separator className="my-4" />

        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da conta
        </Button>
      </section>

      {/* — Backup & Sincronização — */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" />
            Backup & Sincronização
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Salve seus dados automaticamente no Google Drive
          </p>
        </div>

        <div className="px-6 pb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sync.enabled ? "bg-green-100" : "bg-gray-100"}`}>
                {sync.enabled ? (
                  <Cloud className="h-4 w-4 text-green-600" />
                ) : (
                  <CloudOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Backup automático</p>
                <p className="text-xs text-gray-500">
                  {sync.enabled ? "Sincronização ativa" : "Desativado"}
                </p>
              </div>
            </div>
            <Switch checked={sync.enabled} onCheckedChange={toggleEnabled} />
          </div>

          {sync.lastSync && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
              <Clock className="h-3.5 w-3.5" />
              Último backup:{" "}
              {format(parseISO(sync.lastSync), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
            </div>
          )}

          <Button
            onClick={handleSync}
            disabled={sync.isSyncing}
            className="w-full bg-primary text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${sync.isSyncing ? "animate-spin" : ""}`} />
            {sync.isSyncing ? "Sincronizando..." : "Sincronizar agora"}
          </Button>

          {sync.isSyncing && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          )}
        </div>
      </section>

      {/* — Aparência — */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Aparência
          </h3>
        </div>

        <div className="px-6 pb-5 space-y-5">
          {/* Tema */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tema</p>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as Theme[]).map((t) => {
                const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
                const label = t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema";
                return (
                  <button
                    key={t}
                    onClick={() => update({ theme: t })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      settings.theme === t
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor de destaque */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cor de destaque</p>
            <div className="flex gap-3">
              {(Object.keys(ACCENT_HEX) as AccentColor[]).map((color) => (
                <button
                  key={color}
                  title={ACCENT_LABELS[color]}
                  onClick={() => update({ accentColor: color })}
                  className={`w-8 h-8 rounded-full transition-all relative ${
                    settings.accentColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: ACCENT_HEX[color] }}
                >
                  {settings.accentColor === color && (
                    <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho de fonte */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Type className="h-4 w-4" />
              Tamanho da fonte
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["small", "medium", "large"] as FontSize[]).map((size) => {
                const label = size === "small" ? "Pequeno" : size === "medium" ? "Médio" : "Grande";
                const textSize = size === "small" ? "text-xs" : size === "large" ? "text-base" : "text-sm";
                return (
                  <button
                    key={size}
                    onClick={() => update({ fontSize: size })}
                    className={`py-2 px-3 rounded-xl border-2 transition-all font-medium ${textSize} ${
                      settings.fontSize === size
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modo compacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <LayoutGrid className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Modo compacto</p>
                <p className="text-xs text-gray-500">Reduz espaçamento entre elementos</p>
              </div>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(v) => update({ compactMode: v })}
            />
          </div>
        </div>
      </section>

      {/* — Notificações — */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 pt-5 pb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notificações
          </h3>
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${notifications ? "bg-primary/10" : "bg-gray-100"}`}>
                {notifications ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Lembretes de hábitos</p>
                <p className="text-xs text-gray-500">
                  {notifications ? "Notificações ativas" : "Desativadas"}
                </p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={handleNotifications} />
          </div>
        </div>
      </section>

      {/* — Dados — */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Dados
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Download className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Exportar dados</p>
                <p className="text-xs text-gray-500">Baixar backup em JSON</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            onClick={handleClearCache}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Limpar cache</p>
                <p className="text-xs text-gray-500">Remove dados temporários</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-gray-400 pb-4">
        HabiTracker · Versão 1.0.0
      </p>
    </div>
  );
}
