import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Widget as WidgetType } from "@/lib/widgetData";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WidgetProps {
  widget: WidgetType;
  index: number;
}

export default function Widget({ widget, index }: WidgetProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderContent = () => {
    switch (widget.type) {
      case "kpi":
        return (
          <div className="space-y-2">
            <div className="text-4xl font-bold">{widget.data.value}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {widget.data.trend && getTrendIcon(widget.data.trend)}
              <span>{widget.data.change}</span>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="space-y-2">
            {widget.data.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-3">
            {widget.data.map((item: any, idx: number) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {idx < widget.data.length - 1 && (
                    <div className="w-px h-full bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "table":
        return (
          <div className="space-y-1">
            {widget.data.map((item: any) => (
              <div
                key={item.id}
                className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0 text-xs"
              >
                <span className="font-medium truncate">
                  {item.concepto || item.servicio}
                </span>
                <span className="text-muted-foreground truncate">
                  {item.monto || item.estado}
                </span>
                <span className="text-right text-muted-foreground">
                  {item.fecha || item.uptime}
                </span>
              </div>
            ))}
          </div>
        );

      case "chart":
        return (
          <div className="space-y-2">
            <div className="flex items-end justify-between h-32 gap-2 px-2">
              {widget.data.values.map((value: number, idx: number) => {
                const maxValue = Math.max(...widget.data.values);
                const heightPercentage = (value / maxValue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex items-end" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: `${heightPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {widget.data.labels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className="widget animate-fade-in-up hover:shadow-lg transition-all"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t", widget.color)} />
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{widget.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Actualizar</DropdownMenuItem>
              <DropdownMenuItem>Configurar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
