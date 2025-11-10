import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistroProveedor from "./pages/RegistroProveedor";
import ForgotPassword from "./components/ForgotPassword";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";
import ResetSuccess from "./components/ResetSuccess";
import TwoFactorSelect from "./components/TwoFactorSelect";
import TwoFactorVerify from "./components/TwoFactorVerify";
import TwoFactorSuccess from "./components/TwoFactorSuccess";
import Oportunidades from "./pages/Oportunidades";
import LicitacionDetalle from "./pages/LicitacionDetalle";
import LicitacionDetalleComprador from "./pages/LicitacionDetalleComprador";
import OfferWizard from "./pages/OfferWizard";
import OfferSuccess from "./pages/OfferSuccess";
import LicitacionesComprador from "./pages/LicitacionesComprador";
import CrearLicitacion from "./pages/CrearLicitacion";
import OrdenesCompra from "./pages/OrdenesCompra";
import Proveedores from "./pages/Proveedores";
import Analytics from "./pages/Analytics";
import MessagingCenter from "./pages/MessagingCenter";
import MisOfertas from "./pages/MisOfertas";
import OrdenesRecibidas from "./pages/OrdenesRecibidas";
import MiEmpresa from "./pages/MiEmpresa";
import Facturacion from "./pages/Facturacion";
import Estadisticas from "./pages/Estadisticas";
import Documentos from "./pages/Documentos";
import MiPerfil from "./pages/MiPerfil";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
  <Route path="/oportunidades" component={Oportunidades} />
  <Route path="/oportunidades/:id" component={LicitacionDetalle} />
  <Route path="/mis-licitaciones/:id" component={LicitacionDetalleComprador} />
  <Route path="/ofertas/nueva-oferta" component={OfferWizard} />
  <Route path="/ofertas/nueva-oferta/:licitacionId" component={OfferWizard} />
  <Route path="/ofertas/exito/:offerId" component={OfferSuccess} />
      <Route path="/mis-licitaciones" component={LicitacionesComprador} />
       <Route path="/mis-licitaciones/nueva-licitacion" component={CrearLicitacion} />
      <Route path="/ordenes" component={OrdenesCompra} />
      <Route path="/proveedores" component={Proveedores} />
      <Route path="/analytics" component={Analytics} />
  <Route path="/mensajes" component={MessagingCenter} />
      <Route path="/documentos" component={Documentos} />
      <Route path="/mi-perfil" component={MiPerfil} />
  <Route path="/mis-ofertas" component={MisOfertas} />
  <Route path="/ordenes-recibidas" component={OrdenesRecibidas} />
  <Route path="/mi-empresa" component={MiEmpresa} />
  <Route path="/facturacion" component={Facturacion} />
  <Route path="/estadisticas" component={Estadisticas} />
      <Route path={"/404"} component={NotFound} />
       <Route path={"/register"} component={RegistroProveedor} />
       <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/reset-success" component={ResetSuccess} />
      <Route path="/two-factor-select" component={TwoFactorSelect} />
      <Route path="/two-factor-verify" component={TwoFactorVerify} />
      <Route path="/two-factor-success" component={TwoFactorSuccess} />

      
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;