import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = {
  id: string;
  avatar?: string;
  nombre: string;
  apellido: string;
  email: string;
  emailPersonal?: string;
  rut?: string;
  fechaNacimiento?: string;
  telefonoPersonal?: string;
  direccion?: any;
  cargo?: string;
  organizacion?: string;
  rol: "comprador" | "proveedor";
  fechaIngreso?: string;
  experiencia?: number;
  especialidades?: string[];
  bio?: string;
};

const sampleUser: User = {
  id: "USER-001",
  avatar: "",
  nombre: "María",
  apellido: "Pérez",
  email: "maria.perez@proveedor.cl",
  emailPersonal: "maria.perez@gmail.com",
  rut: "11.222.333-4",
  fechaNacimiento: "1990-04-12",
  telefonoPersonal: "+56998765432",
  cargo: "Gerente Comercial",
  organizacion: "Proveedor Demo SpA",
  rol: "proveedor",
  fechaIngreso: "2022-05-10",
  experiencia: 6,
  especialidades: ["Ventas","Comercial","Logística"],
  bio: "Representante del proveedor con experiencia en ventas y gestión de contratos.",
};

function validateRUT(rut: string){
  // basic normalization and DV check (expects format digits+ - + dv or with dots)
  if(!rut) return false;
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if(clean.length < 2) return false;
  const dv = clean.slice(-1);
  const nums = clean.slice(0, -1).split('').reverse().map(Number);
  let m = 2, sum = 0;
  for(const n of nums){ sum += n * m; m = m === 7 ? 2 : m + 1; }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dvCalc === dv;
}

function passwordStrength(pw: string){
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const strength = score <= 2 ? 'weak' : score === 3 || score === 4 ? 'medium' : 'strong';
  return { checks, score, strength };
}

