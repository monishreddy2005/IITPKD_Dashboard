import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import { fetchEwdSummary, fetchEwdYearly } from '../services/ewdStats';
import DataUploadModal from './DataUploadModal';
import './Page.css';
import './AcademicSection.css';
import './GrievanceSection.css';
import './EwdSection.css';

const ENERGY_BAR_COLOR = '#667eea';
const ELECTRICITY_LINE_COLOR = '#f59e0b';
const WATER_LINE_COLOR = '#43e97b';
const RECYCLED_LINE_COLOR = '#fa709a';
const GREEN_AREA_STROKE = '#34d399';
const GREEN_AREA_FILL = 'rgba(52, 211, 153, 0.35)';

const numberFormatter = new Intl.NumberFormat('en-IN');
const decimalFormatter = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatNumber = (value) => numberFormatter.format(Math.round(value || 0));
const formatDecimal = (value) => decimalFormatter.format(value || 0);

function EwdSection({ user }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [yearlyData, setYearlyData] = useState([]);
  const [summary, setSummary] = useState({
    totalAnnualElectricity: 0,
    averagePerCapitaElectricity: 0,
    averagePerCapitaWater: 0,
    averagePerCapitaRecycledWater: 0,
    averageGreenCoverage: 0,
    latest: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [yearlyResponse, summaryResponse] = await Promise.all([
          fetchEwdYearly(token),
          fetchEwdSummary(token)
        ]);

        const yearlyRows = yearlyResponse?.data || [];
        const formattedYearly = yearlyRows.map((row) => ({
          year: row.ewd_year,
          annualElectricity: Number(row.annual_electricity_consumption || 0),
          perCapitaElectricity: Number(row.per_capita_electricity_consumption || 0),
          perCapitaWater: Number(row.per_capita_water_consumption || 0),
          perCapitaRecycled: Number(row.per_capita_recycled_water || 0),
          greenCoverage: Number(row.green_coverage || 0)
        }));
        setYearlyData(formattedYearly);

        const summaryData = summaryResponse?.data || {};
        const latest = summaryData.latest
          ? {
            year: summaryData.latest.ewd_year,
            perCapitaElectricity: Number(summaryData.latest.per_capita_electricity_consumption || 0),
            perCapitaWater: Number(summaryData.latest.per_capita_water_consumption || 0),
            perCapitaRecycled: Number(summaryData.latest.per_capita_recycled_water || 0),
            greenCoverage: Number(summaryData.latest.green_coverage || 0)
          }
          : null;

        setSummary({
          totalAnnualElectricity: Number(summaryData.total_annual_electricity || 0),
          averagePerCapitaElectricity: Number(summaryData.average_per_capita_electricity || 0),
          averagePerCapitaWater: Number(summaryData.average_per_capita_water || 0),
          averagePerCapitaRecycledWater: Number(summaryData.average_per_capita_recycled_water || 0),
          averageGreenCoverage: Number(summaryData.average_green_coverage || 0),
          latest
        });
      } catch (err) {
        console.error('Failed to load EWD data:', err);
        setError(err.message || 'Failed to load EWD data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const latestYearLabel = useMemo(() => {
    if (!summary.latest) {
      return 'Latest';
    }
    return `Latest (FY ${summary.latest.year})`;
  }, [summary.latest]);

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Engineering and Works Division (EWD)</h1>
        <p>
          Monitor institute-wide energy and water usage trends along with per capita consumption indicators and green
          coverage metrics maintained by the Engineering and Works Division.
        </p>

        {user && user.role_id === 3 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className="upload-data-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Upload Data
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading EWD data...</p>
          </div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Annual Electricity</h3>
                <p className="summary-value">{formatNumber(summary.totalAnnualElectricity)}</p>
                <span className="summary-subtitle">Cumulative electricity consumption across recorded years (kWh)</span>
              </div>
              <div className="summary-card">
                <h3>Avg. Per Capita Electricity</h3>
                <p className="summary-value accent-warning">{formatDecimal(summary.averagePerCapitaElectricity)}</p>
                <span className="summary-subtitle">Average per capita electricity consumption (kWh)</span>
              </div>
              <div className="summary-card">
                <h3>Avg. Per Capita Water</h3>
                <p className="summary-value accent-success">{formatDecimal(summary.averagePerCapitaWater)}</p>
                <span className="summary-subtitle">Average per capita water consumption (litres)</span>
              </div>
              <div className="summary-card">
                <h3>Avg. Green Coverage</h3>
                <p className="summary-value">{formatDecimal(summary.averageGreenCoverage)}</p>
                <span className="summary-subtitle">Average green coverage area (sq.m)</span>
              </div>
            </div>

            {summary.latest && (
              <div className="indicator-grid">
                <div className="indicator-card">
                  <p className="indicator-title">{latestYearLabel}</p>
                  <p className="indicator-value">{formatDecimal(summary.latest.perCapitaElectricity)} kWh</p>
                  <span className="indicator-subtitle">Per capita electricity</span>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{latestYearLabel}</p>
                  <p className="indicator-value">{formatDecimal(summary.latest.perCapitaWater)} litres</p>
                  <span className="indicator-subtitle">Per capita water</span>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{latestYearLabel}</p>
                  <p className="indicator-value">{formatDecimal(summary.latest.perCapitaRecycled)} litres</p>
                  <span className="indicator-subtitle">Per capita recycled water</span>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{latestYearLabel}</p>
                  <p className="indicator-value">{formatDecimal(summary.latest.greenCoverage)} sq.m</p>
                  <span className="indicator-subtitle">Green coverage</span>
                </div>
              </div>
            )}

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Annual Electricity Consumption</h2>
                  <p className="chart-description">
                    Institution-wide electricity usage (kWh) recorded by EWD each financial year.
                  </p>
                </div>
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No EWD records available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                        formatter={(value) => [formatNumber(value), 'kWh']}
                      />
                      <Legend />
                      <Bar dataKey="annualElectricity" name="Annual electricity (kWh)" fill={ENERGY_BAR_COLOR} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Per Capita Consumption Trends</h2>
                  <p className="chart-description">
                    Electricity and water consumption metrics normalised per capita for better comparability across
                    years.
                  </p>
                </div>
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No per capita consumption records available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={420}>
                    <LineChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                        formatter={(value, name) => {
                          const suffix =
                            name === 'Per capita electricity' ? 'kWh' : 'litres';
                          return [formatDecimal(value), suffix];
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="perCapitaElectricity"
                        name="Per capita electricity"
                        stroke={ELECTRICITY_LINE_COLOR}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="perCapitaWater"
                        name="Per capita water"
                        stroke={WATER_LINE_COLOR}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="perCapitaRecycled"
                        name="Per capita recycled water"
                        stroke={RECYCLED_LINE_COLOR}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <h2>Environmental Summary</h2>
                  <p className="chart-description">
                    Green coverage (sq.m) illustrates campus sustainability efforts over time.
                  </p>
                </div>
              </div>

              {yearlyData.length === 0 ? (
                <div className="no-data">No environmental records available.</div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={yearlyData}>
                      <defs>
                        <linearGradient id="colorGreenCoverage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GREEN_AREA_STROKE} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={GREEN_AREA_STROKE} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                        formatter={(value) => [formatDecimal(value), 'sq.m']}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="greenCoverage"
                        name="Green coverage (sq.m)"
                        stroke={GREEN_AREA_STROKE}
                        fill={GREEN_AREA_FILL}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        tableName="ewd_yearwise"
        token={token}
      />
    </div>
  );
}

export default EwdSection;

