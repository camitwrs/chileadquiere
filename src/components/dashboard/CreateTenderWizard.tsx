import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Redirect, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, Loader2, Calendar as CalendarIcon, FileText, UploadCloud, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- MOCKS DE DATOS ---
const RUBROS = ['Tecnología', 'Servicios', 'Productos', 'Consultoría', 'Logística', 'Construcción', 'Mantenimiento', 'Otros'];
const ORGANISMOS_MOCK = [
    { id: 'org1', nombre: 'Ministerio de Hacienda', logo: '💰' },
    { id: 'org2', nombre: 'Corporación de Fomento', logo: '🏗️' },
    { id: 'org3', nombre: 'Dirección de Compras Públicas', logo: '🏛️' },
    { id: 'org4', nombre: 'Hospital Metropolitano', logo: '🏥' },
    { id: 'org5', nombre: 'Universidad del Sur', logo: '🎓' },
    // ... más mocks para simular la búsqueda ...
];
const USUARIOS_MOCK = [
    { id: 'user1', nombre: 'Ana Gómez (Tú)', avatar: '👩' },
    { id: 'user2', nombre: 'Juan Pérez', avatar: '👨' },
    { id: 'user3', nombre: 'María Lopez', avatar: '👱‍♀️' },
    { id: 'user4', nombre: 'Carlos Ruiz', avatar: '🧔' },
];

const PASOS = [
    { id: 1, label: 'Información General' },
    { id: 2, label: 'Especificaciones' },
    { id: 3, label: 'Montos y Términos' },
    { id: 4, label: 'Fechas y Plazos' },
    { id: 5, label: 'Criterios de Evaluación' },
    { id: 6, label: 'Revisión y Confirmación' },
];

// --- TIPOS DE DATOS ---
interface TData {
    // Paso 1
    id: string;
    titulo: string;
    descripcion: string;
    rubro: string;
    tipoLicitacion: 'Abierta' | 'Cerrada' | 'Inversa' | 'Quick';
    numProveedores: number | null; // Solo si es Cerrada
    organismo: string; // ID de organismo
    unidadResponsable: string;
    responsableId: string; // ID de usuario
    // Paso 2
    especificaciones: { id: number; spec: string; valor: string; unidad: string }[];
    anexos: { id: number; name: string; size: number; date: Date; file: File }[];
    imagenesReferencia: { id: number; name: string; file: File }[];
    // Paso 3
    presupuestoBase: number | null;
    presupuestoMaximo: number | null;
    variacionPermitida: '0%' | '5%' | '10%' | 'Custom';
    variacionPersonalizada: number | null;
    modalidadPago: 'Contado' | 'Plazo 30 días' | 'Plazo 60 días' | 'Personalizado';
    plazoPersonalizadoDias: number | null;
    otrosTerminosPago: string;
    garantiaSeriedad: boolean;
    montoSeriedad: number | null;
    garantiaFielCumplimiento: boolean;
    montoCumplimiento: number | null;
    garantiaAnticipo: boolean;
    montoAnticipo: number | null;
    otrasGarantiasEspeciales: boolean;
    descripcionOtrasGarantias: string;
    validezOfertaDias: number | null;
    formasPagoAceptadas: string[];
    // Paso 4
    fechaPublicacion: Date | null;
    horaPublicacion: string; // "HH:MM"
    fechaCierre: Date | null;
    horaCierre: string; // "HH:MM"
    fechaEvaluacion: Date | null;
    horaEvaluacion: string;
    fechaAdjudicacion: Date | null;
    horarioAtencionInicio: string; // "HH:MM"
    horarioAtencionFin: string; // "HH:MM"
    hitosAdicionales: { id: number; nombre: string; fecha: Date | null; hora: string }[];
    // Paso 5
    tipoEvaluacion: 'Automática' | 'Puntaje' | 'Mixta' | 'Custom';
    criterios: { id: number; nombre: string; ponderacion: number; min: number; max: number; pesoAutomatico: boolean }[];
    reglaDesempate: 'Menor precio' | 'Orden de presentación' | 'Sorteo' | 'Manual';
    aplicarRequisitosMinimos: boolean;
    requisitosMinimos: { id: number; nombre: string; descripcion: string; puntajeMinimo: number | string }[];
}

const initialData: TData = {
    // Paso 1
    id: `LIC-2024-${Math.floor(Math.random() * 100000) + 1000}`,
    titulo: '',
    descripcion: '',
    rubro: '',
    tipoLicitacion: 'Abierta',
    numProveedores: null,
    organismo: '',
    unidadResponsable: '',
    responsableId: USUARIOS_MOCK[0].id,
    // Paso 2
    especificaciones: [{ id: 1, spec: '', valor: '', unidad: '' }, { id: 2, spec: '', valor: '', unidad: '' }, { id: 3, spec: '', valor: '', unidad: '' }, { id: 4, spec: '', valor: '', unidad: '' }, { id: 5, spec: '', valor: '', unidad: '' }],
    anexos: [],
    imagenesReferencia: [],
    // Paso 3
    presupuestoBase: null,
    presupuestoMaximo: null,
    variacionPermitida: '0%',
    variacionPersonalizada: null,
    modalidadPago: 'Plazo 30 días',
    plazoPersonalizadoDias: null,
    otrosTerminosPago: '',
    garantiaSeriedad: false,
    montoSeriedad: 5, // Default 5%
    garantiaFielCumplimiento: false,
    montoCumplimiento: 10, // Default 10%
    garantiaAnticipo: false,
    montoAnticipo: 10,
    otrasGarantiasEspeciales: false,
    descripcionOtrasGarantias: '',
    validezOfertaDias: 30,
    formasPagoAceptadas: ['Transferencia Bancaria'],
    // Paso 4
    fechaPublicacion: new Date(),
    horaPublicacion: '09:00',
    fechaCierre: null,
    horaCierre: '17:00',
    fechaEvaluacion: null,
    horaEvaluacion: '09:00',
    fechaAdjudicacion: null,
    horarioAtencionInicio: '08:00',
    horarioAtencionFin: '17:00',
    hitosAdicionales: [],
    // Paso 5
    tipoEvaluacion: 'Puntaje',
    criterios: [
        { id: 1, nombre: 'Precio', ponderacion: 40, min: 0, max: 100, pesoAutomatico: true },
        { id: 2, nombre: 'Experiencia', ponderacion: 30, min: 0, max: 100, pesoAutomatico: false },
        { id: 3, nombre: 'Propuesta Técnica', ponderacion: 20, min: 0, max: 100, pesoAutomatico: false },
        { id: 4, nombre: 'Referencias', ponderacion: 10, min: 0, max: 100, pesoAutomatico: false },
    ],
    reglaDesempate: 'Menor precio',
    aplicarRequisitosMinimos: false,
    requisitosMinimos: [],
};

// Función de utilidad para formatear el monto en CLP (formato chileno)
const formatMonto = (num: number | null): string => {
    if (num === null) return '$ 0';
    return '$ ' + num.toLocaleString('es-CL', { maximumFractionDigits: 0 });
};

