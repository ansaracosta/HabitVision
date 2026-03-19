import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const initials = user
    ? [user.firstName, user.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join("") || (user.email?.[0].toUpperCase() ?? "U")
    : "U";

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Usuário"
    : "Usuário";

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary cursor-pointer">HabiTracker</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <Button className="hidden md:block bg-primary text-white" asChild>
            <Link href="/habits">+ Novo Hábito</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-white text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-gray-700 cursor-pointer"
              >
                <User className="h-4 w-4" />
                Perfil &amp; Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
