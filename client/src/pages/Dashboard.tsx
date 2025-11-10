import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Widget from "@/components/dashboard/Widget";
import { getWidgetsByRole } from "@/lib/widgetData";

export default function Dashboard() {
  const { user } = useAuth();
  const widgets = user ? getWidgetsByRole(user.rol) : [];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen ejecutivo de tu actividad en la plataforma
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget, index) => (
            <Widget key={widget.id} widget={widget} index={index} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
