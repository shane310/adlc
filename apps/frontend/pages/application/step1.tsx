import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { ChecklistItem, CertificationType } from '../../lib/ai/types';
import {
  readStoredApplication,
  writeStoredApplication,
  setChecklistOnApplication,
} from '../../lib/applicationStorage';
import { listCertificationTypes } from '../../lib/ai/standardChecklists';
import styles from '../../styles/application.module.scss';

const EMPLOYEE_OPTIONS = [
  { value: '1-10', label: '1 – 10' },
  { value: '11-50', label: '11 – 50' },
  { value: '51-200', label: '51 – 200' },
  { value: '201+', label: '201 or more' },
];

const CERT_LABEL: Record<CertificationType, string> = {
  iso9001: 'ISO 9001 (Quality)',
  iso14001: 'ISO 14001 (Environmental)',
  iso45001: 'ISO 45001 (OH&S)',
  fssc22000: 'FSSC 22000 (Food safety)',
};

function SparkleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 1.5l2.1 6.3h6.6l-5.3 3.7 2 6.5-5.4-3.4-5.3 3.4 1.9-6.4L3.2 7.8h6.5L12 1.5z"
      />
    </svg>
  );
}

export default function ApplicationStep1Page() {
  const [certificationType, setCertificationType] = useState<CertificationType>('iso9001');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const s = readStoredApplication();
    if (s.certificationType && listCertificationTypes().includes(s.certificationType as CertificationType)) {
      setCertificationType(s.certificationType as CertificationType);
    }
    if (s.industry) setIndustry(s.industry);
    if (s.employeeCount) setEmployeeCount(s.employeeCount);
    if (s.businessDescription) setBusinessDescription(s.businessDescription);
    if (s.aiGeneratedChecklist && s.aiGeneratedChecklist.length > 0) {
      setItems(s.aiGeneratedChecklist);
      setSource(s.checklistSource);
      setChecked(
        s.aiGeneratedChecklist.reduce<Record<string, boolean>>((acc, it) => {
          acc[it.id] = false;
          return acc;
        }, {})
      );
    }
  }, []);

  const canGenerate = Boolean(industry.trim() && employeeCount);

  const syncFormToStorage = useCallback(() => {
    writeStoredApplication({
      certificationType,
      industry: industry.trim(),
      employeeCount,
      businessDescription: businessDescription.trim(),
    });
  }, [certificationType, industry, employeeCount, businessDescription]);

  const runGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    syncFormToStorage();
    try {
      const res = await fetch('/api/ai/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationType,
          industry: industry.trim(),
          employeeCount,
          businessDescription: businessDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as {
        source: 'ai' | 'fallback';
        items: ChecklistItem[];
        message?: string;
      };
      setItems(data.items);
      setSource(data.source);
      if (data.message) setMessage(data.message);
      setChecked(
        data.items.reduce<Record<string, boolean>>((acc, it) => {
          acc[it.id] = false;
          return acc;
        }, {})
      );
      setChecklistOnApplication(data.items, data.source);
      syncFormToStorage();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate checklist');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  };

  return (
    <>
      <Head>
        <title>Application – Company information | ADLC</title>
      </Head>
      <main className={styles.page}>
        <h1 className={styles.title}>Step 1: Company information</h1>
        <p className={styles.subtitle}>
          Enter your business details, then generate a personalized document checklist.
        </p>
        <div className={styles.formStack}>
          <label className={styles.label} htmlFor="cert">
            Certification type
            <select
              id="cert"
              className={styles.select}
              value={certificationType}
              onChange={(e) => setCertificationType(e.target.value as CertificationType)}
            >
              {listCertificationTypes().map((c) => (
                <option key={c} value={c}>
                  {CERT_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label} htmlFor="industry">
            Industry
            <input
              id="industry"
              className={styles.input}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Food manufacturing"
              autoComplete="organization-industry"
            />
          </label>
          <label className={styles.label} htmlFor="employees">
            Number of employees
            <select
              id="employees"
              className={styles.select}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
            >
              <option value="">Select range</option>
              {EMPLOYEE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label} htmlFor="desc">
            Business description (optional)
            <textarea
              id="desc"
              className={styles.textarea}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Short description to help the AI tailor your checklist"
            />
          </label>
        </div>
        {canGenerate && !loading && !items && (
          <div className={styles.btnRow}>
            <button type="button" className={styles.btnPrimary} onClick={runGenerate}>
              <SparkleIcon />
              Generate My Checklist
            </button>
          </div>
        )}
        {loading && (
          <p className={styles.loading} role="status">
            AI is creating your personalized checklist…
          </p>
        )}
        {error && <p className={styles.fallback} role="alert">{error}</p>}
        {message && !error && <p className={styles.fallback} role="status">{message}</p>}
        {items && items.length > 0 && (
          <section>
            <h2 className={styles.checklistHeader}>Your personalized document checklist</h2>
            <ol className={styles.list} style={{ listStyle: 'decimal', paddingLeft: '1.5rem' }}>
              {items.map((it) => (
                <li key={it.id} className={styles.listItem}>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTitle}>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!checked[it.id]}
                          onChange={() => toggle(it.id)}
                        />
                        {it.title}
                      </label>
                    </div>
                    <p className={styles.itemDesc}>{it.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.btnRow}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={runGenerate}
                disabled={loading || !canGenerate}
              >
                Regenerate
              </button>
              <Link
                href="/application/step2"
                className={styles.btnPrimary}
                style={{ textDecoration: 'none' }}
                onClick={() => {
                  if (items) {
                    setChecklistOnApplication(items, source ?? 'fallback');
                    syncFormToStorage();
                  }
                }}
              >
                Save Checklist
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
