export type CertificationType = 'iso9001' | 'iso14001' | 'iso45001' | 'fssc22000';

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
};

export type ChecklistPayload = {
  certificationType: CertificationType;
  industry: string;
  employeeCount: string;
  businessDescription?: string;
};

export type ChecklistResult = {
  source: 'ai' | 'fallback';
  items: ChecklistItem[];
  /** 非错误成功时无消息；回退时提示用户 */
  message?: string;
};
