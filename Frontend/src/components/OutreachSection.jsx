import { useState, useEffect } from 'react';
import { fetchOutreachList } from '../services/outreachExtensionStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './OutreachMinimal.css';

// ─── Field definitions ───────────────────────────────────────────────────────

const COMMON_FIELDS = [
  { key: 'id',                label: 'ID' },
  { key: 'academic_year',     label: 'Academic Year' },
  { key: 'program_name',      label: 'Program Name' },
  { key: 'program_type',      label: 'Program Type' },
  { key: 'engagement_type',   label: 'Engagement Type' },
  { key: 'association',       label: 'Association' },
  { key: 'start_date',        label: 'Start Date' },
  { key: 'end_date',          label: 'End Date' },
  { key: 'targeted_audience', label: 'Targeted Audience' },
  { key: 'num_attendees',     label: 'No. of Attendees' },
  { key: 'num_schools',       label: 'No. of Schools' },
  { key: 'num_colleges',      label: 'No. of Colleges' },
  { key: 'geographic_reach',  label: 'Geographic Reach' },
  { key: 'remarks',           label: 'Remarks' },
  { key: 'created_by',        label: 'Created By' },
  { key: 'created_at',        label: 'Created At' },
];

const NSS_FIELDS = [
  { key: 'nss_activity_type',     label: 'NSS Activity Type' },
  { key: 'nss_volunteer_count',   label: 'NSS Volunteer Count' },
  { key: 'nss_community_reached', label: 'NSS Community Reached' },
];

const PROGRAM_CONFIGS = [
  {
    key: 'science_quest',
    title: 'Science Quest',
    icon: '🔬',
    description: 'Science outreach and laboratory programmes for school students',
    match: (name) => name?.toLowerCase().includes('science quest'),
    specificFields: [
      { key: 'sq_stipend_provided',    label: 'Stipend Provided' },
      { key: 'sq_travel_allowance',    label: 'Travel Allowance' },
      { key: 'sq_num_lab_sessions',    label: 'No. of Lab Sessions' },
      { key: 'sq_districts_covered',   label: 'Districts Covered' },
    ],
  },
  {
    key: 'palakkad_math_circle',
    title: 'Palakkad Math Circle',
    icon: '📐',
    description: 'Mathematics enrichment sessions for school students',
    match: (name) =>
      name?.toLowerCase().includes('math circle') ||
      name?.toLowerCase().includes('palakkad math'),
    specificFields: [
      { key: 'pmc_target_class',      label: 'Target Class' },
      { key: 'pmc_mathematician_led', label: 'Mathematician Led' },
      { key: 'pmc_num_sessions',      label: 'No. of Sessions' },
    ],
  },
  {
    key: 'pale_blue_dot',
    title: 'Pale Blue Dot',
    icon: '🌍',
    description: 'Astronomy and space science public lecture series',
    match: (name) => name?.toLowerCase().includes('pale blue dot'),
    specificFields: [
      { key: 'pbd_lecture_topic',        label: 'Lecture Topic' },
      { key: 'pbd_speaker_name',         label: 'Speaker Name' },
      { key: 'pbd_speaker_affiliation',  label: 'Speaker Affiliation' },
    ],
  },
  {
    key: 'institute_visits',
    title: 'Institute Visits',
    icon: '🏛️',
    description: 'Organised visits by institutions to the IIT Palakkad campus',
    match: (name) => name?.toLowerCase().includes('institute visit'),
    specificFields: [
      { key: 'iv_visiting_institution',      label: 'Visiting Institution' },
      { key: 'iv_visiting_institution_type', label: 'Institution Type' },
      { key: 'iv_num_groups',                label: 'No. of Groups' },
    ],
  },
  {
    key: 'nss_activities',
    title: 'NSS Activities',
    icon: '🤝',
    description: 'National Service Scheme community service initiatives',
    match: (name) => name?.toLowerCase().includes('nss'),
    specificFields: NSS_FIELDS,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isNonNull(value) {
  return value !== null && value !== undefined && value !== '' && value !== 'null';
}

function formatValue(value) {
  if (!isNonNull(value)) return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  // Detect ISO date strings
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d))
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return String(value);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldRow({ label, value }) {
  const formatted = formatValue(value);
  if (!isNonNull(formatted)) return null;
  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '0.45rem 0',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
      alignItems: 'flex-start',
    }}>
      <span style={{
        minWidth: '180px',
        fontSize: '0.78rem',
        color: '#6e6e73',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        paddingTop: '1px',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ fontSize: '0.9rem', color: '#1d1d1f', lineHeight: '1.5' }}>
        {formatted}
      </span>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div style={{
      fontSize: '0.72rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      color: '#f7a600',
      marginBottom: '0.6rem',
      marginTop: '1.4rem',
    }}>
      {children}
    </div>
  );
}

function ExtraDataSection({ data }) {
  if (!data || typeof data !== 'object') return null;
  const entries = Object.entries(data).filter(([, v]) => isNonNull(v));
  if (entries.length === 0) return null;
  return (
    <>
      <SectionHeading>Additional Data</SectionHeading>
      {entries.map(([key, val]) => (
        <FieldRow key={key} label={key.replace(/_/g, ' ')} value={val} />
      ))}
    </>
  );
}

