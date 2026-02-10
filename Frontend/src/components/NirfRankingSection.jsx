import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Page.css';
import './EwdSection.css'; // Use EWD styles for cards
import axios from 'axios';

const NirfRankingSection = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/nirf/nirf_metrics');
                // Ensure data is sorted by year
                const sortedData = response.data.sort((a, b) => a.year - b.year);
                setData(sortedData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching NIRF data:", err);
                setError("Failed to load NIRF ranking data. Please try again later.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="content-card">
                <div className="loading-spinner" style={{ margin: '2rem auto' }} />
                <p style={{ textAlign: 'center' }}>Loading NIRF ranking trends...</p>
            </div>
        );
    }

    if (error) {
        return <div className="content-card error-message">{error}</div>;
    }

    if (data.length === 0) {
        return null;
    }

    const latestStats = data[data.length - 1];

    return (
        <div className="content-card">
            <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>NIRF Ranking Overview</h2>

            {/* Latest Stats Cards */}
            <h3 style={{ fontSize: '1.2rem', color: '#444', marginBottom: '1rem' }}>Latest Rankings (FY {latestStats.year})</h3>
            <div className="indicator-grid" style={{ marginTop: '0', marginBottom: '3rem' }}>
                <div className="indicator-card">
                    <p className="indicator-title">TLR</p>
                    <p className="indicator-value" style={{ color: '#8884d8' }}>{latestStats.tlr}</p>
                    <span className="indicator-subtitle">Teaching, Learning & Resources</span>
                </div>
                <div className="indicator-card">
                    <p className="indicator-title">RPC</p>
                    <p className="indicator-value" style={{ color: '#82ca9d' }}>{latestStats.rpc}</p>
                    <span className="indicator-subtitle">Research & Professional Practice</span>
                </div>
                <div className="indicator-card">
                    <p className="indicator-title">GO</p>
                    <p className="indicator-value" style={{ color: '#ffc658' }}>{latestStats.go}</p>
                    <span className="indicator-subtitle">Graduation Outcomes</span>
                </div>
                <div className="indicator-card">
                    <p className="indicator-title">OI</p>
                    <p className="indicator-value" style={{ color: '#ff8042' }}>{latestStats.oi}</p>
                    <span className="indicator-subtitle">Outreach & Inclusivity</span>
                </div>
                <div className="indicator-card">
                    <p className="indicator-title">PR</p>
                    <p className="indicator-value" style={{ color: '#0088fe' }}>{latestStats.pr}</p>
                    <span className="indicator-subtitle">Perception</span>
                </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#444', marginBottom: '1rem' }}>Ranking Trends (2022-2025)</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="tlr" name="TLR" fill="#8884d8" />
                        <Bar dataKey="rpc" name="RPC" fill="#82ca9d" />
                        <Bar dataKey="go" name="GO" fill="#ffc658" />
                        <Bar dataKey="oi" name="OI" fill="#ff8042" />
                        <Bar dataKey="pr" name="PR" fill="#0088fe" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                <p><strong>TLR:</strong> Teaching, Learning & Resources | <strong>RPC:</strong> Research and Professional Practice</p>
                <p><strong>GO:</strong> Graduation Outcomes | <strong>OI:</strong> Outreach and Inclusivity | <strong>PR:</strong> Perception</p>
            </div>
        </div>
    );
};

export default NirfRankingSection;
