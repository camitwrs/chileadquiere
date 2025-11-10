import { useState } from "react";
import { Bell, Search, ChevronDown, User, Settings, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { mockNotifications, getUnreadCount } from "@/lib/notificationsData";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const unreadCount = getUnreadCount(mockNotifications);

  const searchResults = searchQuery.length > 2
    ? [
        { type: "Licitación", title: "Suministro de equipamiento médico", id: "#1234" },
        { type: "Proveedor", title: "TechSupply SpA", id: "PRV-456" },
        { type: "Orden", title: "Orden de compra #5678", id: "#5678" },
      ]
    : [];

  if (!user) return null;

  return (
    <header className="topbar h-16 bg-background border-b border-border flex items-center px-6 gap-4">
      {/* Left: Breadcrumbs */}
      {/* Left side - empty for now, breadcrumbs moved to separate component */}
      <div className="flex-1" />

      {/* Center: Global Search */}
      <div className="hidden md:block relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="globalSearch"
            type="text"
            placeholder="Buscar licitación, proveedor..."
            className="search search-input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 2);
            }}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 animate-fade-in-up">
            <div className="p-2 space-y-1">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{result.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.type} · {result.id}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <DropdownMenu>
      <DropdownMenuTrigger id="notifications" className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
        <Bell className="h-5 w-5 icon-bell" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Notificaciones</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {mockNotifications.slice(0, 4).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 cursor-pointer flex-col items-start gap-1",
                    !notification.read && "bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                        notification.type === "success" && "bg-green-500",
                        notification.type === "warning" && "bg-yellow-500",
                        notification.type === "error" && "bg-red-500",
                        notification.type === "info" && "bg-blue-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="px-4 py-3 text-center text-primary cursor-pointer">
              Ver todas las notificaciones
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
      <DropdownMenuTrigger id="userProfile" className="inline-flex items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9">
    <Avatar className="h-9 w-9">
      <AvatarImage src={(user as any).foto || getAvatarUrl(`${user.nombre} ${user.apellido}`)} alt={`${user.nombre} ${user.apellido}`} />
      <AvatarFallback>{user.nombre.charAt(0)}{user.apellido.charAt(0)}</AvatarFallback>
    </Avatar>
            <span className="hidden lg:inline text-sm font-medium">{user.nombre}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Lock className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
