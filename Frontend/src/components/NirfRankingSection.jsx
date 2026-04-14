import { useState, useEffect } from 'react';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Page.css';
import './EwdSection.css';
import axios from 'axios';
import { useUploadRefresh } from '../hooks/useUploadRefresh';
import DataUploadModal from './DataUploadModal';

const METRICS = [
    { key: 'tlr', label: 'TLR', fullName: 'Teaching, Learning & Resources',  color: '#8884d8', gradId: 'gradTlr' },
    { key: 'rpc', label: 'RPC', fullName: 'Research & Professional Practice', color: '#22c55e', gradId: 'gradRpc' },
    { key: 'go',  label: 'GO',  fullName: 'Graduation Outcomes',              color: '#f59e0b', gradId: 'gradGo'  },
    { key: 'oi',  label: 'OI',  fullName: 'Outreach & Inclusivity',           color: '#f97316', gradId: 'gradOi'  },
    { key: 'pr',  label: 'PR',  fullName: 'Perception',                       color: '#0ea5e9', gradId: 'gradPr'  },
];

// Custom tooltip for each metric chart
function MetricTooltip({ active, payload, label, metricLabel, color }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#fff', padding: '8px 12px', border: `1.5px solid ${color}`,
            borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: '13px'
        }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#333' }}>Year: {label}</p>
            <p style={{ margin: 0, color }}>{metricLabel}: <strong>{payload[0].value}</strong></p>
        </div>
    );
}

// Single metric trend card
function MetricTrendCard({ metric, data }) {
    const { key, label, fullName, color, gradId } = metric;
    const values = data.map(d => d[key]).filter(v => v != null);
    const latest = data.length ? data[data.length - 1][key] : '—';
    const first  = data.length ? data[0][key] : null;
    const diff   = values.length >= 2 ? (latest - first).toFixed(1) : null;
    const isUp   = diff > 0;

    return (
        <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px',
            padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div>
                    <span style={{
                        display: 'inline-block', background: `${color}18`,
                        color, fontWeight: 700, fontSize: '13px',
                        padding: '2px 10px', borderRadius: '20px', marginBottom: '6px'
                    }}>
                        {label}
                    </span>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888', lineHeight: 1.3 }}>{fullName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '26px', fontWeight: 800, color, lineHeight: 1 }}>{latest}</div>
                    {diff !== null && (
                        <div style={{ fontSize: '12px', marginTop: '3px', color: isUp ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                            {isUp ? '▲' : '▼'} {Math.abs(diff)} since {data[0]?.year}
                        </div>
                    )}
                </div>
            </div>

            {/* Area chart */}
            <div style={{ marginTop: '12px', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year" tick={{ fontSize: 11, fill: '#999' }}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]} tick={{ fontSize: 10, fill: '#bbb' }}
                            axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<MetricTooltip metricLabel={label} color={color} />} />
                        <Area
                            type="monotone" dataKey={key}
                            stroke={color} strokeWidth={2.5}
                            fill={`url(#${gradId})`}
                            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

const NirfRankingSection = ({ user }) => {
    const uploadVersion = useUploadRefresh();
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/nirf/nirf_metrics`);
            setData(response.data.sort((a, b) => a.year - b.year));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching NIRF data:', err);
            setError('Failed to load NIRF ranking data. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [uploadVersion]);

    const canUpload = user && [2, 3, 4].includes(user.role_id);
    const token     = localStorage.getItem('authToken');

    if (loading) {
        return (
            <div className="content-card">
                <div className="loading-spinner" style={{ margin: '2rem auto' }} />
                <p style={{ textAlign: 'center' }}>Loading NIRF ranking trends…</p>
            </div>
        );
    }

    if (error) return <div className="content-card error-message">{error}</div>;

    if (data.length === 0) {
        if (!canUpload) return null;
        return (
            <div className="content-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', color: '#1a237e' }}>NIRF Ranking Overview</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>No NIRF ranking data available.</p>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                >
                    Upload Data
                </button>
                <DataUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} tableName="nirf_ranking" token={token} onUploadSuccess={fetchData} />
            </div>
        );
    }

    const latestStats = data[data.length - 1];

    // Filter to 2022–2025
    const trendData = data.filter(d => d.year >= 2022 && d.year <= 2025);

    return (
        <div className="content-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#1a237e' }}>NIRF Ranking Overview</h2>
                {canUpload && (
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        Upload Data
                    </button>
                )}
            </div>

            {/* Latest stats summary cards */}
            <h3 style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem' }}>
                Latest Rankings (FY {latestStats.year})
            </h3>
            <div className="indicator-grid" style={{ marginTop: 0, marginBottom: '2.5rem' }}>
                {METRICS.map(({ key, label, fullName, color }) => (
                    <div key={key} className="indicator-card">
                        <p className="indicator-title">{label}</p>
                        <p className="indicator-value" style={{ color }}>{latestStats[key]}</p>
                        <span className="indicator-subtitle">{fullName}</span>
                    </div>
                ))}
            </div>

            {/* Separate trend charts per metric */}
            <h3 style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem' }}>
                Metric Trends (2022 – 2025)
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem'
            }}>
                {METRICS.map((metric) => (
                    <MetricTrendCard key={metric.key} metric={metric} data={trendData} />
                ))}
            </div>

            {/* Legend note */}
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#777', lineHeight: 1.6 }}>
                <strong>TLR:</strong> Teaching, Learning &amp; Resources &nbsp;|&nbsp;
                <strong>RPC:</strong> Research &amp; Professional Practice &nbsp;|&nbsp;
                <strong>GO:</strong> Graduation Outcomes &nbsp;|&nbsp;
                <strong>OI:</strong> Outreach &amp; Inclusivity &nbsp;|&nbsp;
                <strong>PR:</strong> Perception
            </div>

            <DataUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                tableName="nirf_ranking"
                token={token}
                onUploadSuccess={fetchData}
            />
        </div>
    );
};

export default NirfRankingSection;
