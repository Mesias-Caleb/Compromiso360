import { Area } from '../domain/models/area';

export const UNIVERSITY_AREAS: Area[] = [
  { id: 'acad-fac-ing', name: 'Facultad de Ingeniería y Arquitectura', category: 'Academica' },
  { id: 'acad-fac-salud', name: 'Facultad de Ciencias de la Salud', category: 'Academica' },
  { id: 'acad-fac-emp', name: 'Facultad de Ciencias Empresariales', category: 'Academica' },
  { id: 'acad-fac-hum', name: 'Facultad de Humanidades y Educación', category: 'Academica' },
  { id: 'acad-posgrado', name: 'Escuela de Posgrado', category: 'Academica' },
  { id: 'inv-dir', name: 'Dirección General de Investigación e Innovación', category: 'Investigacion' },
  { id: 'inv-centros', name: 'Centros e Institutos de Investigación', category: 'Investigacion' },
  { id: 'gest-rectorado', name: 'Rectorado y Vicerrectorados', category: 'Gestion' },
  { id: 'gest-calidad', name: 'Dirección de Calidad y Acreditación', category: 'Gestion' },
  { id: 'gest-planeamiento', name: 'Dirección de Planeamiento y Desarrollo Estratégico', category: 'Gestion' },
  { id: 'adm-ti', name: 'Dirección de Tecnologías de la Información', category: 'Administrativa' },
  { id: 'adm-rrhh', name: 'Dirección de Gestión del Talento Humano', category: 'Administrativa' },
  { id: 'adm-finanzas', name: 'Dirección de Administración y Finanzas', category: 'Administrativa' },
  { id: 'adm-bienestar', name: 'Dirección de Bienestar Universitario', category: 'Administrativa' },
  { id: 'adm-admision', name: 'Dirección de Admisión y Marketing', category: 'Administrativa' },
  { id: 'adm-operaciones', name: 'Mantenimiento, Seguridad y Servicios Generales', category: 'Administrativa' },
];

export function getAreaById(id: string): Area | undefined {
  return UNIVERSITY_AREAS.find((area) => area.id === id);
}
