import { EventConfig } from '../domain/models/event';

export const OFFICIAL_EVENT_CONFIG: EventConfig = {
  eventName: 'PEI Compromiso 360°',
  peiPeriod: '2027–2031',
  name: 'PEI',
  motto: 'IDENTIDAD · EXCELENCIA · MISIÓN',
  officialStatementVersion: 'v1.0-2027-2031',
  officialStatementTitle: 'Declaración Solemne de Adhesión y Compromiso Institucional',
  officialStatementText:
    'Como integrante de la comunidad universitaria, asumo con convicción y responsabilidad mi participación activa en la ejecución del Plan Estratégico Institucional 2027–2031. Me comprometo a orientar mis funciones cotidianas hacia la excelencia académica, la integridad ética, el desarrollo integral del estudiante, la innovación en la investigación y el servicio trascendente a la sociedad.',
  ceremonyActive: true,
  totalTargetParticipants: 1550,
};

export const CAMPUS_TARGETS = {
  LIM: 850,
  JUL: 400,
  TPP: 300,
};
