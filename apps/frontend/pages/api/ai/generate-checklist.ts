import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePersonalizedChecklist } from '../../../lib/ai/generateChecklistService';
import { CERTIFICATION_TYPES } from '../../../lib/ai/standardChecklists';
import type { CertificationType, ChecklistResult } from '../../../lib/ai/types';

type ErrorBody = { error: string };

function isClientPayload(
  body: unknown
): body is {
  certificationType: string;
  industry: string;
  employeeCount: string;
  businessDescription?: string;
} {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.certificationType === 'string' &&
    b.certificationType.length > 0 &&
    typeof b.industry === 'string' &&
    b.industry.length > 0 &&
    typeof b.employeeCount === 'string' &&
    b.employeeCount.length > 0 &&
    (b.businessDescription === undefined || typeof b.businessDescription === 'string')
  );
}

function isCertificationType(v: string): v is CertificationType {
  return (CERTIFICATION_TYPES as string[]).includes(v);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChecklistResult | ErrorBody>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isClientPayload(req.body) || !isCertificationType(req.body.certificationType)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const result = await generatePersonalizedChecklist({
    certificationType: req.body.certificationType,
    industry: req.body.industry,
    employeeCount: req.body.employeeCount,
    businessDescription: req.body.businessDescription,
  });

  return res.status(200).json(result);
}