export default function MiPerfil(){
  const { user: authUser } = useAuth();

  // If there's an authenticated user, prefer it for initial values so header/profile align.
  const initialUser: User = authUser ? {
    id: authUser.id,
    avatar: (authUser as any).foto || '',
    nombre: authUser.nombre,
    apellido: authUser.apellido,
    email: authUser.email,
    emailPersonal: '',
    rut: '',
    fechaNacimiento: '',
    telefonoPersonal: '',
    direccion: {},
    cargo: '',
    organizacion: '',
    rol: authUser.rol as any,
    fechaIngreso: '',
    experiencia: 0,
    especialidades: [],
    bio: '',
  } : sampleUser;

  const [user, setUser] = useState<User>(initialUser);
  const [tab, setTab] = useState<number>(1);

  // form state (personal)
  const [nombre, setNombre] = useState(user.nombre);
  const [apellido, setApellido] = useState(user.apellido);
  const [rut, setRut] = useState(user.rut || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(user.fechaNacimiento || '');
  const [emailPersonal, setEmailPersonal] = useState(user.emailPersonal || '');
  const [telefonoPersonal, setTelefonoPersonal] = useState(user.telefonoPersonal || '');
  const [cargo, setCargo] = useState(user.cargo || '');
  const [organizacion] = useState(user.organizacion || '');
  const [experiencia, setExperiencia] = useState<number>(user.experiencia || 0);
  const [especialidades, setEspecialidades] = useState<string[]>(user.especialidades || []);
  const [bio, setBio] = useState(user.bio || '');

  // security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const pwInfo = passwordStrength(newPassword);

  const specialties = ['Compras','Licitaciones','Finanzas','Legal','Técnico','Logística'];

  function toggleSpecialty(s:string){
    setEspecialidades(prev => prev.includes(s) ? prev.filter(x=>x!==s) : (prev.length<5 ? [...prev, s] : prev));
  }

  function savePersonal(){
    // validations
    const errors: string[] = [];
    if(!nombre) errors.push('Nombre es requerido');
    if(!apellido) errors.push('Apellido es requerido');
    if(!rut || !validateRUT(rut)) errors.push('RUT inválido');
    if(emailPersonal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailPersonal)) errors.push('Email personal inválido');
    if(experiencia < 0 || experiencia > 50) errors.push('Años de experiencia inválidos');
    if(bio.length > 500) errors.push('Bio excede 500 caracteres');
    if(errors.length){
      alert('Errores:\n' + errors.join('\n'));
      return;
    }
    // pretend save
    setUser(u=> ({ ...u, nombre, apellido, rut, fechaNacimiento, emailPersonal, telefonoPersonal, cargo, experiencia, especialidades, bio }));
    // show toast-like
    alert('Perfil actualizado correctamente');
  }

  function changePassword(){
    if(!currentPassword) return alert('Ingrese contraseña actual');
    if(newPassword !== confirmPassword) return alert('Las contraseñas no coinciden');
    if(pwInfo.score < 3) return alert('La nueva contraseña no cumple requisitos mínimos');
    // pretend API call
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    alert('Contraseña cambiada correctamente');
  }

  const sessions = useMemo(()=>[
    { id:1, device:'Windows PC', browser:'Chrome 119', location:'Santiago, Chile', last:'Hace 5 min', ip:'192.168.1.100', current:true },
    { id:2, device:'iPhone 14', browser:'Safari', location:'Santiago, Chile', last:'Hace 2 horas', ip:'192.168.1.105', current:false },
    { id:3, device:'MacBook Pro', browser:'Firefox', location:'Valparaíso', last:'Hace 3 días', ip:'200.123.45.67', current:false },
  ],[]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div>
              <Avatar className="w-28 h-28"><AvatarImage src={user.avatar || getAvatarUrl(user.nombre)} alt="avatar" /><AvatarFallback>{user.nombre[0]}</AvatarFallback></Avatar>
              <div className="text-sm text-center mt-2"><button className="text-blue-600">Editar foto</button></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.nombre} {user.apellido}</h1>
              <div className="mt-2 flex items-center gap-2"><Badge className="uppercase">{user.rol}</Badge><div className="text-gray-600">{user.email}</div></div>
              <div className="text-gray-500">{user.cargo}</div>
            </div>
          </div>

          <div>
            <Button className="bg-blue-600" onClick={()=> setTab(1)}>Editar Perfil</Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex gap-2 mb-4">
            <button onClick={()=> setTab(1)} className={`px-3 py-2 ${tab===1? 'bg-blue-100 rounded': ''}`}>Información Personal</button>
            <button onClick={()=> setTab(2)} className={`px-3 py-2 ${tab===2? 'bg-blue-100 rounded': ''}`}>Seguridad y Acceso</button>
            <button onClick={()=> setTab(3)} className={`px-3 py-2 ${tab===3? 'bg-blue-100 rounded': ''}`}>Notificaciones</button>
            <button onClick={()=> setTab(4)} className={`px-3 py-2 ${tab===4? 'bg-blue-100 rounded': ''}`}>Privacidad</button>
            <button onClick={()=> setTab(5)} className={`px-3 py-2 ${tab===5? 'bg-blue-100 rounded': ''}`}>Preferencias</button>
          </div>

          {tab===1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Datos Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Nombre *</label>
                    <Input value={nombre} onChange={(e:any)=> setNombre(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Apellido *</label>
                    <Input value={apellido} onChange={(e:any)=> setApellido(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">RUT *</label>
                    <Input value={rut} onChange={(e:any)=> setRut(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Fecha Nacimiento *</label>
                    <Input type="date" value={fechaNacimiento} onChange={(e:any)=> setFechaNacimiento(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Email Personal *</label>
                    <Input value={emailPersonal} onChange={(e:any)=> setEmailPersonal(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Teléfono Personal</label>
                    <Input value={telefonoPersonal} onChange={(e:any)=> setTelefonoPersonal(e.target.value)} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-sm">Dirección completa</label>
                  <Input placeholder="Calle y número" className="mt-1" />
                  <Input placeholder="Apartamento/Depto (opcional)" className="mt-1" />
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input placeholder="Comuna" />
                    <Input placeholder="Ciudad" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Select>
                      <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RM">Región Metropolitana</SelectItem>
                        <SelectItem value="V">Valparaíso</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Código Postal" />
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Información Profesional</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm">Cargo Actual *</label>
                    <Input value={cargo} onChange={(e:any)=> setCargo(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Organización / Empresa</label>
                    <div className="mt-1 text-gray-700">{organizacion} <a href="#" className="text-blue-600">Ver perfil empresa</a></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm">Departamento</label>
                      <Input />
                    </div>
                    <div>
                      <label className="text-sm">Fecha Ingreso</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm">Años Experiencia</label>
                      <Input type="number" value={experiencia} onChange={(e:any)=> setExperiencia(Number(e.target.value))} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Especialidades (max 5)</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {specialties.map(s => (
                        <button key={s} onClick={()=> toggleSpecialty(s)} className={`px-2 py-1 border rounded ${especialidades.includes(s)? 'bg-blue-100':''}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Bio / Descripción</label>
                    <textarea maxLength={500} value={bio} onChange={(e)=> setBio(e.target.value)} className="w-full border rounded p-2 mt-1 h-28" />
                    <div className="text-xs text-gray-500 mt-1">{bio.length}/500</div>
                  </div>
                </div>
              </div>

              <div className="col-span-full flex justify-end gap-2">
                <Button variant="ghost" onClick={()=> { /* restore original values */ setNombre(user.nombre); setApellido(user.apellido); setRut(user.rut || ''); setFechaNacimiento(user.fechaNacimiento || ''); setEmailPersonal(user.emailPersonal || ''); setTelefonoPersonal(user.telefonoPersonal || ''); setCargo(user.cargo || ''); setEspecialidades(user.especialidades || []); setBio(user.bio || ''); }}>Cancelar</Button>
                <Button className="bg-blue-600" onClick={savePersonal}>Guardar Cambios</Button>
              </div>
            </div>
          )}

          {tab===2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Cambiar Contraseña</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Contraseña Actual</label>
                    <Input type="password" value={currentPassword} onChange={(e:any)=> setCurrentPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Nueva Contraseña</label>
                    <Input type="password" value={newPassword} onChange={(e:any)=> setNewPassword(e.target.value)} />
                    <div className="text-xs mt-1">Requisitos:</div>
                    <ul className="text-xs list-disc ml-4">
                      <li className={pwInfo.checks.length? 'text-green-600':''}>Mínimo 8 caracteres: {pwInfo.checks.length ? '✓' : '✗'}</li>
                    </ul>
                    <div className="mt-2">Fuerza: <span className={`${pwInfo.strength==='weak'? 'text-red-600': pwInfo.strength==='medium'?'text-yellow-600':'text-green-600'}`}>{pwInfo.strength}</span></div>
                  </div>
                  <div>
                    <label className="text-sm">Confirmar Nueva Contraseña</label>
                    <Input type="password" value={confirmPassword} onChange={(e:any)=> setConfirmPassword(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="logoutAll" /> <label htmlFor="logoutAll" className="text-sm">Cerrar sesión en todos los dispositivos después de cambiar</label>
                  </div>
                  <div className="flex justify-end gap-2 mt-2"><Button className="bg-blue-600" onClick={changePassword}>Cambiar Contraseña</Button></div>
                </div>
              </div>

              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Autenticación de Dos Factores (2FA)</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Estado: <Badge className="bg-red-100 text-red-800">Desactivado</Badge></div>
                      <div className="text-sm text-gray-600">Tu cuenta NO está protegida con 2FA</div>
                    </div>
                    <div>
                      <Button className="bg-green-600">Activar 2FA</Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="font-medium">Sesiones Activas</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="px-3 py-2">Dispositivo</th><th className="px-3 py-2">Navegador</th><th className="px-3 py-2">Ubicación</th><th className="px-3 py-2">Última</th><th className="px-3 py-2">IP</th><th className="px-3 py-2">Acciones</th></tr></thead>
                        <tbody>
                          {sessions.map(s => (
                            <tr key={s.id} className="border-b"><td className="px-3 py-2">{s.device} {s.current && <Badge className="ml-2">Sesión Actual</Badge>}</td><td className="px-3 py-2">{s.browser}</td><td className="px-3 py-2">{s.location}</td><td className="px-3 py-2">{s.last}</td><td className="px-3 py-2">{s.ip}</td><td className="px-3 py-2">{!s.current && <button className="text-red-600">Cerrar Sesión</button>}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2"><button className="text-red-600">Cerrar Todas las Sesiones Excepto Esta</button></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab===3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Preferencias Email</h3>
                <div className="space-y-2 text-sm">
                  <div><input type="checkbox" defaultChecked /> Actualizaciones de cuenta</div>
                  <div><input type="checkbox" defaultChecked /> Avisos de seguridad</div>
                  <div><input type="checkbox" defaultChecked /> Nuevas oportunidades</div>
                  <div><input type="checkbox" /> Resumen diario de actividad</div>
                </div>
                <div className="flex justify-end mt-3"><Button className="bg-blue-600">Guardar Preferencias</Button></div>
              </div>
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Notificaciones In-App</h3>
                <div className="space-y-2 text-sm">
                  <div><input type="checkbox" defaultChecked /> Mostrar notificaciones desktop</div>
                  <div><input type="checkbox" defaultChecked /> Reproducir sonido</div>
                  <div><input type="checkbox" defaultChecked /> Mostrar contador badge en sidebar</div>
                </div>
                <div className="flex justify-end mt-3"><Button className="bg-blue-600">Guardar Preferencias</Button></div>
              </div>
            </div>
          )}

          {tab===4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Visibilidad Perfil</h3>
                <div className="space-y-2 text-sm">
                  <div><input type="radio" name="vis" defaultChecked /> Perfil Público</div>
                  <div><input type="radio" name="vis" /> Solo Red</div>
                  <div><input type="radio" name="vis" /> Privado</div>
                </div>
                <div className="mt-3"><Button className="bg-blue-600">Guardar</Button></div>
              </div>
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Datos y Privacidad</h3>
                <div className="space-y-2 text-sm">
                  <button className="text-blue-600">Descargar mis datos</button>
                  <div className="mt-3 bg-red-50 p-3 rounded">
                    <div className="font-semibold text-red-700">Eliminar Cuenta</div>
                    <p className="text-sm text-gray-700">Esta acción es irreversible</p>
                    <div className="mt-2"><button className="text-red-700">Eliminar mi Cuenta</button></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab===5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Apariencia</h3>
                <div className="space-y-2 text-sm">
                  <div><input type="radio" name="theme" defaultChecked /> Claro</div>
                  <div><input type="radio" name="theme" /> Sistema</div>
                  <div><input type="radio" name="theme" /> Oscuro</div>
                </div>
              </div>
              <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-3">Preferencias</h3>
                <div className="space-y-2 text-sm">
                  <div>Registros por página: <select defaultValue={20}><option>10</option><option>20</option><option>50</option></select></div>
                  <div>Idioma: <select defaultValue={'es'}><option value="es">Español</option><option value="en">English</option></select></div>
                </div>
                <div className="mt-3"><Button className="bg-blue-600">Guardar Preferencias</Button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
