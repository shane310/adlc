import type { CertificationType, ChecklistItem } from './types';

const GENERIC: ChecklistItem[] = [
  {
    id: 'gen-1',
    title: 'Legal entity documents',
    description: 'Certificate of incorporation or business registration and proof of legal status.',
  },
  {
    id: 'gen-2',
    title: 'Organizational structure',
    description: 'A current organization chart and short description of key roles related to the scope of certification.',
  },
  {
    id: 'gen-3',
    title: 'Process documentation',
    description: 'Core process descriptions or flowcharts covering the certification scope.',
  },
  {
    id: 'gen-4',
    title: 'Policy statements',
    description: 'Signed policies as required for the chosen certification (e.g. quality, environmental, health & safety).',
  },
];

const BY_TYPE: Record<CertificationType, ChecklistItem[]> = {
  iso9001: [
    {
      id: 'qms-1',
      title: 'Quality manual or documented management system',
      description: 'Document describing how the QMS is implemented for the defined scope.',
    },
    {
      id: 'qms-2',
      title: 'Process map / turtle diagrams',
      description: 'Where applicable, process interactions for product/service realization.',
    },
    {
      id: 'qms-3',
      title: 'Internal audit and management review records',
      description: 'Evidence of planned audits, findings, and management review of the QMS (last 12 months).',
    },
    {
      id: 'qms-4',
      title: 'Documented procedures for key processes',
      description: 'Control of operations, design (if applicable), and related documented information.',
    },
  ],
  iso14001: [
    {
      id: 'ems-1',
      title: 'Environmental policy',
      description: 'Signed policy covering commitments, compliance obligations, and continuous improvement.',
    },
    {
      id: 'ems-2',
      title: 'Environmental aspects and impacts register',
      description: 'Identification of significant aspects and related operational controls.',
    },
    {
      id: 'ems-3',
      title: 'Legal and other requirements register',
      description: 'Applicable environmental legislation and how compliance is evaluated.',
    },
    {
      id: 'ems-4',
      title: 'Objectives, targets and programs',
      description: 'Measurable environmental objectives and evidence of progress.',
    },
  ],
  iso45001: [
    {
      id: 'ohs-1',
      title: 'OH&S policy',
      description: 'Policy covering worker participation, hazards, and commitments for a safe workplace.',
    },
    {
      id: 'ohs-2',
      title: 'Hazard identification and risk assessment',
      description: 'Documented methodology and outputs for operational hazards in scope.',
    },
    {
      id: 'ohs-3',
      title: 'Emergency preparedness',
      description: 'Plans, drills or exercise records for foreseeable emergency situations.',
    },
    {
      id: 'ohs-4',
      title: 'Incident and nonconformity records',
      description: 'Reporting, investigation, corrective actions, and follow-up for OH&S events.',
    },
  ],
  fssc22000: [
    {
      id: 'fs-1',
      title: 'Food safety management system manual',
      description: 'Prerequisite programs, HACCP/PRP and FSMS description for the food chain scope.',
    },
    {
      id: 'fs-2',
      title: 'HACCP / hazard control plan',
      description: 'Hazard analysis, CCP/OPRP determination, and critical limits as applicable.',
    },
    {
      id: 'fs-3',
      title: 'Traceability and recall procedure',
      description: 'Evidence of a tested traceability exercise or simulation where applicable.',
    },
    {
      id: 'fs-4',
      title: 'Validation and verification records',
      description: 'Records demonstrating control measures are effective (cleaning, temperature, etc.).',
    },
  ],
};

export const CERTIFICATION_TYPES: CertificationType[] = [
  'iso9001',
  'iso14001',
  'iso45001',
  'fssc22000',
];

export function listCertificationTypes(): CertificationType[] {
  return [...CERTIFICATION_TYPES];
}

function isCertificationType(v: string): v is CertificationType {
  return (CERTIFICATION_TYPES as string[]).includes(v);
}

export function getStandardChecklist(type: string): { items: ChecklistItem[] } {
  const key = isCertificationType(type) ? type : null;
  const items = key ? BY_TYPE[key] : GENERIC;
  return { items: items.map((i) => ({ ...i })) };
}
