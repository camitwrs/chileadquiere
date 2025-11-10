import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { VITE_APP_LOGO } from "@/const";
import { Eye, EyeOff, Mail, ChevronLeft} from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("comprador");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Formato de email inválido");
    } else {
      setEmailError("");
    }
  };

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("");
      return;
    }
    if (value.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
    } else {
      setPasswordError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
    setLoginError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    setLoginError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (emailError || passwordError) {
      toast.error("Por favor corrige los errores antes de continuar");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(email, password, selectedRole);
    
    setIsLoading(false);

    if (success) {
      toast.success("¡Bienvenido!");
      setTimeout(() => {
        setLocation("/two-factor-select");
      }, 100);
    } else {
      setLoginError("Credenciales inválidas. Verifica tu email, contraseña y rol seleccionado.");
    }
  };

  const handleOAuthLogin = (provider: string) => {
    toast.info(`Inicio de sesión con ${provider} (simulado)`);
  };

  const fillDemoAccount = (role: UserRole) => {
    const demoAccounts = {
      administrador: "admin@example.com",
      comprador: "comprador@example.com",
      proveedor: "proveedor@example.com",
    };
    setEmail(demoAccounts[role]);
    setPassword("Test1234!");
    setSelectedRole(role);
    setEmailError("");
    setPasswordError("");
    setLoginError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background (Desktop only) */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden" // Añadimos relative y overflow-hidden
      >
        {/* Imagen de fondo con opacidad y efecto blur (opcional) */}
        <img 
          src="/fondo-iniciosesion.jpg" 
          alt="Fondo de inicio de sesión" 
          className="absolute inset-0 w-full h-full object-cover opacity-70" // Ajusta blur-sm y opacity-70 a tu gusto
        />

        {/* Degradado superpuesto para oscurecer la imagen y mantener la legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-900 to-slate-800 opacity-80"></div> 
          {/* Ajusta la opacidad según cuán visible quieras la imagen vs el degradado */}

        {/* Contenido del texto (aseguramos que esté sobre todo lo demás con z-10) */}
        <div className="text-white max-w-md relative z-10"> {/* Añadimos relative z-10 */}
          <h1 className="text-4xl font-bold mb-6">ChileAdquiere</h1>
          <p className="text-lg text-blue-100 mb-8">
            Plataforma de licitaciones públicas de Chile. Conectamos compradores y proveedores de manera transparente y eficiente.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full mt-2"></div>
              <p className="text-blue-100">Acceso a miles de licitaciones públicas</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full mt-2"></div>
              <p className="text-blue-100">Proceso transparente y seguro</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full mt-2"></div>
              <p className="text-blue-100">Gestión eficiente de proveedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-blue-700 lg:bg-none lg:bg-white">
  <div className="w-full max-w-[700px] bg-white rounded-lg p-6 sm:p-12 relative">
          
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
            <Button 
              size="sm" 
              asChild 
              className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm"
              disabled={isLoading}
            >
              <a href="/" className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1"/> Volver a inicio
              </a>
            </Button>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-sm text-gray-600">Accede a tu cuenta de ChileAdquiere</p>
          </div>

          {/* Login Error Banner */}
          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {loginError}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-6 space-y-2">
            <Label className="text-xs text-gray-700">Tipo de Usuario</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("comprador")}
                className={`h-10 rounded border-2 transition-all ${
                  selectedRole === "comprador"
                    ? "border-primary bg-blue-50 text-primary"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Comprador
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("proveedor")}
                className={`h-10 rounded border-2 transition-all ${
                  selectedRole === "proveedor"
                    ? "border-primary bg-blue-50 text-primary"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Proveedor
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-gray-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@empresa.cl"
                  value={email}
                  onChange={handleEmailChange}
                  className={`h-10 pl-10 border ${
                    emailError ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`h-10 pr-10 border ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
              {password && !passwordError && (
                <p className="text-xs text-green-600">✓ Contraseña válida</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-xs text-gray-700 cursor-pointer">
                Recuérdame en este dispositivo
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10  text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">O</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border border-gray-300 bg-white hover:bg-gray-50"
              onClick={() => handleOAuthLogin("Google")}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Iniciar con Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border border-gray-300 bg-white hover:bg-gray-50"
              onClick={() => handleOAuthLogin("Microsoft")}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Iniciar con Microsoft
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-600">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </a>
            </p>
          </div>

          {/* Demo Accounts Helper */}
          <div className="mt-6 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-medium">Cuentas de prueba:</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => fillDemoAccount("administrador")}
                className="text-xs text-primary hover:underline block"
              >
                admin@example.com (Admin)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("comprador")}
                className="text-xs text-primary hover:underline block"
              >
                comprador@example.com (Comprador)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("proveedor")}
                className="text-xs text-primary hover:underline block"
              >
                proveedor@example.com (Proveedor)
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
