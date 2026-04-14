import { useEffect, useState, useCallback } from 'react';
import { fetchCourseCounts, fetchCourses } from '../services/academicModuleStats';
import { useUploadRefresh } from '../hooks/useUploadRefresh';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';

// ─── Scrollable repository ────────────────────────────────────────────────────
function CourseRepo({ title, courseType, token, uploadVersion }) {
  const [activeRows,   setActiveRows]   = useState([]);
  const [inactiveRows, setInactiveRows] = useState([]);
  const [tab, setTab]                   = useState('active');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(false);

  const isIndustry = courseType === 'industry';

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (isIndustry) {
        const result = await fetchCourses({ course_type: 'industry' }, '', 1, 500, token);
        setActiveRows(result?.data || []);
      } else {
        const [resA, resI] = await Promise.all([
          fetchCourses({ course_type: 'all', active_only: 'true'  }, '', 1, 500, token),
          fetchCourses({ course_type: 'all', active_only: 'false' }, '', 1, 500, token),
        ]);
        setActiveRows(resA?.data  || []);
        setInactiveRows(resI?.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, courseType, uploadVersion]);

  useEffect(() => { load(); }, [load]);

  const baseRows = isIndustry ? activeRows : (tab === 'active' ? activeRows : inactiveRows);
  const rows = search.trim()
    ? baseRows.filter(r =>
        [r.course_code, r.course_name, r.proposing_faculty_name, r.industry_partner]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : baseRows;

  const showActiveStatus = isIndustry;   // industry table derives status from row.status
  const staticActive     = !isIndustry && tab === 'active';

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px',
      overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem'
    }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>
          {title}
        </h3>

        {/* Active / Inactive tabs — courses repo only */}
        {!isIndustry && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'active',   label: `Active (${activeRows.length})`,   activeColor: '#22c55e', activeBg: 'rgba(34,197,94,0.1)'   },
              { key: 'inactive', label: `Inactive (${inactiveRows.length})`, activeColor: '#f97316', activeBg: 'rgba(249,115,22,0.1)' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '4px 14px', fontSize: '12px',
                  fontWeight: tab === t.key ? 700 : 400,
                  border: `1.5px solid ${tab === t.key ? t.activeColor : '#ddd'}`,
                  borderRadius: '20px', cursor: 'pointer',
                  background: tab === t.key ? t.activeBg : '#fff',
                  color: tab === t.key ? t.activeColor : '#666',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {isIndustry && (
          <span style={{ fontSize: '12px', color: '#888' }}>{activeRows.length} courses</span>
        )}

        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '5px 12px', fontSize: '13px',
            border: '1px solid #ddd', borderRadius: '8px',
            background: '#fafafa', color: '#1a1a1a', minWidth: '200px',
          }}
        />
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 2 }}>
              <Th>Code</Th>
              <Th>Course Name</Th>
              <Th>Credits</Th>
              <Th>Category</Th>
              {isIndustry && <><Th>Industry Partner</Th><Th>Coordinator</Th></>}
              <Th>Programme</Th>
              {!isIndustry && <Th>Faculty</Th>}
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isIndustry ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={isIndustry ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>No courses found.</td></tr>
            ) : rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                <Td mono>{row.course_code || '—'}</Td>
                <Td bold>{row.course_name || '—'}</Td>
                <Td>{row.credit_l_t_p_c || '—'}</Td>
                <Td>{row.course_category || '—'}</Td>
                {isIndustry && <><Td>{row.industry_partner || '—'}</Td><Td>{row.industry_coordinator_name || '—'}</Td></>}
                <Td>{row.target_programme || '—'}</Td>
                {!isIndustry && <Td>{row.proposing_faculty_name || '—'}</Td>}
                <Td>
                  <StatusBadge active={showActiveStatus ? row.status === 'Active' : staticActive} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', whiteSpace: 'nowrap', borderBottom: '2px solid #e5e7eb' }}>
      {children}
    </th>
  );
}

function Td({ children, bold, mono }) {
  return (
    <td style={{ padding: '9px 14px', color: '#333', verticalAlign: 'top', fontWeight: bold ? 500 : 400, fontFamily: mono ? 'monospace' : 'inherit' }}>
      {children}
    </td>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 600,
      color: active ? '#16a34a' : '#ea580c',
      background: active ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
    }}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function EducationAcademicSection({ user, isPublicView = false }) {
  const uploadVersion = useUploadRefresh();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [counts, setCounts] = useState({ active_courses: 0, active_industry_courses: 0, inactive_industry_courses: 0 });
  const [repoView, setRepoView] = useState('courses'); // 'courses' | 'industry'

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) return;
    fetchCourseCounts(token).then(d => { if (d) setCounts(d); }).catch(() => {});
  }, [token, uploadVersion]);

  const totalIndustry = (counts.active_industry_courses || 0) + (counts.inactive_industry_courses || 0);

  const REPO_OPTIONS = [
    { key: 'courses',  label: 'Courses Repository',      color: '#22c55e' },
    { key: 'industry', label: 'Industry Linked Courses',  color: '#6366f1' },
  ];

  return (
    <div className="page-container">
      <div className="page-content">

        {!isPublicView && user?.role_id >= 2 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button className="upload-data-btn" onClick={() => setIsUploadModalOpen(true)}>
              Upload Data
            </button>
          </div>
        )}

        {/* ── 2 Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <SummaryCard title="Active Courses"   value={counts.active_courses} accent="#22c55e" />
          <SummaryCard title="Industry Courses" value={totalIndustry}          accent="#6366f1" />
        </div>

        {/* ── Radio buttons ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {REPO_OPTIONS.map(({ key, label, color }) => (
            <label
              key={key}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                cursor: 'pointer', padding: '0.45rem 1.1rem', borderRadius: '20px',
                border: `1.5px solid ${repoView === key ? color : '#ddd'}`,
                background: repoView === key ? `${color}12` : '#fff',
                fontSize: '0.88rem', fontWeight: repoView === key ? 700 : 400,
                color: repoView === key ? color : '#555',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio" name="repoView" value={key}
                checked={repoView === key}
                onChange={() => setRepoView(key)}
                style={{ display: 'none' }}
              />
              {label}
            </label>
          ))}
        </div>

        {/* ── Active repo ── */}
        {repoView === 'courses' && (
          <CourseRepo
            key="courses"
            title="Courses Repository"
            courseType="all"
            token={token}
            uploadVersion={uploadVersion}
          />
        )}
        {repoView === 'industry' && (
          <CourseRepo
            key="industry"
            title="Industry Linked Courses"
            courseType="industry"
            token={token}
            uploadVersion={uploadVersion}
          />
        )}

      </div>

      {isUploadModalOpen && (
        <DataUploadModal
          tableName="courses_table"
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value, accent }) {
  return (
    <div className="summary-card" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
      <h3 style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      <p className="summary-value" style={{ color: accent, fontSize: '2.4rem', fontWeight: 800, margin: 0 }}>
        {(value || 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default EducationAcademicSection;
