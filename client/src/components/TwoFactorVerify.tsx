import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { VITE_APP_LOGO } from "@/const";
import { Mail, Smartphone, QrCode, CheckCircle, AlertCircle } from "lucide-react";

type TwoFactorMethod = "email" | "sms" | "authenticator";

export default function TwoFactorVerify() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Obtener método de la URL
  const searchParams = new URLSearchParams(window.location.search);
  const method = (searchParams.get("method") || "email") as TwoFactorMethod;

  // Mock code para testing: 123456
  const MOCK_CODE = "123456";

  useEffect(() => {
    // Timer de expiración
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    // Cooldown de reenvío
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Auto-focus en primer campo
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Auto-verificar cuando se completa el código
    if (code.every((digit) => digit !== "")) {
      handleVerify();
    }
  }, [code]);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-tab al siguiente campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Volver al campo anterior si está vacío
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) return;

    setIsVerifying(true);
    setError("");

    // Simular verificación
    setTimeout(() => {
      if (enteredCode === MOCK_CODE) {
        // Código correcto
        if (trustDevice) {
          // Guardar dispositivo confiable en localStorage
          localStorage.setItem("trustedDevice", Date.now().toString());
        }
        // Mostrar éxito y redirigir
        setLocation("/two-factor-success");
      } else {
        // Código incorrecto
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);

        if (newAttempts === 0) {
          setError("Demasiados intentos. Por favor, intenta más tarde.");
          setTimeout(() => setLocation("/login"), 3000);
        } else {
          setError(`Código inválido. Te quedan ${newAttempts} intentos.`);
          setCode(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0 || timeLeft === 0) return;

    // Simular reenvío
    setResendCooldown(30);
    setTimeLeft(600); // Reiniciar timer
    setCode(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  const handleChangeMethod = () => {
    setLocation("/two-factor-select");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getMethodInfo = () => {
    switch (method) {
      case "email":
        return {
          icon: Mail,
          title: "Ingresa el código enviado",
          subtitle: "Hemos enviado un código de 6 dígitos a tu email",
        };
      case "sms":
        return {
          icon: Smartphone,
          title: "Ingresa el código enviado",
          subtitle: "Hemos enviado un SMS a tu teléfono",
        };
      case "authenticator":
        return {
          icon: QrCode,
          title: "Ingresa el código de tu app",
          subtitle:
            "Abre tu app Authenticator y copia el código de 6 dígitos",
        };
    }
  };

  const methodInfo = getMethodInfo();
  const Icon = methodInfo.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-[450px] bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-gray-900 mb-2">
            {methodInfo.title}
          </h1>
          <p className="text-sm text-gray-600">{methodInfo.subtitle}</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Code Inputs */}
        <div className="flex justify-center gap-2 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-10 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isVerifying || attemptsLeft === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          <p
            className={`text-sm font-medium ${
              timeLeft < 120 ? "text-red-600" : "text-gray-700"
            }`}
          >
            Código válido por: {formatTime(timeLeft)}
          </p>
        </div>

        {/* Resend Code */}
        {method !== "authenticator" && (
          <div className="text-center mb-4">
            {timeLeft === 0 ? (
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                Código expirado? Solicitar uno nuevo
              </button>
            ) : resendCooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Reenviar en {resendCooldown}s
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿No recibiste el código? Reenviar
              </button>
            )}
          </div>
        )}

        {/* Authenticator App Info */}
        {method === "authenticator" && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
            <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-xs text-gray-600">
              Google Authenticator, Authy, Microsoft Authenticator, etc
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
            >
              No tienes app? Descárgala
            </a>
          </div>
        )}

        {/* Trust Device */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Confiar en este dispositivo por 30 días
            </span>
          </label>
        </div>

        {/* Verify Button (only for authenticator) */}
        {method === "authenticator" && (
          <Button
            onClick={handleVerify}
            disabled={
              code.some((d) => !d) || isVerifying || attemptsLeft === 0
            }
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base mb-4 disabled:bg-gray-300"
          >
            {isVerifying ? "Verificando..." : "Verificar Código"}
          </Button>
        )}

        {/* Change Method */}
        <div className="text-center">
          <button
            onClick={handleChangeMethod}
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
          >
            {method === "authenticator"
              ? "Usar método diferente"
              : "Cambiar método de verificación"}
          </button>
        </div>

        {/* Testing Info */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 text-center">
            <strong>Código de prueba:</strong> 123456
          </p>
        </div>
      </div>
    </div>
  );
}