function RecordCard({ record, slNo, programConfig }) {
  const [expanded, setExpanded] = useState(false);

  const hasSpecificData = programConfig.specificFields.some(({ key }) => isNonNull(record[key]));
  const hasNssData =
    programConfig.key !== 'nss_activities' &&
    NSS_FIELDS.some(({ key }) => isNonNull(record[key]));

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: '14px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      marginBottom: '0.875rem',
      overflow: 'hidden',
    }}>
      {/* Row header */}
      <div
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.1rem 1.4rem',
          cursor: 'pointer',
          background: expanded ? 'rgba(247,166,0,0.03)' : '#fff',
          borderBottom: expanded ? '1px solid rgba(247,166,0,0.1)' : 'none',
          transition: 'background 0.2s',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'rgba(247,166,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: '700', color: '#f7a600',
          flexShrink: 0,
        }}>
          {slNo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.1rem' }}>
            {record.program_name || 'Outreach Record'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
            {[record.academic_year, record.engagement_type, record.program_type]
              .filter(Boolean).join(' · ')}
          </div>
        </div>
        <span style={{
          fontSize: '1.3rem', color: '#f7a600',
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s',
          flexShrink: 0,
        }}>›</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          <SectionHeading>General Information</SectionHeading>
          {COMMON_FIELDS.map(({ key, label }) => (
            <FieldRow key={key} label={label} value={record[key]} />
          ))}

          {hasSpecificData && (
            <>
              <SectionHeading>{programConfig.title} Details</SectionHeading>
              {programConfig.specificFields.map(({ key, label }) => (
                <FieldRow key={key} label={label} value={record[key]} />
              ))}
            </>
          )}

          {hasNssData && (
            <>
              <SectionHeading>NSS Activities</SectionHeading>
              {NSS_FIELDS.map(({ key, label }) => (
                <FieldRow key={key} label={label} value={record[key]} />
              ))}
            </>
          )}

          <ExtraDataSection data={record.extra_data} />
        </div>
      )}
    </div>
  );
}

function ProgramDetailView({ programConfig, records, onBack }) {
  const matching = records.filter((r) => programConfig.match(r.program_name));

  return (
    <div className="outreach-expanded-view">
      <div className="outreach-expanded-container">
        {/* Top bar */}
        <div className="outreach-top-bar">
          <button className="outreach-back-button" onClick={onBack}>
            <span className="outreach-back-arrow">←</span>
            Back
          </button>
          <div className="outreach-icon-header">{programConfig.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="outreach-overview-text">{programConfig.title}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6e6e73', marginTop: '0.1rem' }}>
              {programConfig.description}
            </p>
          </div>
          <span style={{
            background: 'rgba(247,166,0,0.1)',
            color: '#f7a600',
            padding: '0.35rem 0.9rem',
            borderRadius: '100px',
            fontSize: '0.78rem',
            fontWeight: '600',
            flexShrink: 0,
          }}>
            {matching.length} {matching.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {/* Records */}
        <div style={{ padding: '1.5rem' }}>
          {matching.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6e6e73' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
              <p style={{ margin: 0 }}>No records found for <strong>{programConfig.title}</strong>.</p>
              <p style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                Upload data using the Upload Data button on the overview page.
              </p>
            </div>
          ) : (
            matching.map((record, idx) => (
              <RecordCard
                key={record.id ?? idx}
                record={record}
                slNo={idx + 1}
                programConfig={programConfig}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function OutreachSection({ user }) {
  const token = localStorage.getItem('authToken');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchOutreachList(token)
      .then((data) => setRecords(data?.records ?? []))
      .catch((err) => setError(err.message || 'Failed to load outreach data'))
      .finally(() => setLoading(false));
  }, [token]);

  const getCount = (config) => records.filter((r) => config.match(r.program_name)).length;

  if (selectedProgram) {
    return (
      <div className="page-container">
        <div className="page-content">
          <ProgramDetailView
            programConfig={selectedProgram}
            records={records}
            onBack={() => setSelectedProgram(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="outreach-page-header">
          <h1>Outreach Programs</h1>
          <p>
            Community engagement initiatives connecting IIT Palakkad with schools, colleges, and society.
            Select a programme to explore its records.
          </p>
        </div>

        {user?.role_id >= 2 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Data
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6e6e73' }}>
            Loading outreach data…
          </div>
        )}

        {error && (
          <div style={{
            padding: '1.25rem 1.5rem',
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '12px',
            color: '#c53030',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="outreach-sections-grid">
            {PROGRAM_CONFIGS.map((config) => {
              const count = getCount(config);
              return (
                <div
                  key={config.key}
                  className="outreach-section-card"
                  onClick={() => setSelectedProgram(config)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedProgram(config)}
                >
                  <div className="outreach-card-icon">{config.icon}</div>
                  <h3 className="outreach-card-title">{config.title}</h3>
                  <p className="outreach-card-subtitle">{config.description}</p>
                  {count > 0 && (
                    <div style={{
                      marginTop: '0.875rem',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      color: '#f7a600',
                    }}>
                      {count} {count === 1 ? 'record' : 'records'}
                    </div>
                  )}
                  <div className="outreach-card-arrow">→</div>
                </div>
              );
            })}
          </div>
        )}

        <DataUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tableName="outreach"
          token={token}
        />
      </div>
    </div>
  );
}

export default OutreachSection;
