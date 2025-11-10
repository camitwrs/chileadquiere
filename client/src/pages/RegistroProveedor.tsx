import React, { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import OnboardingProvider, { useOnboarding } from "@/contexts/OnboardingContext";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

// Simple validators
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d[\d\s\-]{6,}$/;

function cleanRut(rut = "") {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

function validateRut(rut: string) {
  if (!rut) return false;
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dvCalc === dv;
}

type FilePayload = { file?: File | null; error?: string } | null;

interface FileDropProps {
  label: string;
  accept?: string[];
  maxMB?: number;
  value?: FilePayload | { name?: string; size?: number } | null;
  onChange: (payload: FilePayload) => void;
}

const FileDrop: FC<FileDropProps> = ({ label, accept = ["application/pdf", "image/png", "image/jpeg"], maxMB = 5, value, onChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size / 1024 / 1024 > maxMB) {
      onChange({ error: `El archivo supera ${maxMB}MB` });
      return;
    }
    if (!accept.includes(f.type)) {
      onChange({ error: "Formato no permitido" });
      return;
    }
    onChange({ file: f });
  };

  useEffect(() => {
    // create preview URL for images
    if (value && (value as any).file && (value as any).file.type && (value as any).file.type.startsWith('image/')) {
      const url = URL.createObjectURL((value as any).file as File);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  return (
    <div>
      <label className="text-xs text-gray-700 mb-2 block">{label}</label>
      <div
          className={`w-full h-40 flex items-center justify-center p-4 border-2 rounded-md text-center cursor-pointer bg-gray-50 border-dashed ${dragOver ? "border-blue-500 bg-white" : "border-gray-300"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => { inputRef.current?.click(); }}
        >
        {previewUrl ? (
          <div className="flex flex-col items-center gap-2">
            <img src={previewUrl} alt="preview" className="max-h-32 object-contain" />
            <div className="text-sm text-green-700">✓ {(value as any).file.name} ({Math.round(((value as any).file.size || 0)/1024)} KB)</div>
          </div>
        ) : value && (value as any).name ? (
          <div className="text-sm text-green-700">✓ {(value as any).name} ({Math.round(((value as any).size || 0)/1024)} KB)</div>
        ) : (
          <div className="text-sm text-gray-600">Arrastra archivo aquí o haz clic para seleccionar<br/><span className="text-xs text-gray-400">PDF, JPG, PNG • hasta {maxMB}MB</span></div>
        )}
        <input ref={inputRef} type="file" accept={accept.join(",")} className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)} />
      </div>
      {value && (value as any).error && <p className="text-xs text-red-500 mt-1">{(value as any).error}</p>}
      {value && (value as any).file && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <span>{(value as any).file.name}</span>
          <button type="button" className="text-red-500 underline text-xs" onClick={() => onChange({ file: null })}>Eliminar</button>
        </div>
      )}
    </div>
  );
};

const Stepper: FC<{ step: number }> = ({ step }) => {
  const steps = [
    "Información Básica",
    "Documentación",
    "Perfil Comercial",
    "Contacto",
    "Acceso",
    "Revisión",
  ];
  return (
    <div className="w-full py-4 px-2">
        
        <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto relative">
            {steps.map((s, i) => {
                const idx = i + 1;
                const status = idx < step ? "done" : idx === step ? "active" : "todo";
                
                // Círculos (w-12 h-12)
                const circleClasses = `w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg shrink-0 transition duration-200
                    ${status === 'done' 
                        ? 'bg-primary text-white' 
                        : status === 'active' 
                            ? 'bg-primary text-white border-2 border-bg-blue-600' 
                            : 'bg-white border-2 border-gray-300 text-gray-500'}`;
                
                // Clases del Texto
                const textClasses = `text-xs font-bold text-center 
                    ${status !== 'todo' ? 'text-white' : 'text-gray-300'}`;
                
                    
                return (
                    <div key={s} className="flex-1 flex flex-col items-center relative">
                        
                        {/* 1. Línea de Conexión (Mitad Izquierda) - Refleja el estado del PASO ANTERIOR */}
                        {i !== 0 && (
                            <div className={`absolute top-[23px] -left-1/2 w-1/2 h-1 transition duration-200
                                ${idx <= step // Si el paso anterior (idx-1) está completado (o es el paso actual)
                                    ? 'bg-primary' // Siempre azul si el paso anterior fue completado
                                    : 'bg-gray-300' // Si el paso anterior no se ha completado
                                }`}>
                            </div>
                        )}
                        
                        {/* 2. Contenido del Paso (Círculo y Texto) */}
                        <div className="flex flex-col items-center gap-1 shrink-0 px-1 relative z-10">
                            {/* Círculo del Paso */}
                            <div className={circleClasses}>
                                {status === 'done' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    idx
                                )}
                            </div>
                            {/* Etiqueta de texto */}
                            <div className={textClasses}>{s}</div>
                        </div>

                        {/* 3. Línea de Conexión (Mitad Derecha) - Refleja si el PASO ACTUAL está completado o no */}
                        {i < steps.length - 1 && (
                            <div className={`absolute top-[23px] -right-1/2 w-1/2 h-1 transition duration-200
                                ${idx < step // Si el paso actual ya se completó
                                    ? 'bg-primary'
                                    : 'bg-gray-300' // Si es el paso actual o un paso futuro
                                }`}>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        
        {/* Vista Móvil (Simplificada) */}
        <div className="md:hidden text-center my-2 w-full pt-2">
            <div className="text-base font-semibold text-bg-blue-600">{steps[step - 1]}</div>
            <div className="text-sm text-gray-500">Paso {step} de {steps.length}</div>
        </div>
    </div>
  );
};
// Small helper component to log mount/unmount and reference identity for Step1
const Step1MountLogger: FC = () => {
  const rutInputRefLocal = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    console.log('[RegistroProveedor] Step1 mounted');
    return () => console.log('[RegistroProveedor] Step1 unmounted');
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      const el = document.querySelector('input[placeholder*="12.345"]') as HTMLInputElement | null;
      if (el) {
        // log identity and cursor position
        console.log('[RegistroProveedor] observed input element', { el, selectionStart: el.selectionStart });
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return null;
};

// Top-level Step1 component (moved out of RegistroInner to preserve identity between renders)
const Step1Component: FC<{
  localBasic: any;
  setLocalBasic: (v: any) => void;
  errors: Record<string,string>;
  setBasicInfo: (v: any) => void;
  state: any;
  goNext: () => void;
}> = ({ localBasic, setLocalBasic, errors, setBasicInfo, state, goNext }) => {
  const personType = localBasic.personType;
  // per-render log
  useEffect(() => { console.log('[RegistroProveedor] Step1 render (top-level)', { rut: localBasic.rut }); });
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Encabezado del Paso - Estilo Minimalista y Profesional */}
        <header className="mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Información Básica del Proveedor
            </h3>
            <span className="text-sm font-medium text-primary mt-1 block uppercase">
                Paso 1 de 6
            </span>
        </header>

        <Step1MountLogger />
        
        {/* Selector Tipo de Persona - Diseño Elevado */}
        <div className="mb-8">
            <label className="text-sm font-medium text-gray-700 block mb-3">
                Tipo de Persona <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
                <label 
                    className={`
                        flex-1 
                        py-3 px-4 rounded-lg 
                        border transition duration-200 cursor-pointer 
                        text-sm font-medium text-center
                        ${
                            personType === 'natural' 
                                ? 'border-primary bg-blue-50 text-primary shadow-sm ring-2 ring-blue-500/50' 
                                : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400'
                        }
                    `}
                >
                    <input 
                        type="radio" 
                        name="personType" 
                        value="natural" 
                        checked={personType === 'natural'} 
                        onChange={() => setLocalBasic({ ...localBasic, personType: 'natural', razonSocial: '' })} 
                        className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    /> 
                    Persona Natural
                </label>
                <label 
                    className={`
                        flex-1 
                        py-3 px-4 rounded-lg 
                        border transition duration-200 cursor-pointer 
                        text-sm font-medium text-center
                        ${
                            personType === 'juridica' 
                                ? 'border-primary bg-blue-50 text-primary shadow-sm ring-2 ring-blue-500/50' 
                                : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400'
                        }
                    `}
                >
                    <input 
                        type="radio" 
                        name="personType" 
                        value="juridica" 
                        checked={personType === 'juridica'} 
                        onChange={() => setLocalBasic({ ...localBasic, personType: 'juridica', nombre: '', fechaNacimiento: '' })} 
                        className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                    /> 
                    Persona Jurídica
                </label>
            </div>
        </div>

        {/* Grid de Campos de Formulario - Minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            
            {/* Campo RUT */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">RUT <span className="text-red-600">*</span></label>
                <input 
                    value={localBasic.rut} 
                    onChange={(e) => setLocalBasic({ ...localBasic, rut: e.target.value })} 
                    onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                    placeholder={personType === 'natural' ? '12.345.678-K' : '76.012.345-K'} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
                {errors.rut && <p className="text-xs text-red-600 mt-1">{errors.rut}</p>}
            </div>
            
            {/* Campo Nombre / Razón Social (Condicional) */}
            {personType === 'natural' ? (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Nombre Completo <span className="text-red-600">*</span></label>
                    <input 
                        value={localBasic.nombre} 
                        onChange={(e) => setLocalBasic({ ...localBasic, nombre: e.target.value })} 
                        onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                        placeholder="Juan García" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                    {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                </div>
            ) : (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Razón Social <span className="text-red-600">*</span></label>
                    <input 
                        value={localBasic.razonSocial} 
                        onChange={(e) => setLocalBasic({ ...localBasic, razonSocial: e.target.value })} 
                        onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                        placeholder="Mi Empresa SpA" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                    {errors.razonSocial && <p className="text-xs text-red-600 mt-1">{errors.razonSocial}</p>}
                </div>
            )}

            {/* Campo Fecha Nacimiento (Solo Natural) */}
            {personType === 'natural' && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Fecha Nacimiento <span className="text-red-600">*</span></label>
                    <input 
                        type="date" 
                        value={localBasic.fechaNacimiento} 
                        onChange={(e) => setLocalBasic({ ...localBasic, fechaNacimiento: e.target.value })} 
                        onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                    {errors.fechaNacimiento && <p className="text-xs text-red-600 mt-1">{errors.fechaNacimiento}</p>}
                </div>
            )}

            {/* Campo Email */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                <input 
                    value={localBasic.email} 
                    onChange={(e) => setLocalBasic({ ...localBasic, email: e.target.value })} 
                    onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                    placeholder="email@empresa.cl" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Campo Teléfono */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Teléfono</label>
                <input 
                    value={localBasic.telefono} 
                    onChange={(e) => setLocalBasic({ ...localBasic, telefono: e.target.value })} 
                    onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                    placeholder="9 1234 5678" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
                {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
            </div>

            {/* Campos Adicionales (Solo Jurídica) */}
            {personType === 'juridica' && (
                <>
                    {/* Campo Sitio Web */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Sitio Web</label>
                        <input 
                            value={localBasic.sitioWeb} 
                            onChange={(e) => setLocalBasic({ ...localBasic, sitioWeb: e.target.value })} 
                            onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                            placeholder="www.empresa.cl" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                        />
                    </div>
                    
                    {/* Campo Industria (Select) */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Industria <span className="text-red-600">*</span></label>
                        <select 
                            value={localBasic.industria} 
                            onChange={(e) => setLocalBasic({ ...localBasic, industria: e.target.value })} 
                            onBlur={() => setBasicInfo({ ...state.basicInfo, ...localBasic })} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        >
                            <option value="" disabled>Selecciona una industria...</option>
                            <option>Tecnología</option>
                            <option>Servicios</option>
                            <option>Productos</option>
                            <option>Consultoría</option>
                            <option>Logística</option>
                        </select>
                        {errors.industria && <p className="text-xs text-red-600 mt-1">{errors.industria}</p>}
                    </div>
                </>
            )}
        </div>
        
        {/* Pie de Página y Botones de Navegación */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            
            {/* Botón Cancelar (Secundario) */}
            <button 
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition duration-150 p-2" 
                onClick={() => window.history.back()}
            >
                Cancelar
            </button>
            
            {/* Botón Siguiente (Primario) - Diseño moderno con gradiente refinado */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-primary text-white rounded-lg shadow-lg hover:from-primary hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold text-sm transition duration-200 transform hover:scale-[1.01]" 
                onClick={goNext}
            >
                Siguiente
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
        </div>

        {errors.general && (
            <div className="mt-6 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700 text-center font-medium">
                {errors.general}
            </div>
        )}
    </div>
  );
};

const RegistroInner: FC = () => {
  const { state, setBasicInfo, setDocuments, setCommercial, setContact, setSecurity } = useOnboarding();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<number>(1);

  // expose a temporary setter to allow child components to advance step synchronously
  useEffect(() => {
    (window as any).__registro_setStep = (s: number) => setStep(s);
    return () => { try { delete (window as any).__registro_setStep; } catch {} };
  }, []);

  // Local form state for step1 (use a single object to avoid re-renders from context writes)
  const [localBasic, setLocalBasic] = useState(() => ({
    personType: state.basicInfo.personType || "natural",
    rut: state.basicInfo.rut || "",
    nombre: state.basicInfo.nombre || "",
    fechaNacimiento: state.basicInfo.fechaNacimiento || "",
    email: state.basicInfo.email || "",
    telefono: state.basicInfo.telefono || "",
    razonSocial: state.basicInfo.razonSocial || "",
    sitioWeb: state.basicInfo.sitioWeb || "",
    industria: state.basicInfo.industria || "",
  }));
  const personType = localBasic.personType;

  useEffect(() => {
    // sync initial context values into localBasic
    setLocalBasic((lb) => ({ ...lb, ...(state.basicInfo || {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepErrorsMap, setStepErrorsMap] = useState<Record<number, string | undefined>>({});

  // (initial sync already performed above)

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!localBasic.personType) errs.personType = "Seleccione tipo de persona";
    if (!localBasic.rut || !validateRut(localBasic.rut)) errs.rut = "RUT inválido";
    if (localBasic.personType === "natural") {
      if (!localBasic.nombre) errs.nombre = "Requerido";
      if (!localBasic.fechaNacimiento) errs.fechaNacimiento = "Requerido";
    } else {
      if (!localBasic.razonSocial) errs.razonSocial = "Requerido";
    }
    if (!localBasic.email || !emailRegex.test(localBasic.email)) errs.email = "Email inválido";
    if (localBasic.telefono && !phoneRegex.test(localBasic.telefono)) errs.telefono = "Teléfono inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      // persist local basic into context
      setBasicInfo({
        personType: localBasic.personType,
        rut: localBasic.rut,
        nombre: localBasic.nombre,
        fechaNacimiento: localBasic.fechaNacimiento,
        email: localBasic.email,
        telefono: localBasic.telefono,
        razonSocial: localBasic.razonSocial,
        sitioWeb: localBasic.sitioWeb,
        industria: localBasic.industria,
      });
      setStep(2);
      return;
    }
    if (step === 2) {
      const required = ["rutDoc", "ciFrente", "ciDorso", "certificadoVigencia"];
      if (personType === "juridica") required.push("actaConstitucion");
      const missing = required.filter((k) => !state.documents[k]);
      if (missing.length) {
        setStepErrorsMap((s) => ({ ...s, 2: "Por favor sube todos los documentos requeridos" }));
        return;
      }
      setStepErrorsMap((s) => ({ ...s, 2: undefined }));
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!state.commercial.rubros || state.commercial.rubros.length === 0) {
        setStepErrorsMap((s) => ({ ...s, 3: "Seleccione al menos un rubro" }));
        return;
      }
      setStepErrorsMap((s) => ({ ...s, 3: undefined }));
      setStep(4);
      return;
    }
    if (step === 4) {
      if (!state.contact.contactoNombre || !state.contact.contactoEmail) {
        setStepErrorsMap((s) => ({ ...s, 4: "Complete contacto principal" }));
        return;
      }
      setStepErrorsMap((s) => ({ ...s, 4: undefined }));
      setStep(5);
      return;
    }
    if (step === 5) {
      if (!state.security.username || !state.security.password || !state.security.acceptedTerms || !state.security.acceptedPrivacy) {
        setStepErrorsMap((s) => ({ ...s, 5: "Complete configuración de acceso y acepte términos" }));
        return;
      }
      setStepErrorsMap((s) => ({ ...s, 5: undefined }));
      setStep(6);
      return;
    }
  };

  const goPrev = () => { if (step > 1) setStep(step - 1); };

  // --- Step renderers (Step1 moved to top-level to avoid remounts) ---

  const Step2: FC = () => {
    const docLabels: Record<string,string> = {
      rutDoc: 'Copia de RUT',
      ciFrente: 'Cédula/Carnet - Frente',
      ciDorso: 'Cédula/Carnet - Dorso',
      certificadoVigencia: 'Certificado de Vigencia',
      actaConstitucion: 'Acta de Constitución',
    };
    const docKeys = useMemo(()=>{
      const base = ["rutDoc","ciFrente","ciDorso","certificadoVigencia"];
      if (personType==='juridica') base.push("actaConstitucion");
      return base;
    }, [personType]);

    const onFileChange = (key: string, payload: FilePayload) => {
      const current = { ...state.documents } as Record<string, File>;
      if (payload && payload.file) current[key] = payload.file;
      if (payload && payload.file === null) delete current[key];
      setDocuments(current);
    };

    return (
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
          
          {/* Encabezado del Paso - Estilo Minimalista y Profesional */}
          <header className="mb-8 border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  Documentación Legal Requerida
              </h3>
              <span className="text-sm font-medium text-primary mt-1 block uppercase">
                  Paso 2 de 6
              </span>
          </header>

          {/* Mensaje de Error General */}
          {stepErrorsMap[2] && (
              <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700 font-medium">
                  {stepErrorsMap[2]}
              </div>
          )}

          {/* Grid de Carga de Archivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {docKeys.map(k => (
                  <div key={k} className="space-y-1">
                      {/* 1. Etiqueta Externa Visible (Mantiene la consistencia de formulario) */}
                      <label className="text-xs font-medium text-gray-700 block mb-1">{docLabels[k] || k}</label>
                      <FileDrop 
                          // 2. Pasar label="" para satisfacer el requerimiento de TypeScript (código 2741)
                          // y evitar que FileDrop muestre una etiqueta duplicada.
                          label={""} 
                          value={state.documents[k] ? { file: state.documents[k] } : null} 
                          onChange={(p) => onFileChange(k, p)} 
                      />
                  </div>
              ))}
          </div>

          {/* Pie de Página y Botones de Navegación */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
              
              {/* Botón Anterior (Secundario) */}
              <button 
                  className="inline-flex items-center h-10 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-sm transition duration-150" 
                  onClick={goPrev}
              >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Anterior
              </button>
              
              {/* Botón Siguiente (Primario) */}
              <button 
                  className="inline-flex items-center h-10 px-5 bg-primary text-white rounded-lg shadow-lg hover:from-primary hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold text-sm transition duration-200 transform hover:scale-[1.01]" 
                  onClick={goNext}
              >
                  Siguiente
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
          </div>
      </div>
  );
  };


  const Step3: FC = () => {
    const rubros = ["Tecnología","Servicios","Productos","Consultoría","Logística","Otro"];
    const certs = ["ISO 9001","ISO 27001","ISO 45001","Otra"];

    // local state to avoid frequent context updates while typing
    const [localCommercial, setLocalCommercial] = useState(() => ({
      rubros: state.commercial.rubros || [],
      otroRubro: (state.commercial.rubros || []).find((r: string) => !["Tecnología","Servicios","Productos","Consultoría","Logística","Otro"].includes(r)) || "",
      experienciaAnios: state.commercial.experienciaAnios || 1,
      empleados: state.commercial.empleados || "",
      facturacion: state.commercial.facturacion || "",
      certificaciones: state.commercial.certificaciones || [],
      descripcion: state.commercial.descripcion || "",
    }));

    useEffect(() => {
      // sync when component mounts / context changes
      setLocalCommercial({
        rubros: state.commercial.rubros || [],
        otroRubro: (state.commercial.rubros || []).find((r: string) => !["Tecnología","Servicios","Productos","Consultoría","Logística","Otro"].includes(r)) || "",
        experienciaAnios: state.commercial.experienciaAnios || 1,
        empleados: state.commercial.empleados || "",
        facturacion: state.commercial.facturacion || "",
        certificaciones: state.commercial.certificaciones || [],
        descripcion: state.commercial.descripcion || "",
      });
    }, [state.commercial]);

    const toggleRubro = (r: string) => {
      setLocalCommercial((c) => {
        const current = c.rubros || [];
        const next = current.includes(r) ? current.filter(x => x !== r) : (current.length < 5 ? [...current, r] : current);
        return { ...c, rubros: next };
      });
    };

    const toggleCert = (cName: string) => {
      setLocalCommercial((c) => {
        const current = c.certificaciones || [];
        const next = current.includes(cName) ? current.filter(x => x !== cName) : [...current, cName];
        return { ...c, certificaciones: next };
      });
    };

    const persistCommercial = () => {
      // replace 'Otro' with provided otroRubro if available
      const rubrosToSave = (localCommercial.rubros || []).map((r: string) => (r === 'Otro' && localCommercial.otroRubro ? localCommercial.otroRubro : r));
      setCommercial({ ...localCommercial, rubros: rubrosToSave } as any);
    };

    return (
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Encabezado del Paso - Estilo Minimalista y Profesional */}
        <header className="mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Perfil Comercial
            </h3>
            <span className="text-sm font-medium text-primary mt-1 block uppercase">
                Paso 3 de 6
            </span>
        </header>

        {/* Mensaje de Error General */}
        {stepErrorsMap[3] && (
            <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700 font-medium">
                {stepErrorsMap[3]}
            </div>
        )}

        {/* Sección: Rubros Principales (Checkbox Grid) */}
        <div className="mb-8 space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
                Rubros Principales <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
                {rubros.map(r => (
                    <label 
                        key={r} 
                        className={`
                            flex items-center p-3 border rounded-lg cursor-pointer text-sm font-medium transition duration-150
                            ${localCommercial.rubros && localCommercial.rubros.includes(r) 
                                ? 'bg-blue-50 border-primary text-primary shadow-sm' 
                                : 'border-gray-300 text-gray-700 hover:border-blue-400'
                            }`}
                    >
                        <input 
                            type="checkbox" 
                            className="mr-3 h-4 w-4 text-primary border-gray-300 focus:ring-blue-500 rounded" 
                            checked={localCommercial.rubros && localCommercial.rubros.includes(r)} 
                            onChange={() => toggleRubro(r)} 
                        />
                        {r}
                    </label>
                ))}
            </div>
            {localCommercial.rubros && localCommercial.rubros.includes('Otro') && (
                <input 
                    className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    placeholder="Especifica otro rubro" 
                    value={localCommercial.otroRubro || ""} 
                    onChange={(e) => setLocalCommercial({ ...localCommercial, otroRubro: e.target.value })} 
                />
            )}
        </div>
        
        {/* Grid de Datos Cuantitativos (Experiencia, Empleados, Facturación) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Campo Experiencia */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Experiencia en Años <span className="text-red-600">*</span></label>
                <input 
                    type="number" 
                    min={1} 
                    max={50} 
                    value={localCommercial.experienciaAnios || 1} 
                    onChange={(e) => setLocalCommercial({ ...localCommercial, experienciaAnios: Number(e.target.value) })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
            </div>
            
            {/* Campo Empleados */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Empleados <span className="text-red-600">*</span></label>
                <select 
                    value={localCommercial.empleados || ""} 
                    onChange={(e) => setLocalCommercial({ ...localCommercial, empleados: e.target.value })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                    <option value="" disabled>Selecciona...</option>
                    <option>1-5</option>
                    <option>6-20</option>
                    <option>21-50</option>
                    <option>51-100</option>
                    <option>&gt;100</option>
                </select>
            </div>
            
            {/* Campo Facturación */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Facturación Anual <span className="text-red-600">*</span></label>
                <select 
                    value={localCommercial.facturacion || ""} 
                    onChange={(e) => setLocalCommercial({ ...localCommercial, facturacion: e.target.value })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                    <option value="" disabled>Selecciona...</option>
                    <option>&lt;$1M</option>
                    <option>$1M-$5M</option>
                    <option>$5M-$10M</option>
                    <option>$10M-$50M</option>
                    <option>&gt;$50M</option>
                </select>
            </div>
        </div>

        {/* Sección: Certificaciones (Checkbox Grid) */}
        <div className="mb-8 space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Certificaciones</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
                {certs.map(c => (
                    <label 
                        key={c} 
                        className={`
                            flex items-center p-3 border rounded-lg cursor-pointer text-sm font-medium transition duration-150
                            ${localCommercial.certificaciones && localCommercial.certificaciones.includes(c) 
                                ? 'bg-blue-50 border-primary text-primary shadow-sm' 
                                : 'border-gray-300 text-gray-700 hover:border-blue-400'
                            }`}
                    >
                        <input 
                            type="checkbox" 
                            className="mr-3 h-4 w-4 text-primary border-gray-300 focus:ring-blue-500 rounded" 
                            checked={localCommercial.certificaciones && localCommercial.certificaciones.includes(c)} 
                            onChange={() => toggleCert(c)} 
                        />
                        {c}
                    </label>
                ))}
            </div>
            {localCommercial.certificaciones && localCommercial.certificaciones.includes('Otra') && (
                <input 
                    className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    placeholder="Especificar otra certificación" 
                    value={localCommercial.descripcion || ""} 
                    onChange={(e) => setLocalCommercial({ ...localCommercial, descripcion: e.target.value })} 
                />
            )}
        </div>

        {/* Sección: Descripción del Negocio (Textarea) */}
        <div className="mt-4 space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Descripción del Negocio</label>
            <textarea 
                maxLength={500} 
                value={localCommercial.descripcion || ""} 
                onChange={(e) => setLocalCommercial({ ...localCommercial, descripcion: e.target.value })} 
                placeholder="Cuéntanos sobre tu empresa, especialidades, etc" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 h-24" 
            />
            <div className="text-xs text-gray-500 text-right">
                {(localCommercial.descripcion || "").length}/500
            </div>
        </div>

        {/* Pie de Página y Botones de Navegación */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            
            {/* Botón Anterior (Secundario) */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-sm transition duration-150" 
                onClick={goPrev}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Anterior
            </button>
            
            {/* Botón Siguiente (Primario) */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-primary text-white rounded-lg shadow-lg hover:from-primary hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold text-sm transition duration-200 transform hover:scale-[1.01]" 
                onClick={() => {
                    // Lógica de validación mantenida
                    if (!localCommercial.rubros || localCommercial.rubros.length === 0) {
                        setStepErrorsMap((s) => ({ ...s, 3: 'Seleccione al menos un rubro' }));
                        return;
                    }
                    setStepErrorsMap((s) => ({ ...s, 3: undefined }));
                    persistCommercial();
                    (window as any).__registro_setStep?.(4);
                }}
            >
                Siguiente
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
        </div>
    </div>
  );
  };

  const Step4: FC = () => {
    const regions = ["Región Metropolitana","Valparaíso","Biobío","Araucanía"];

    // local state for contact to avoid focus loss while typing
    const [localContact, setLocalContact] = useState(() => ({ ...(state.contact || {}) }));

    useEffect(()=>{
      setLocalContact({ ...(state.contact || {}) });
    }, [state.contact]);

    const updateContact = (data: Partial<any>) => setLocalContact((c)=>({ ...(c||{}), ...data }));

    const persistContact = () => setContact(localContact as any);

    return (
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Encabezado del Paso - Estilo Minimalista y Profesional */}
        <header className="mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Contacto y Representación Legal
            </h3>
            <span className="text-sm font-medium text-primary mt-1 block uppercase">
                Paso 4 de 6
            </span>
        </header>

        {/* Sección: Contacto Principal */}
        <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                Contacto Principal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Nota: Se han añadido las etiquetas de campo como en los pasos anteriores para mejor usabilidad */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Nombre completo <span className="text-red-600">*</span></label>
                    <input 
                        placeholder="Nombre completo" 
                        value={localContact.contactoNombre || ""} 
                        onChange={(e) => updateContact({ contactoNombre: e.target.value })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                    <input 
                        placeholder="Email" 
                        value={localContact.contactoEmail || ""} 
                        onChange={(e) => updateContact({ contactoEmail: e.target.value })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Teléfono <span className="text-red-600">*</span></label>
                    <input 
                        placeholder="Teléfono" 
                        value={localContact.contactoTelefono || ""} 
                        onChange={(e) => updateContact({ contactoTelefono: e.target.value })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Cargo <span className="text-red-600">*</span></label>
                    <input 
                        placeholder="Cargo" 
                        value={localContact.contactoCargo || ""} 
                        onChange={(e) => updateContact({ contactoCargo: e.target.value })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
            </div>
        </div>

        {/* Sección: Representante Legal (Solo Jurídica) */}
        {personType === 'juridica' && (
            <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                    Representante Legal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Nombre completo <span className="text-red-600">*</span></label>
                        <input 
                            placeholder="Nombre completo" 
                            value={localContact.representanteNombre || ""} 
                            onChange={(e) => updateContact({ representanteNombre: e.target.value })} 
                            onBlur={persistContact} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                        <input 
                            placeholder="Email" 
                            value={localContact.representanteEmail || ""} 
                            onChange={(e) => updateContact({ representanteEmail: e.target.value })} 
                            onBlur={persistContact} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">RUT <span className="text-red-600">*</span></label>
                        <input 
                            placeholder="RUT" 
                            value={localContact.representanteRUT || ""} 
                            onChange={(e) => updateContact({ representanteRUT: e.target.value })} 
                            onBlur={persistContact} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                        />
                    </div>

                    {/* Checkbox con estilo minimalista */}
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-2">
                        <input 
                            type="checkbox" 
                            checked={!!localContact.representanteRUT} 
                            onChange={(e) => updateContact({ representanteRUT: e.target.checked ? localContact.representanteRUT : undefined })} 
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500" 
                        />
                        Estoy autorizado para actuar como representante legal
                    </label>
                </div>
                
                {/* Aviso Requerido */}
                {!state.contact.representanteRUT && 
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800 font-medium">
                        ⚠️ Aviso: Si no está autorizado, se requiere <strong>Poder Notarial</strong> cargado en el <strong>Paso 2</strong>.
                    </div>
                }
            </div>
        )}

        {/* Sección: Dirección de Facturación */}
        <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                Dirección de Facturación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Calle y Número <span className="text-red-600">*</span></label>
                    <input 
                        placeholder="Calle y Número" 
                        value={localContact.direccion?.calle || ""} 
                        onChange={(e) => updateContact({ direccion: { ...(localContact.direccion || {}), calle: e.target.value } })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Apartamento/Suite</label>
                    <input 
                        placeholder="Apartamento/Suite" 
                        value={localContact.direccion?.extra || ""} 
                        onChange={(e) => updateContact({ direccion: { ...(localContact.direccion || {}), extra: e.target.value } })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Ciudad <span className="text-red-600">*</span></label>
                    <input 
                        placeholder="Ciudad" 
                        value={localContact.direccion?.ciudad || ""} 
                        onChange={(e) => updateContact({ direccion: { ...(localContact.direccion || {}), ciudad: e.target.value } })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Región <span className="text-red-600">*</span></label>
                    <select 
                        value={localContact.direccion?.region || ""} 
                        onChange={(e) => updateContact({ direccion: { ...(localContact.direccion || {}), region: e.target.value } })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    >
                        <option value="" disabled>Selecciona una Región</option>
                        {regions.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Código Postal</label>
                    <input 
                        placeholder="Código Postal" 
                        value={localContact.direccion?.codigoPostal || ""} 
                        onChange={(e) => updateContact({ direccion: { ...(localContact.direccion || {}), codigoPostal: e.target.value } })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">País <span className="text-red-600">*</span></label>
                    <select 
                        value={localContact.direccion?.pais || "Chile"} 
                        onChange={(e) => updateContact({ direccion: { ...(localContact.direccion || {}), pais: e.target.value } })} 
                        onBlur={persistContact} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    >
                        <option>Chile</option>
                        <option>Otro</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Pie de Página y Botones de Navegación */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            
            {/* Botón Anterior (Secundario) */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-sm transition duration-150" 
                onClick={goPrev}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Anterior
            </button>
            
            {/* Botón Siguiente (Primario) */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-primary text-white rounded-lg shadow-lg hover:from-primary hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold text-sm transition duration-200 transform hover:scale-[1.01]" 
                onClick={goNext}
            >
                Siguiente
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
        </div>
    </div>
);
  };

  const Step5: FC = () => {
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    const checkUsername = (u: string) => {
      setUsernameChecking(true);
      setTimeout(()=>{
        const ok = !/taken/i.test(u) && u.length>=5;
        setUsernameAvailable(ok);
        setUsernameChecking(false);
      }, 600);
    };

    const [localSecurity, setLocalSecurity] = useState(() => ({ ...(state.security || {}) }));

    useEffect(()=>{
      setLocalSecurity({ ...(state.security || {}) });
    }, [state.security]);

    const persistSecurity = () => setSecurity(localSecurity as any);

    return (
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Encabezado del Paso - Estilo Minimalista y Profesional */}
        <header className="mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Configuración de Acceso y Seguridad
            </h3>
            <span className="text-sm font-medium text-primary mt-1 block uppercase">
                Paso 5 de 6
            </span>
        </header>

        {/* Grid de Campos de Seguridad */}
        <div className="grid grid-cols-1 gap-6">
            
            {/* Nombre de Usuario */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Nombre de Usuario <span className="text-red-600">*</span></label>
                <input 
                    placeholder="mi.empresa" 
                    value={localSecurity.username || ""} 
                    onChange={(e) => { 
                        setLocalSecurity({ ...localSecurity, username: e.target.value }); 
                        checkUsername(e.target.value); 
                    }} 
                    onBlur={persistSecurity} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
                <div className="text-xs mt-1 h-4">
                    {usernameChecking ? (
                        <span className="text-gray-500 flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Comprobando...
                        </span>
                    ) : usernameAvailable === true ? (
                        <span className="text-green-600 font-medium">✓ Disponible</span>
                    ) : usernameAvailable === false ? (
                        <span className="text-red-600 font-medium">✗ No disponible</span>
                    ) : null}
                </div>
            </div>

            {/* Email de Usuario */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Email de Usuario</label>
                <input 
                    value={localSecurity.email || state.basicInfo.email || ""} 
                    onChange={(e) => setLocalSecurity({ ...localSecurity, email: e.target.value })} 
                    onBlur={persistSecurity} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Contraseña <span className="text-red-600">*</span></label>
                <input 
                    type="password" 
                    value={localSecurity.password || ""} 
                    onChange={(e) => setLocalSecurity({ ...localSecurity, password: e.target.value })} 
                    onBlur={persistSecurity} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
                <div className="text-xs text-gray-500 mt-1">
                    Mínimo <strong>8 caracteres</strong>, una mayúscula, un número y un carácter especial.
                </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Confirmar Contraseña <span className="text-red-600">*</span></label>
                <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                />
            </div>

            {/* Autenticación de Dos Factores (Radio Buttons Estilizados) */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 block mb-2">Autenticación de Dos Factores</label>
                <div className="flex flex-wrap gap-3">
                    {/* Opción 1: Email */}
                    <label className={`p-3 border rounded-lg transition duration-150 cursor-pointer text-sm font-medium ${true ? 'border-primary bg-blue-50 text-primary shadow-sm' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                        <input type="radio" name="twofa" defaultChecked className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-blue-500" /> Email
                    </label>
                    {/* Opción 2: SMS */}
                    <label className={`p-3 border rounded-lg transition duration-150 cursor-pointer text-sm font-medium ${false ? 'border-primary bg-blue-50 text-primary shadow-sm' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                        <input type="radio" name="twofa" className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-blue-500" /> SMS
                    </label>
                    {/* Opción 3: Authenticator App */}
                    <label className={`p-3 border rounded-lg transition duration-150 cursor-pointer text-sm font-medium ${false ? 'border-primary bg-blue-50 text-primary shadow-sm' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                        <input type="radio" name="twofa" className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-blue-500" /> Authenticator App
                    </label>
                </div>
            </div>

            {/* Términos y Condiciones (Checkboxes) */}
            <div className="mt-4 space-y-3">
                
                {/* Checkbox: Términos de Servicio */}
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={!!localSecurity.acceptedTerms} 
                        onChange={(e) => setLocalSecurity({ ...localSecurity, acceptedTerms: e.target.checked })} 
                        onBlur={persistSecurity} 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500" 
                    /> 
                    He leído y acepto los <strong>Términos de Servicio</strong> <span className="text-red-600">*</span>
                </label>
                
                {/* Checkbox: Política de Privacidad */}
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={!!localSecurity.acceptedPrivacy} 
                        onChange={(e) => setLocalSecurity({ ...localSecurity, acceptedPrivacy: e.target.checked })} 
                        onBlur={persistSecurity} 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500" 
                    /> 
                    He leído y acepto la <strong>Política de Privacidad</strong> <span className="text-red-600">*</span>
                </label>
                
                {/* Checkbox: Notificaciones */}
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={!!localSecurity.receiveEmails} 
                        onChange={(e) => setLocalSecurity({ ...localSecurity, receiveEmails: e.target.checked })} 
                        onBlur={persistSecurity} 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500" 
                    /> 
                    Deseo recibir notificaciones por email
                </label>
            </div>
        </div>

        {/* Pie de Página y Botones de Navegación */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            
            {/* Botón Anterior (Secundario) */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-sm transition duration-150" 
                onClick={goPrev}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Anterior
            </button>
            
            {/* Botón Siguiente (Primario) */}
            <button 
                className="inline-flex items-center h-10 px-5 bg-primary text-white rounded-lg shadow-lg hover:from-primary hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold text-sm transition duration-200 transform hover:scale-[1.01]" 
                onClick={goNext}
            >
                Siguiente
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
        </div>
    </div>
  );
  };

  const Step6: FC = () => {
    const [submitting, setSubmitting] = useState(false);

    const saveToLocalStorage = (supplier: any) => {
      try {
        const key = 'mock_suppliers';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(supplier);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        console.error('Failed to save supplier locally', e);
      }
    };

    // CSV download removed: storing supplier JSON on server-file

    const confirm = () => {
      setSubmitting(true);
      const supplier = {
        basicInfo: state.basicInfo,
        documents: Object.keys(state.documents).reduce((acc: any, k) => { acc[k] = state.documents[k] instanceof File ? (state.documents[k] as File).name : state.documents[k]; return acc; }, {} as any),
        commercial: state.commercial,
        contact: state.contact,
        security: { username: state.security.username },
        createdAt: new Date().toISOString(),
      };

      // Save locally (no backend): store in localStorage under 'mock_suppliers'
      saveToLocalStorage(supplier);
      setTimeout(()=>{
        setSubmitting(false);
        setLocation('/login');
      }, 300);
    };

    const SectionCard: FC<{ title: string; onEdit: () => void; children?: React.ReactNode }> = ({ title, children, onEdit }) => (
      <div className="border border-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="font-medium text-gray-800">{title}</div>
          <button className="text-sm text-primary hover:text-primary" onClick={onEdit}>Editar</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );

    // No export/import: persistence is localStorage only (mock_suppliers)
    return (
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Encabezado del Paso - Estilo Minimalista y Profesional */}
        <header className="mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Revisión Final y Confirmación
            </h3>
            <span className="text-sm font-medium text-primary mt-1 block uppercase">
                Paso 6 de 6
            </span>
        </header>

        {/* Tarjeta: Información Básica */}
        <SectionCard title="Información Básica" onEdit={() => setStep(1)}>
            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Tipo:</strong> <span className="font-medium capitalize">{state.basicInfo.personType}</span></p>
                <p><strong>RUT:</strong> {state.basicInfo.rut}</p>
                <p><strong>Nombre/Razón Social:</strong> {state.basicInfo.nombre || state.basicInfo.razonSocial}</p>
                <p><strong>Email:</strong> {state.basicInfo.email}</p>
            </div>
        </SectionCard>

        {/* Tarjeta: Documentación */}
        <SectionCard title="Documentación" onEdit={() => setStep(2)}>
            <div className="text-sm text-gray-700">
                <p><strong>Documentos cargados:</strong> <span className="font-medium text-primary">{Object.keys(state.documents).length}</span></p>
                <p className="text-xs text-gray-500 mt-1">Revisa el Paso 2 para cualquier ajuste.</p>
            </div>
        </SectionCard>

        {/* Tarjeta: Perfil Comercial */}
        <SectionCard title="Perfil Comercial" onEdit={() => setStep(3)}>
            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Rubros Principales:</strong> <span className="italic">{state.commercial.rubros && (state.commercial.rubros.join(", ") || 'No especificado')}</span></p>
                <p><strong>Años de Experiencia:</strong> {state.commercial.experienciaAnios || 'N/A'}</p>
            </div>
        </SectionCard>

        {/* Tarjeta: Contacto y Representación */}
        <SectionCard title="Contacto y Representación" onEdit={() => setStep(4)}>
            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Contacto Principal:</strong> <span className="font-medium">{state.contact.contactoNombre}</span></p>
                <p><strong>Email:</strong> {state.contact.contactoEmail}</p>
            </div>
        </SectionCard>

        {/* Tarjeta: Acceso */}
        <SectionCard title="Acceso" onEdit={() => setStep(5)}>
            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Usuario:</strong> <span className="font-medium text-primary">{state.security.username}</span></p>
                <p><strong>Doble Factor (2FA):</strong> {state.security.twoFA?.method || 'Email (Default)'}</p>
                <p className="text-xs text-gray-500 pt-2">Contraseña configurada.</p>
            </div>
        </SectionCard>

        {/* Pie de Página y Botones de Navegación */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
            <div className="flex items-center gap-3">
                
                {/* Botón Anterior (Secundario) - Consistente con pasos anteriores */}
                <button 
                    className="inline-flex items-center h-10 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-sm transition duration-150" 
                    onClick={goPrev}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Anterior
                </button>
                
                {/* Botón Confirmar Registro (Primario) - Consistente con gradiente y efectos */}
                <button 
                    className="inline-flex items-center justify-center h-10 px-5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg shadow-lg hover:from-primary hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold text-sm transition duration-200 transform hover:scale-[1.01] w-48 disabled:opacity-60 disabled:cursor-not-allowed" 
                    onClick={confirm} 
                    disabled={submitting}
                >
                    {submitting ? 'Enviando...' : (
                        <>
                            Confirmar Registro
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
  };

  return (
    
    <div className="min-h-screen bg-gray-50 relative">
    
        
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
                backgroundImage: `url('/fondo-registro.jpg')`, // Tu nueva ruta
                zIndex: 0, 
            }}
        ></div>
        
        
        {/* Capa de overlay (Opcional, si quieres un ligero tono sobre la imagen) */}
        <div className="absolute inset-0 bg-slate-800 opacity-70 z-10"></div>

        {/* Encabezado General del Proceso - Se mantiene en la capa superior */}
        <header className="py-8 bg-white shadow-sm border-b border-gray-100 relative z-10">
            {/* Back button (right) */}
            <button
                type="button"
                aria-label="Volver"
                onClick={() => window.history.back()}
                className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50"
            >
                <ChevronLeft className="w-4 h-4" />
                Volver a Inicio
            </button>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">   
               
                {/* Contenedor Flexbox para Logo y Títulos */}
                <div className="flex items-center space-x-4">      
                    {/* Logo o Imagen */}
                    {/* Ajusta el src y las clases de tamaño (ej. h-10 w-10) según tu logo */}
                    <img 
                        className="h-15 w-15" 
                        src="/logo.png" 
                        alt="Logo de la Empresa" 
                    />
                    {/* Contenedor de Títulos */}
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Registro de Proveedor
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Completa los 6 pasos para finalizar tu inscripción y verificación.
                        </p>
                    </div>
                </div>
                
            </div>
        </header>

        {/* Stepper y Contenido del Formulario - Se mantiene en la capa superior */}
        <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
            {/* El Stepper se renderiza aquí (asumiendo que tiene sus propios estilos) */}
            <Stepper step={step} /> 

            {/* Contenido del Paso Actual */}
            <div className="mt-10">
                {step === 1 && (
                    <Step1Component
                        localBasic={localBasic}
                        setLocalBasic={setLocalBasic}
                        errors={errors}
                        setBasicInfo={setBasicInfo}
                        state={state}
                        goNext={goNext}
                    />
                )}
                {step === 2 && <Step2 />}
                {step === 3 && <Step3 />}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 />}
                {step === 6 && <Step6 />}
            </div>
        </div>
    </div>
  );
};

const RegistroProveedor: FC = () => (
  <OnboardingProvider>
    <RegistroInner />
  </OnboardingProvider>
);

export default RegistroProveedor;