// --- WIZARD COMPONENT ---
export default function CreateTenderWizard() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<TData>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [, setLocation] = useLocation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Carga inicial y Borrador Automático (LocalStorage)
    useEffect(() => {
        const savedDraft = localStorage.getItem('tenderDraft');
        if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            // Convertir strings de fecha a objetos Date
            ['fechaPublicacion', 'fechaCierre', 'fechaEvaluacion', 'fechaAdjudicacion'].forEach(key => {
                if (draftData[key]) draftData[key] = parseISO(draftData[key]);
            });
            draftData.hitosAdicionales = draftData.hitosAdicionales.map((h: any) => ({
                ...h,
                fecha: h.fecha ? parseISO(h.fecha) : null
            }));
            
            // Files cannot be saved in localStorage, clear them
            draftData.anexos = [];
            draftData.imagenesReferencia = [];

            setData(draftData);
            toast.info('Borrador de licitación cargado automáticamente.');
        }
    }, []);

    // Guardado automático del borrador (cada vez que cambian los datos)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSaveDraft();
        }, 3000); // Guarda 3 segundos después del último cambio
        return () => clearTimeout(timer);
    }, [data]);

    const handleUpdate = useCallback(<K extends keyof TData>(key: K, value: TData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
        setIsSaving(true);
    }, []);

    const handleSaveDraft = useCallback(() => {
        // Preparar datos para localStorage (convertir Dates a ISO strings)
        const dataToSave = { ...data } as any;
        ['fechaPublicacion', 'fechaCierre', 'fechaEvaluacion', 'fechaAdjudicacion'].forEach(key => {
            if (dataToSave[key]) dataToSave[key] = (dataToSave[key] as Date).toISOString();
        });
        (dataToSave as any).hitosAdicionales = (dataToSave as any).hitosAdicionales.map((h: any) => ({
            ...h,
            fecha: h.fecha ? (h.fecha as Date).toISOString() : null
        }));

        // Excluir archivos que no se pueden serializar
        delete dataToSave.anexos;
        delete dataToSave.imagenesReferencia;
        
        localStorage.setItem('tenderDraft', JSON.stringify(dataToSave));
        setIsSaving(false);
        // toast.success('Borrador guardado automáticamente.', { duration: 1000 });
    }, [data]);

    // --- VALIDACIÓN DE PASOS ---
    const isStepValid = useMemo(() => {
        switch (step) {
            case 1: // Información General
                if (!data.titulo || data.titulo.length > 150) return false;
                if (!data.descripcion || data.descripcion.length > 1000) return false;
                if (!data.rubro) return false;
                if (data.tipoLicitacion === 'Cerrada' && (!data.numProveedores || data.numProveedores < 1)) return false;
                if (!data.organismo || !data.unidadResponsable || !data.responsableId) return false;
                return true;
            case 2: // Especificaciones y Anexos
                // Se considera válido si al menos hay una especificación no vacía o anexos
                const hasValidSpecs = data.especificaciones.some(s => s.spec || s.valor || s.unidad);
                if (!hasValidSpecs && data.anexos.length === 0) return true; // Si no hay nada, se asume opcional por ahora
                return true;
            case 3: // Montos y Términos
                if (!data.presupuestoBase || data.presupuestoBase < 1) return false;
                if (!data.presupuestoMaximo || data.presupuestoMaximo < data.presupuestoBase) return false;
                if (data.variacionPermitida === 'Custom' && (!data.variacionPersonalizada || data.variacionPersonalizada < 0)) return false;
                if (data.modalidadPago === 'Personalizado' && (!data.plazoPersonalizadoDias || data.plazoPersonalizadoDias < 1)) return false;
                if (!data.validezOfertaDias || data.validezOfertaDias < 1 || data.validezOfertaDias > 365) return false;
                if (data.formasPagoAceptadas.length === 0) return false;
                if (data.garantiaSeriedad && (!data.montoSeriedad || data.montoSeriedad <= 0)) return false;
                return true;
            case 4: // Fechas y Plazos
                if (!data.fechaPublicacion || !data.fechaCierre) return false;
                const pubDateTime = new Date(data.fechaPublicacion);
                const closeDateTime = new Date(data.fechaCierre);
                
                // Set hours for comparison
                const [pubH, pubM] = data.horaPublicacion.split(':').map(Number);
                const [closeH, closeM] = data.horaCierre.split(':').map(Number);
                pubDateTime.setHours(pubH, pubM, 0, 0);
                closeDateTime.setHours(closeH, closeM, 0, 0);
                
                if (closeDateTime <= pubDateTime) return false;
                
                if (data.fechaEvaluacion) {
                    const evalDateTime = new Date(data.fechaEvaluacion);
                    const [evalH, evalM] = data.horaEvaluacion.split(':').map(Number);
                    evalDateTime.setHours(evalH, evalM, 0, 0);
                    if (evalDateTime <= closeDateTime) return false;
                }
                
                return true;
            case 5: // Evaluación y Criterios
                if (data.tipoEvaluacion === 'Puntaje' || data.tipoEvaluacion === 'Mixta') {
                    const totalPonderacion = data.criterios.reduce((sum, c) => sum + c.ponderacion, 0);
                    if (totalPonderacion !== 100) return false;
                }
                if (data.aplicarRequisitosMinimos && data.requisitosMinimos.some(r => !r.nombre || !r.descripcion)) return false;
                return true;
            case 6: // Revisión
                // El paso 6 es válido si todos los pasos anteriores lo son
                return [1, 2, 3, 4, 5].every(checkStepCompleteness);
            default:
                return true;
        }
    }, [step, data]);

    const checkStepCompleteness = (stepNum: number): boolean => {
        // Función simplificada para revisar si un paso está "completo"
        // Usa la misma lógica que isStepValid, pero sin la dependencia de 'step'
        switch (stepNum) {
            case 1:
                return !!data.titulo && !!data.descripcion && !!data.rubro && !!data.organismo;
            case 2:
                return true; // Se considera completo si llegamos aquí, ya que es en gran parte opcional
            case 3:
                return !!data.presupuestoBase && !!data.presupuestoMaximo && !!data.validezOfertaDias && data.formasPagoAceptadas.length > 0;
            case 4:
                // Copia simplificada de la lógica de validación de fechas (sin errores de min/max)
                return !!data.fechaPublicacion && !!data.fechaCierre;
            case 5:
                if (data.tipoEvaluacion === 'Puntaje' || data.tipoEvaluacion === 'Mixta') {
                    const totalPonderacion = data.criterios.reduce((sum, c) => sum + c.ponderacion, 0);
                    return totalPonderacion === 100;
                }
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (isStepValid && step < PASOS.length) {
            setStep(step + 1);
        } else if (!isStepValid) {
            toast.error('Por favor, completa los campos obligatorios antes de continuar.');
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handlePublicar = () => {
        if (!isStepValid) {
            toast.error('Aún faltan datos obligatorios o hay errores de validación. Por favor, revisa el Paso 6.');
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmPublicacion = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Publicando Licitación...',
                success: (value) => {
                    localStorage.removeItem('tenderDraft'); // Limpia borrador
                    setLocation(`/licitaciones/detalle/${data.id}`); // Redirecciona a la vista de detalle (mock)
                    return `¡Licitación ${data.id} Publicada con éxito!`;
                },
                error: 'Error al publicar la licitación.',
            }
        );
        setShowConfirmModal(false);
    };

    // --- Componentes de Pasos (Implementación de formularios) ---

    // Paso 1: Información General
    const Step1 = () => {
        const [searchOrg, setSearchOrg] = useState('');
        const filteredOrganismos = ORGANISMOS_MOCK.filter(o => o.nombre.toLowerCase().includes(searchOrg.toLowerCase()));

        return (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* ID Licitación */}
                    <div className="space-y-2">
                        <Label htmlFor="tender-id">ID Licitación (Automático)</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        <Input id="tender-id" value={data.id} readOnly className="bg-gray-100 cursor-copy" />
                                        <Copy className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-primary" onClick={() => { navigator.clipboard.writeText(data.id); toast.info('ID Copiado'); }} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Copiar ID</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título de la Licitación *</Label>
                        <Input
                            id="titulo"
                            placeholder="Suministro de Equipos de Oficina"
                            value={data.titulo}
                            onChange={(e) => handleUpdate('titulo', e.target.value)}
                            maxLength={150}
                        />
                        <p className="text-sm text-right text-muted-foreground">{data.titulo.length}/150</p>
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción Detallada *</Label>
                    <Textarea
                        id="descripcion"
                        placeholder="Detalla qué necesitas, especificaciones técnicas, etc"
                        value={data.descripcion}
                        onChange={(e) => handleUpdate('descripcion', e.target.value)}
                        maxLength={1000}
                        rows={5}
                    />
                    <p className="text-sm text-right text-muted-foreground">{data.descripcion.length}/1000</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Rubro */}
                    <div className="space-y-2">
                        <Label htmlFor="rubro">Categoría Principal *</Label>
                        <Select value={data.rubro} onValueChange={(val) => handleUpdate('rubro', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el rubro" />
                            </SelectTrigger>
                            <SelectContent>
                                {RUBROS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Tipo de Licitación */}
                    <div className="space-y-2">
                        <Label>Tipo de Licitación *</Label>
                        <RadioGroup value={data.tipoLicitacion} onValueChange={(val: any) => handleUpdate('tipoLicitacion', val)} className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Abierta" id="t-abierta" />
                                <Label htmlFor="t-abierta">Abierta</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Cerrada" id="t-cerrada" />
                                <Label htmlFor="t-cerrada">Cerrada</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Inversa" id="t-inversa" />
                                <Label htmlFor="t-inversa">Inversa</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Quick" id="t-quick" />
                                <Label htmlFor="t-quick">Quick</Label>
                            </div>
                        </RadioGroup>
                        
                        {data.tipoLicitacion === 'Cerrada' && (
                            <div className="mt-2 flex items-center gap-2">
                                <Label htmlFor="num-prov" className="text-sm">¿Cuántos proveedores?</Label>
                                <Input
                                    id="num-prov"
                                    type="number"
                                    min={1}
                                    className="w-20"
                                    value={data.numProveedores || ''}
                                    onChange={(e) => handleUpdate('numProveedores', parseInt(e.target.value) || null)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Organismo */}
                    <div className="space-y-2">
                        <Label htmlFor="organismo">Institución / Empresa *</Label>
                        <Select value={data.organismo} onValueChange={(val) => handleUpdate('organismo', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Busca tu organismo" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <Input placeholder="Buscar organismo..." className="mb-2" value={searchOrg} onChange={(e) => setSearchOrg(e.target.value)} />
                                <ScrollArea className="h-40">
                                    {filteredOrganismos.map(o => (
                                        <SelectItem key={o.id} value={o.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{o.logo}</span>
                                                {o.nombre}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Unidad Responsable */}
                    <div className="space-y-2">
                        <Label htmlFor="unidad">Departamento / Unidad *</Label>
                        <Input
                            id="unidad"
                            placeholder="Ej: Departamento de Compras"
                            value={data.unidadResponsable}
                            onChange={(e) => handleUpdate('unidadResponsable', e.target.value)}
                        />
                    </div>
                </div>

                {/* Responsable */}
                <div className="space-y-2 md:w-1/2">
                    <Label htmlFor="responsable">Usuario Responsable *</Label>
                    <Select value={data.responsableId} onValueChange={(val) => handleUpdate('responsableId', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Asigna un usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            {USUARIOS_MOCK.map(u => (
                                <SelectItem key={u.id} value={u.id}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{u.avatar}</span>
                                        {u.nombre}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };

    // Paso 2: Especificaciones y Anexos
    const Step2 = () => {
        const handleSpecChange = (id: number, field: 'spec' | 'valor' | 'unidad', value: string) => {
            handleUpdate('especificaciones', data.especificaciones.map(s => s.id === id ? { ...s, [field]: value } : s));
        };

        const addSpecRow = () => {
            const newId = Math.max(...data.especificaciones.map(s => s.id), 0) + 1;
            handleUpdate('especificaciones', [...data.especificaciones, { id: newId, spec: '', valor: '', unidad: '' }]);
        };

        const removeSpecRow = (id: number) => {
            handleUpdate('especificaciones', data.especificaciones.filter(s => s.id !== id));
        };

        const handleFileDrop = (event: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>, type: 'anexo' | 'imagen') => {
            event.preventDefault();
            const files = event.type === 'drop' ? (event as React.DragEvent<HTMLDivElement>).dataTransfer.files : (event.target as HTMLInputElement).files;
            
            if (!files) return;

            Array.from(files).forEach(file => {
                const allowedTypes = type === 'anexo' ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] : ['image/jpeg', 'image/png', 'image/gif'];
                const maxFileSize = 10 * 1024 * 1024; // 10MB
                const maxTotalSize = 50 * 1024 * 1024; // 50MB
                const currentTotalSize = data.anexos.reduce((sum, a) => sum + a.size, 0) + data.imagenesReferencia.reduce((sum, i) => sum + i.file.size, 0);

                if (!allowedTypes.includes(file.type)) {
                    toast.error(`Tipo de archivo no permitido para ${type}.`);
                    return;
                }
                if (file.size > maxFileSize) {
                    toast.error(`El archivo "${file.name}" excede el límite de 10MB.`);
                    return;
                }
                if (currentTotalSize + file.size > maxTotalSize) {
                    toast.error('Se ha excedido el límite total de 50MB para todos los archivos.');
                    return;
                }

                if (type === 'anexo') {
                    const newAnexo = { id: Date.now(), name: file.name, size: file.size, date: new Date(), file };
                    handleUpdate('anexos', [...data.anexos, newAnexo]);
                } else if (type === 'imagen' && data.imagenesReferencia.length < 5) {
                    const newImage = { id: Date.now(), name: file.name, file };
                    handleUpdate('imagenesReferencia', [...data.imagenesReferencia, newImage]);
                } else if (type === 'imagen') {
                    toast.error('Se ha alcanzado el límite de 5 imágenes de referencia.');
                }
            });
        };

        const removeFile = (id: number, type: 'anexo' | 'imagen') => {
            if (type === 'anexo') {
                handleUpdate('anexos', data.anexos.filter(a => a.id !== id));
            } else {
                handleUpdate('imagenesReferencia', data.imagenesReferencia.filter(i => i.id !== id));
            }
        };

        const totalAnexosSize = data.anexos.reduce((sum, a) => sum + a.size, 0);

        return (
            <div className="space-y-8">
                {/* Sección A: Especificaciones Técnicas */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Especificaciones Técnicas</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="py-2 px-3 w-1/3">Especificación</th>
                                        <th className="py-2 px-3 w-1/3">Valor</th>
                                        <th className="py-2 px-3 w-1/6">Unidad</th>
                                        <th className="py-2 px-3 w-1/12"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.especificaciones.map((spec) => (
                                        <tr key={spec.id}>
                                            <td className="py-2 px-3"><Input value={spec.spec} onChange={(e) => handleSpecChange(spec.id, 'spec', e.target.value)} placeholder="Ej: Cantidad" /></td>
                                            <td className="py-2 px-3"><Input value={spec.valor} onChange={(e) => handleSpecChange(spec.id, 'valor', e.target.value)} placeholder="Ej: 100" /></td>
                                            <td className="py-2 px-3"><Input value={spec.unidad} onChange={(e) => handleSpecChange(spec.id, 'unidad', e.target.value)} placeholder="Ej: unidades" /></td>
                                            <td className="py-2 px-3 text-center">
                                                <Button variant="ghost" size="icon" onClick={() => removeSpecRow(spec.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button variant="outline" size="sm" onClick={addSpecRow} className="mt-4">
                            + Agregar fila
                        </Button>
                    </CardContent>
                </Card>

                {/* Sección B: Anexos y Documentos */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Anexos y Documentos</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors hover:bg-gray-100 cursor-pointer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleFileDrop(e, 'anexo')}
                            onClick={() => document.getElementById('file-upload-anexo')?.click()}
                        >
                            <UploadCloud className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700">Arrastra bases o especificaciones técnicas aquí</p>
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX. Máx 10MB/archivo. Total: {(totalAnexosSize / 1024 / 1024).toFixed(2)}MB/50MB</p>
                            <input type="file" id="file-upload-anexo" multiple className="hidden" onChange={(e) => handleFileDrop(e, 'anexo')} accept=".pdf,.doc,.docx,.xls,.xlsx" />
                        </div>
                        
                        {data.anexos.length > 0 && (
                            <div className="space-y-2">
                                <p className="font-medium text-sm">Documentos cargados:</p>
                                {data.anexos.map(a => (
                                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                        <div className="flex items-center gap-3 truncate">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium truncate">{a.name}</span>
                                            <span className="text-xs text-muted-foreground">({(a.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info(`Descargando ${a.name}...`)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => removeFile(a.id, 'anexo')}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sección C: Imágenes de Referencia (optional) */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Imágenes de Referencia (Opcional)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors hover:bg-gray-100 cursor-pointer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleFileDrop(e, 'imagen')}
                            onClick={() => document.getElementById('file-upload-imagen')?.click()}
                        >
                            <UploadCloud className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700">Arrastra imágenes de referencia aquí (Máx 5)</p>
                            <input type="file" id="file-upload-imagen" multiple className="hidden" onChange={(e) => handleFileDrop(e, 'imagen')} accept="image/jpeg,image/png,image/gif" />
                        </div>
                        
                        {data.imagenesReferencia.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                {data.imagenesReferencia.map(img => (
                                    <div key={img.id} className="relative w-[100px] h-[100px] border rounded-lg overflow-hidden group">
                                        <img 
                                            src={URL.createObjectURL(img.file)} 
                                            alt={img.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/CCCCCC/333333?text=IMG'}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeFile(img.id, 'imagen')}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Paso 3: Montos y Términos
    const Step3 = () => {
        const montoBase = data.presupuestoBase || 0;
        const montoSeriedadCalculado = montoBase * ((data.montoSeriedad || 0) / 100);
        const montoCumplimientoCalculado = montoBase * ((data.montoCumplimiento || 0) / 100);

        return (
            <div className="space-y-8">
                {/* Sección A: Montos */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Presupuesto y Variación</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Presupuesto Base */}
                            <div className="space-y-2">
                                <Label htmlFor="base-monto">Monto Presupuestado (CLP) *</Label>
                                <Input
                                    id="base-monto"
                                    type="number"
                                    min={1}
                                    max={999999999}
                                    placeholder="Ej: 1234567"
                                    value={data.presupuestoBase || ''}
                                    onChange={(e) => handleUpdate('presupuestoBase', parseInt(e.target.value) || null)}
                                />
                                <p className="text-sm text-muted-foreground">{formatMonto(data.presupuestoBase)}</p>
                            </div>

                            {/* Presupuesto Máximo */}
                            <div className="space-y-2">
                                <Label htmlFor="max-monto">Monto Máximo Permitido *</Label>
                                <Input
                                    id="max-monto"
                                    type="number"
                                    min={montoBase}
                                    max={999999999}
                                    placeholder="Debe ser ≥ Presupuesto Base"
                                    value={data.presupuestoMaximo || ''}
                                    onChange={(e) => handleUpdate('presupuestoMaximo', parseInt(e.target.value) || null)}
                                />
                                {data.presupuestoMaximo !== null && data.presupuestoMaximo < montoBase && (
                                    <p className="text-xs text-red-500">El máximo debe ser mayor o igual al base.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Variación Permitida */}
                        <div className="space-y-2 pt-4">
                            <Label>Variación Permitida (Sobre el Presupuesto Máximo)</Label>
                            <RadioGroup value={data.variacionPermitida} onValueChange={(val: any) => handleUpdate('variacionPermitida', val)} className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="0%" id="v-0" /><Label htmlFor="v-0">No permitir variaciones (0%)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="5%" id="v-5" /><Label htmlFor="v-5">Permitir hasta ±5%</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="10%" id="v-10" /><Label htmlFor="v-10">Permitir hasta ±10%</Label></div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Custom" id="v-custom" />
                                    <Label htmlFor="v-custom">Personalizado:</Label>
                                    {data.variacionPermitida === 'Custom' && (
                                        <Input 
                                            type="number" 
                                            min={0} 
                                            className="w-20 ml-2" 
                                            value={data.variacionPersonalizada || ''} 
                                            onChange={(e) => handleUpdate('variacionPersonalizada', parseInt(e.target.value) || null)} 
                                        />
                                    )}
                                    {data.variacionPermitida === 'Custom' && <span className="text-sm">%</span>}
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección B: Modalidad de Pago */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Modalidad de Pago *</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup value={data.modalidadPago} onValueChange={(val: any) => handleUpdate('modalidadPago', val)} className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Contado" id="p-contado" /><Label htmlFor="p-contado">Contado</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Plazo 30 días" id="p-30" /><Label htmlFor="p-30">Plazo 30 días</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Plazo 60 días" id="p-60" /><Label htmlFor="p-60">Plazo 60 días</Label></div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Personalizado" id="p-custom" />
                                <Label htmlFor="p-custom">Personalizado:</Label>
                                {data.modalidadPago === 'Personalizado' && (
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        className="w-20 ml-2" 
                                        value={data.plazoPersonalizadoDias || ''} 
                                        onChange={(e) => handleUpdate('plazoPersonalizadoDias', parseInt(e.target.value) || null)} 
                                    />
                                )}
                                {data.modalidadPago === 'Personalizado' && <span className="text-sm">días</span>}
                            </div>
                        </RadioGroup>
                        
                        {/* Otros términos checkbox */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox 
                                id="otros-terminos-check" 
                                checked={!!data.otrosTerminosPago} 
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        // No hacemos nada, el input maneja el valor
                                    } else {
                                        handleUpdate('otrosTerminosPago', '');
                                    }
                                }} 
                            />
                            <Label htmlFor="otros-terminos-check" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Agregar otros términos de pago especiales
                            </Label>
                        </div>
                        {!!data.otrosTerminosPago && (
                            <Textarea 
                                placeholder="Describe otros términos de pago..."
                                value={data.otrosTerminosPago}
                                onChange={(e) => handleUpdate('otrosTerminosPago', e.target.value)}
                                rows={2}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Sección C: Garantías Requeridas */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Garantías Requeridas</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* Garantía de seriedad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="garantia-seriedad" checked={data.garantiaSeriedad} onCheckedChange={(checked) => handleUpdate('garantiaSeriedad', !!checked)} />
                                <Label htmlFor="garantia-seriedad">Garantía de seriedad de oferta</Label>
                            </div>
                            {data.garantiaSeriedad && (
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        max={100} 
                                        className="w-24" 
                                        value={data.montoSeriedad || ''} 
                                        onChange={(e) => handleUpdate('montoSeriedad', parseInt(e.target.value) || null)} 
                                    />
                                    <span className="text-sm">% del Monto Base. Calculado: <span className="font-semibold">{formatMonto(montoSeriedadCalculado)}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Garantía de fiel cumplimiento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="garantia-cumplimiento" checked={data.garantiaFielCumplimiento} onCheckedChange={(checked) => handleUpdate('garantiaFielCumplimiento', !!checked)} />
                                <Label htmlFor="garantia-cumplimiento">Garantía de fiel cumplimiento</Label>
                            </div>
                            {data.garantiaFielCumplimiento && (
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        max={100} 
                                        className="w-24" 
                                        value={data.montoCumplimiento || ''} 
                                        onChange={(e) => handleUpdate('montoCumplimiento', parseInt(e.target.value) || null)} 
                                    />
                                    <span className="text-sm">% del Monto Base. Calculado: <span className="font-semibold">{formatMonto(montoCumplimientoCalculado)}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Otras garantías */}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="otras-garantias" checked={data.otrasGarantiasEspeciales} onCheckedChange={(checked) => handleUpdate('otrasGarantiasEspeciales', !!checked)} />
                            <Label htmlFor="otras-garantias">Otras garantías especiales</Label>
                        </div>
                        {data.otrasGarantiasEspeciales && (
                            <Textarea 
                                placeholder="Describe otras garantías especiales requeridas..."
                                value={data.descripcionOtrasGarantias}
                                onChange={(e) => handleUpdate('descripcionOtrasGarantias', e.target.value)}
                                rows={2}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Sección D: Términos Comerciales */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Términos Comerciales</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* Plazo de Validez */}
                        <div className="space-y-2 md:w-1/2">
                            <Label htmlFor="validez-oferta">Plazo de Validez de la Oferta (días) *</Label>
                            <Input
                                id="validez-oferta"
                                type="number"
                                min={1}
                                max={365}
                                value={data.validezOfertaDias || ''}
                                onChange={(e) => handleUpdate('validezOfertaDias', parseInt(e.target.value) || null)}
                                placeholder="30"
                            />
                            <p className="text-sm text-muted-foreground">¿Por cuántos días serán válidas las ofertas?</p>
                        </div>

                        {/* Formas de Pago Aceptadas */}
                        <div className="space-y-2">
                            <Label>Formas de Pago Aceptadas *</Label>
                            <div className="flex flex-wrap gap-6">
                                {['Transferencia Bancaria', 'Cheque', 'Efectivo', 'Tarjeta de Crédito'].map(fp => (
                                    <div key={fp} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`fp-${fp}`}
                                            checked={data.formasPagoAceptadas.includes(fp)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    handleUpdate('formasPagoAceptadas', [...data.formasPagoAceptadas, fp]);
                                                } else {
                                                    handleUpdate('formasPagoAceptadas', data.formasPagoAceptadas.filter(item => item !== fp));
                                                }
                                            }}
                                            disabled={fp === 'Efectivo' && (data.presupuestoBase || 0) > 1000000} // Mock: solo si <$1M
                                        />
                                        <Label htmlFor={`fp-${fp}`}>{fp}</Label>
                                        {fp === 'Efectivo' && (data.presupuestoBase || 0) > 1000000 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Paso 4: Fechas y Plazos
    const Step4 = () => {
        const createTimeOptions = (start: number, end: number, step: number = 30): string[] => {
            const times: string[] = [];
            for (let h = start; h <= end; h++) {
                for (let m = 0; m < 60; m += step) {
                    const hour = String(h).padStart(2, '0');
                    const minute = String(m).padStart(2, '0');
                    times.push(`${hour}:${minute}`);
                }
            }
            return times;
        };

        const timeOptions = createTimeOptions(0, 23, 30);
        const atencionOptions = createTimeOptions(0, 23, 30);
        
        // Días para Cierre (read-only)
        const daysToClose = useMemo(() => {
            if (data.fechaPublicacion && data.fechaCierre) {
                const pubDateTime = new Date(data.fechaPublicacion);
                const closeDateTime = new Date(data.fechaCierre);
                
                const [pubH, pubM] = data.horaPublicacion.split(':').map(Number);
                const [closeH, closeM] = data.horaCierre.split(':').map(Number);
                pubDateTime.setHours(pubH, pubM, 0, 0);
                closeDateTime.setHours(closeH, closeM, 0, 0);

                const diffTime = closeDateTime.getTime() - pubDateTime.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays;
            }
            return 0;
        }, [data.fechaPublicacion, data.fechaCierre, data.horaPublicacion, data.horaCierre]);
        
        // Min date for closure and evaluation
        const minCloseDate = data.fechaPublicacion ? new Date(data.fechaPublicacion.getTime() + 24 * 60 * 60 * 1000) : new Date();
        const minEvalDate = data.fechaCierre || new Date();

        const addHito = () => {
            const newId = Math.max(...data.hitosAdicionales.map(h => h.id), 0) + 1;
            handleUpdate('hitosAdicionales', [...data.hitosAdicionales, { id: newId, nombre: `Hito ${newId}`, fecha: null, hora: '09:00' }]);
        };
        const removeHito = (id: number) => {
            handleUpdate('hitosAdicionales', data.hitosAdicionales.filter(h => h.id !== id));
        };
        const handleHitoChange = (id: number, field: 'nombre' | 'fecha' | 'hora', value: any) => {
            handleUpdate('hitosAdicionales', data.hitosAdicionales.map(h => h.id === id ? { ...h, [field]: value } : h));
        };

        return (
            <div className="space-y-8">
                {/* Timeline Visual (Simplificado) */}
                <div className="flex justify-between items-start py-4">
                    {['Publicación', 'Cierre', 'Evaluación', 'Adjudicación'].map((label, index) => (
                        <div key={label} className="flex flex-col items-center w-1/4 relative">
                            <div className={cn(
                                "h-8 w-8 rounded-full border-4 flex items-center justify-center text-white font-bold text-sm z-10",
                                index === 0 ? 'bg-green-500 border-green-300' : 
                                index === 1 ? 'bg-red-500 border-red-300' :
                                index === 2 ? 'bg-blue-500 border-blue-300' : 
                                'bg-green-700 border-green-500'
                            )}>
                                {index + 1}
                            </div>
                            <span className="mt-2 text-center text-xs font-medium whitespace-nowrap">{label}</span>
                            {index < 3 && <div className="absolute top-4 left-1/2 right-0 h-0.5 bg-gray-300 -translate-x-1/2 z-0" style={{ width: '100%' }}></div>}
                        </div>
                    ))}
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-xl">Fechas Clave *</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Fecha de Publicación */}
                            <div className="space-y-2">
                                <Label>Fecha de Publicación *</Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !data.fechaPublicacion && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.fechaPublicacion ? format(data.fechaPublicacion, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.fechaPublicacion || undefined}
                                                onSelect={(date) => handleUpdate('fechaPublicacion', date || null)}
                                                initialFocus
                                                locale={es}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Select value={data.horaPublicacion} onValueChange={(val) => handleUpdate('horaPublicacion', val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue placeholder="Hora" />
                                        </SelectTrigger>
                                        <SelectContent className="h-48">
                                            <ScrollArea className="h-full">
                                                {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {/* Fecha de Cierre */}
                            <div className="space-y-2">
                                <Label>Fecha y Hora de Cierre *</Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !data.fechaCierre && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.fechaCierre ? format(data.fechaCierre, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.fechaCierre || undefined}
                                                onSelect={(date) => handleUpdate('fechaCierre', date || null)}
                                                initialFocus
                                                locale={es}
                                                // Min date validation for closure
                                                disabled={(date) => date < minCloseDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Select value={data.horaCierre} onValueChange={(val) => handleUpdate('horaCierre', val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue placeholder="Hora" />
                                        </SelectTrigger>
                                        <SelectContent className="h-48">
                                            <ScrollArea className="h-full">
                                                {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Días para Cierre */}
                            <div className="space-y-2">
                                <Label>Días para Cierre</Label>
                                <Input value={daysToClose > 0 ? `${daysToClose} días` : 'Selecciona fechas válidas'} readOnly className="bg-gray-100 font-semibold" />
                                <p className="text-sm text-muted-foreground">La licitación estará abierta por este periodo.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4">
                            {/* Fecha de Evaluación */}
                            <div className="space-y-2">
                                <Label>Fecha de Evaluación (Estimada)</Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !data.fechaEvaluacion && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.fechaEvaluacion ? format(data.fechaEvaluacion, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.fechaEvaluacion || undefined}
                                                onSelect={(date) => handleUpdate('fechaEvaluacion', date || null)}
                                                initialFocus
                                                locale={es}
                                                // Min date validation for evaluation
                                                disabled={(date) => date <= minEvalDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Select value={data.horaEvaluacion} onValueChange={(val) => handleUpdate('horaEvaluacion', val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue placeholder="Hora" />
                                        </SelectTrigger>
                                        <SelectContent className="h-48">
                                            <ScrollArea className="h-full">
                                                {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {/* Fecha Estimada de Adjudicación */}
                            <div className="space-y-2">
                                <Label>Fecha Estimada de Adjudicación</Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !data.fechaAdjudicacion && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.fechaAdjudicacion ? format(data.fechaAdjudicacion, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.fechaAdjudicacion || undefined}
                                                onSelect={(date) => handleUpdate('fechaAdjudicacion', date || null)}
                                                initialFocus
                                                locale={es}
                                                // Min date validation
                                                disabled={(date) => date <= (data.fechaEvaluacion || new Date())}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* Horario de Atención */}
                        <div className="space-y-2">
                            <Label>Horario de Atención para Aclaraciones</Label>
                            <div className="flex items-center gap-2">
                                <Label>De las</Label>
                                <Select value={data.horarioAtencionInicio} onValueChange={(val) => handleUpdate('horarioAtencionInicio', val)}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="h-48">
                                        <ScrollArea className="h-full">
                                            {atencionOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                                <Label>a las</Label>
                                <Select value={data.horarioAtencionFin} onValueChange={(val) => handleUpdate('horarioAtencionFin', val)}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="h-48">
                                        <ScrollArea className="h-full">
                                            {atencionOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hitos Adicionales */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-xl">Hitos Adicionales</CardTitle><Button variant="outline" size="sm" onClick={addHito}>+ Nuevo Hito</Button></CardHeader>
                    <CardContent className="space-y-3">
                        {data.hitosAdicionales.map(hito => (
                            <div key={hito.id} className="flex items-center gap-3 p-2 border rounded-md bg-gray-50">
                                <Input 
                                    value={hito.nombre} 
                                    onChange={(e) => handleHitoChange(hito.id, 'nombre', e.target.value)} 
                                    placeholder="Nombre del Hito"
                                    className="w-1/3"
                                />
                                <div className="flex items-center gap-2 w-1/3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className="w-full justify-start font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {hito.fecha ? format(hito.fecha, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={hito.fecha || undefined}
                                                onSelect={(date) => handleHitoChange(hito.id, 'fecha', date || null)}
                                                initialFocus
                                                locale={es}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Select value={hito.hora} onValueChange={(val) => handleHitoChange(hito.id, 'hora', val)}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue placeholder="Hora" />
                                    </SelectTrigger>
                                    <SelectContent className="h-48">
                                        <ScrollArea className="h-full">
                                            {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => removeHito(hito.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Paso 5: Evaluación y Criterios
    const Step5 = () => {
        const totalPonderacion = data.criterios.reduce((sum, c) => sum + c.ponderacion, 0);

        const handleCriterioChange = (id: number, field: 'nombre' | 'ponderacion' | 'min' | 'max', value: any) => {
            handleUpdate('criterios', data.criterios.map(c => c.id === id ? { ...c, [field]: value } : c));
        };

        const addCriterio = () => {
            const newId = Math.max(...data.criterios.map(c => c.id), 0) + 1;
            handleUpdate('criterios', [...data.criterios, { id: newId, nombre: `Nuevo Criterio ${newId}`, ponderacion: 0, min: 0, max: 100, pesoAutomatico: false }]);
        };

        const removeCriterio = (id: number) => {
            handleUpdate('criterios', data.criterios.filter(c => c.id !== id));
        };

        const handleRequisitoChange = (id: number, field: 'nombre' | 'descripcion' | 'puntajeMinimo', value: any) => {
            handleUpdate('requisitosMinimos', data.requisitosMinimos.map(r => r.id === id ? { ...r, [field]: value } : r));
        };

        const addRequisito = () => {
            const newId = Math.max(...data.requisitosMinimos.map(r => r.id), 0) + 1;
            handleUpdate('requisitosMinimos', [...data.requisitosMinimos, { id: newId, nombre: '', descripcion: '', puntajeMinimo: '' }]);
        };

        const removeRequisito = (id: number) => {
            handleUpdate('requisitosMinimos', data.requisitosMinimos.filter(r => r.id !== id));
        };


        return (
            <div className="space-y-8">
                {/* Sección A: Tipo de Evaluación */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Tipo de Evaluación *</CardTitle></CardHeader>
                    <CardContent>
                        <RadioGroup value={data.tipoEvaluacion} onValueChange={(val: any) => handleUpdate('tipoEvaluacion', val)} className="space-y-3">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Automática" id="e-auto" /><Label htmlFor="e-auto">Automática (Mejor Precio)</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Puntaje" id="e-puntaje" /><Label htmlFor="e-puntaje">Puntaje (Criterios Múltiples Ponderados)</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Mixta" id="e-mixta" /><Label htmlFor="e-mixta">Mixta</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Custom" id="e-custom" /><Label htmlFor="e-custom">Manual / Personalizada</Label></div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Tabla de Criterios (Si Puntaje o Mixta) */}
                {(data.tipoEvaluacion === 'Puntaje' || data.tipoEvaluacion === 'Mixta') && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Criterios de Puntuación</CardTitle>
                            <Button variant="outline" size="sm" onClick={addCriterio}>+ Agregar criterio</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="py-2 px-3 w-1/4">Criterio</th>
                                            <th className="py-2 px-3 w-1/6">Ponderación (%)</th>
                                            <th className="py-2 px-3 w-1/6">Mín</th>
                                            <th className="py-2 px-3 w-1/6">Máx</th>
                                            <th className="py-2 px-3 w-1/12 text-center">Auto</th>
                                            <th className="py-2 px-3 w-1/12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.criterios.map(c => (
                                            <tr key={c.id}>
                                                <td className="py-2 px-3"><Input value={c.nombre} onChange={(e) => handleCriterioChange(c.id, 'nombre', e.target.value)} placeholder="Nombre del criterio" /></td>
                                                <td className="py-2 px-3"><Input type="number" min={0} max={100} value={c.ponderacion} onChange={(e) => handleCriterioChange(c.id, 'ponderacion', parseInt(e.target.value) || 0)} /></td>
                                                <td className="py-2 px-3"><Input type="number" min={0} max={100} value={c.min} onChange={(e) => handleCriterioChange(c.id, 'min', parseInt(e.target.value) || 0)} /></td>
                                                <td className="py-2 px-3"><Input type="number" min={0} max={100} value={c.max} onChange={(e) => handleCriterioChange(c.id, 'max', parseInt(e.target.value) || 0)} /></td>
                                                <td className="py-2 px-3 text-center"><Checkbox checked={c.pesoAutomatico} onCheckedChange={(checked) => handleUpdate('criterios', data.criterios.map(cr => cr.id === c.id ? { ...cr, pesoAutomatico: !!checked } : cr))} /></td>
                                                <td className="py-2 px-3 text-center"><Button variant="ghost" size="icon" onClick={() => removeCriterio(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={cn("mt-4 p-3 rounded-lg font-semibold text-right", totalPonderacion === 100 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                                Total Ponderación: {totalPonderacion}% {totalPonderacion !== 100 && <span className="text-sm">(Debe sumar 100%)</span>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sección B: Desempate */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Regla de Desempate</CardTitle></CardHeader>
                    <CardContent>
                        <RadioGroup value={data.reglaDesempate} onValueChange={(val: any) => handleUpdate('reglaDesempate', val)} className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Menor precio" id="d-precio" /><Label htmlFor="d-precio">Menor precio</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Orden de presentación" id="d-orden" /><Label htmlFor="d-orden">Orden de presentación</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Sorteo" id="d-sorteo" /><Label htmlFor="d-sorteo">Sorteo</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Manual" id="d-manual" /><Label htmlFor="d-manual">Manual</Label></div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Sección C: Requisitos Mínimos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="req-min" checked={data.aplicarRequisitosMinimos} onCheckedChange={(checked) => handleUpdate('aplicarRequisitosMinimos', !!checked)} />
                            <CardTitle className="text-xl">Aplicar Requisitos Mínimos</CardTitle>
                        </div>
                    </CardHeader>
                    {data.aplicarRequisitosMinimos && (
                        <CardContent className="space-y-4">
                            <Button variant="outline" size="sm" onClick={addRequisito}>+ Agregar requisito</Button>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="py-2 px-3 w-1/4">Requisito</th>
                                            <th className="py-2 px-3 w-1/3">Descripción</th>
                                            <th className="py-2 px-3 w-1/4">Puntaje Mínimo (o "Obligatorio")</th>
                                            <th className="py-2 px-3 w-1/12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.requisitosMinimos.map(r => (
                                            <tr key={r.id}>
                                                <td className="py-2 px-3"><Input value={r.nombre} onChange={(e) => handleRequisitoChange(r.id, 'nombre', e.target.value)} placeholder="Ej: Certificación" /></td>
                                                <td className="py-2 px-3"><Input value={r.descripcion} onChange={(e) => handleRequisitoChange(r.id, 'descripcion', e.target.value)} placeholder="Ej: ISO 9001" /></td>
                                                <td className="py-2 px-3"><Input value={r.puntajeMinimo} onChange={(e) => handleRequisitoChange(r.id, 'puntajeMinimo', e.target.value)} placeholder="Ej: 40 o 'Obligatorio'" /></td>
                                                <td className="py-2 px-3 text-center"><Button variant="ghost" size="icon" onClick={() => removeRequisito(r.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        );
    };

    // Paso 6: Revisión Final
    const Step6 = () => {
        const CriteriosTable = () => (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="font-semibold border-b">
                            <th className="py-1 px-2 text-left">Criterio</th>
                            <th className="py-1 px-2 text-right">Pond.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.criterios.map(c => (
                            <tr key={c.id} className="border-b last:border-b-0">
                                <td className="py-1 px-2">{c.nombre}</td>
                                <td className="py-1 px-2 text-right font-medium">{c.ponderacion}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        const checkStepStatus = (stepNum: number) => {
            if (checkStepCompleteness(stepNum)) {
                return { icon: <Check className="h-5 w-5 text-green-500" />, status: 'Completo' };
            } else {
                return { icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />, status: 'Incompleto' };
            }
        };

        const totalPonderacion = data.criterios.reduce((sum, c) => sum + c.ponderacion, 0);

        const checklistFinal = [
            { label: 'Toda información obligatoria verificada', completed: isStepValid },
            { label: 'Documentos anexados (si aplica)', completed: data.anexos.length > 0 || data.especificaciones.some(s => s.spec) },
            { label: 'Criterios de evaluación definidos y sumados al 100% (si aplica)', completed: data.tipoEvaluacion !== 'Puntaje' && data.tipoEvaluacion !== 'Mixta' || totalPonderacion === 100 },
            { label: 'Cronograma válido (fechas coherentes)', completed: checkStepCompleteness(4) },
        ];


        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Resumen de la Licitación</h2>
                <p className="text-muted-foreground">Revisa cuidadosamente cada sección. Usa el botón "Editar" para realizar ajustes.</p>

                {/* Tarjetas de Resumen */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Tarjeta 1: Información General */}
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                                {checkStepStatus(1).icon} Información General
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setStep(1)}>Editar</Button>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>ID:</strong> {data.id}</p>
                            <p><strong>Título:</strong> {data.titulo || 'N/A'}</p>
                            <p><strong>Rubro:</strong> {data.rubro || 'N/A'}</p>
                            <p><strong>Tipo:</strong> {data.tipoLicitacion} {data.tipoLicitacion === 'Cerrada' && `(${data.numProveedores} prov.)`}</p>
                            <p><strong>Organismo:</strong> {ORGANISMOS_MOCK.find(o => o.id === data.organismo)?.nombre || 'N/A'}</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta 2: Especificaciones y Anexos */}
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                                {checkStepStatus(2).icon} Especificaciones
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setStep(2)}>Editar</Button>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Especificaciones:</strong> {data.especificaciones.filter(s => s.spec).length} filas definidas</p>
                            <p><strong>Anexos:</strong> {data.anexos.length} documentos ({data.imagenesReferencia.length} imágenes)</p>
                            <p className="text-xs text-muted-foreground italic">Detalles en Paso 2</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta 3: Presupuesto y Términos */}
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                                {checkStepStatus(3).icon} Presupuesto y Términos
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setStep(3)}>Editar</Button>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Monto Base:</strong> <span className="font-semibold">{formatMonto(data.presupuestoBase)}</span></p>
                            <p><strong>Monto Máximo:</strong> <span className="font-semibold">{formatMonto(data.presupuestoMaximo)}</span></p>
                            <p><strong>Pago:</strong> {data.modalidadPago} {data.modalidadPago === 'Personalizado' && `(${data.plazoPersonalizadoDias} días)`}</p>
                            <p><strong>Validez Oferta:</strong> {data.validezOfertaDias} días</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta 4: Cronograma */}
                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                                {checkStepStatus(4).icon} Cronograma
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setStep(4)}>Editar</Button>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Publicación:</strong> {data.fechaPublicacion ? format(data.fechaPublicacion, 'PPP', { locale: es }) : 'N/A'} {data.horaPublicacion}</p>
                            <p><strong>Cierre:</strong> {data.fechaCierre ? format(data.fechaCierre, 'PPP', { locale: es }) : 'N/A'} {data.horaCierre}</p>
                            <p><strong>Adjudicación:</strong> {data.fechaAdjudicacion ? format(data.fechaAdjudicacion, 'PPP', { locale: es }) : 'N/A'}</p>
                            <p><strong>Hitos Adicionales:</strong> {data.hitosAdicionales.length}</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta 5: Criterios de Evaluación */}
                    <Card className="shadow-lg md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-3">
                                {checkStepStatus(5).icon} Criterios de Evaluación
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setStep(5)}>Editar</Button>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <p><strong>Tipo:</strong> {data.tipoEvaluacion}</p>
                            {(data.tipoEvaluacion === 'Puntaje' || data.tipoEvaluacion === 'Mixta') && (
                                <div className="space-y-2">
                                    <p className={cn("font-medium", totalPonderacion === 100 ? 'text-green-600' : 'text-red-600')}>Ponderación Total: {totalPonderacion}%</p>
                                    <CriteriosTable />
                                </div>
                            )}
                            <p><strong>Desempate:</strong> {data.reglaDesempate}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Checklist Pre-Lanzamiento */}
                <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardHeader><CardTitle className="text-xl text-blue-800">Checklist Pre-Lanzamiento</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {checklistFinal.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                {item.completed ? <Check className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                                <span className={cn("text-base", item.completed ? 'text-gray-700' : 'text-gray-900 font-medium')}>{item.label}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    };

    // --- STEPPER VISUAL ---
    const Stepper = () => (
        <div className="flex justify-between items-start mb-8 p-4 bg-white rounded-lg shadow-md overflow-x-auto whitespace-nowrap">
            {PASOS.map((p) => {
                const isActive = p.id === step;
                const isCompleted = p.id < step && checkStepCompleteness(p.id);

                return (
                    <React.Fragment key={p.id}>
                        <div 
                            className={cn(
                                "flex flex-col items-center cursor-pointer transition-colors",
                                isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'
                            )}
                            onClick={() => {
                                if (p.id < step) setStep(p.id);
                                if (p.id === step) return; // Permitir solo saltar hacia atrás
                                toast.info('Debe completar el paso actual para avanzar.');
                            }}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-sm",
                                isActive ? 'bg-primary text-white border-primary' : 
                                isCompleted ? 'bg-green-100 text-green-600 border-green-600' : 
                                'bg-white border-gray-400'
                            )}>
                                {isCompleted ? <Check className="h-4 w-4" /> : p.id}
                            </div>
                            <span className="mt-2 text-xs md:text-sm font-medium text-center">{p.label}</span>
                        </div>
                        {p.id < PASOS.length && (
                            <div className={cn(
                                "h-0.5 mt-4 flex-1 mx-2 transition-colors",
                                isCompleted ? 'bg-green-500' : 'bg-gray-300'
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    // --- RENDERIZADO PRINCIPAL DEL WIZARD ---
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Crear Nueva Licitación</h1>

            <Stepper />

            <Card className="p-6 md:p-8">
                <CardTitle className="mb-6 text-2xl font-semibold text-gray-800">{PASOS[step - 1].label}</CardTitle>
                <div className="min-h-[400px]">
                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                    {step === 4 && <Step4 />}
                    {step === 5 && <Step5 />}
                    {step === 6 && <Step6 />}
                </div>
            </Card>

            {/* Botones de Navegación y Borrador */}
            <div className="mt-8 flex justify-between items-center border-t pt-4">
                <Button 
                    variant="outline" 
                    onClick={handlePrev} 
                    disabled={step === 1}
                >
                    Anterior
                </Button>

                <div className="flex items-center gap-4">
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <span className="text-sm text-muted-foreground">{isSaving ? 'Guardando borrador...' : 'Borrador guardado'}</span>
                    
                    {step < PASOS.length ? (
                        <Button onClick={handleNext} disabled={!isStepValid}>
                            Siguiente
                        </Button>
                    ) : (
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={handleSaveDraft}>Guardar como Borrador</Button>
                            <Button onClick={handlePublicar} disabled={!isStepValid}>
                                Publicar Licitación
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Modal de Confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-sm p-6 space-y-4">
                        <CardTitle>¿Publicar esta licitación?</CardTitle>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Una vez publicada, no se puede editar el presupuesto ni el cronograma.</p>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                                <Button onClick={confirmPublicacion}>Confirmar Publicación</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}