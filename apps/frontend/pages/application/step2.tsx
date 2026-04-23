import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ChecklistItem } from '../../lib/ai/types';
import { readStoredApplication } from '../../lib/applicationStorage';
import styles from '../../styles/application.module.scss';

export default function ApplicationStep2Page() {
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const s = readStoredApplication();
    if (s.aiGeneratedChecklist && s.aiGeneratedChecklist.length > 0) {
      setItems(s.aiGeneratedChecklist);
      setSource(s.checklistSource);
      setChecked(
        s.aiGeneratedChecklist.reduce<Record<string, boolean>>((acc, it) => {
          acc[it.id] = acc[it.id] ?? false;
          return acc;
        }, {})
      );
    } else {
      setItems(null);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Application – Document upload | ADLC</title>
      </Head>
      <main className={styles.page}>
        <Link href="/application/step1" className={styles.backLink}>
          ← Back to company information
        </Link>
        <h1 className={styles.title}>Step 2: Document upload</h1>
        <p className={styles.subtitle}>
          Use your personalized checklist below. Upload the corresponding files for each line item
          (upload UI can be connected here in a follow-up).
        </p>
        {items && items.length > 0 ? (
          <section>
            <h2 className={styles.checklistHeader}>
              Your document checklist
              {source && (
                <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.85em' }}>
                  {source === 'ai' ? ' (AI-generated)' : ' (standard list)'}
                </span>
              )}
            </h2>
            <ol className={styles.list} style={{ listStyle: 'decimal', paddingLeft: '1.5rem' }}>
              {items.map((it) => (
                <li key={it.id} className={styles.listItem}>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTitle}>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!checked[it.id]}
                          onChange={() =>
                            setChecked((c) => ({ ...c, [it.id]: !c[it.id] }))
                          }
                        />
                        {it.title}
                      </label>
                    </div>
                    <p className={styles.itemDesc}>{it.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <p className={styles.emptyState}>
            No saved checklist found. Return to step 1 to generate a checklist and select &quot;Save
            Checklist&quot; when you are ready to continue.
          </p>
        )}
      </main>
    </>
  );
}
