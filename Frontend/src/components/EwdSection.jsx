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

function EwdSection({ user, isPublicView = false }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [yearlyData, setYearlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null); // null means "Latest"
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
  const [activeView, setActiveView] = useState('electricity'); // 'electricity' | 'perCapita' | 'environment'

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

  // Get available years from yearlyData
  const availableYears = useMemo(() => {
    return yearlyData.map(row => row.year).sort((a, b) => b - a); // Sort descending
  }, [yearlyData]);

  // Get selected year data or latest year data
  const selectedYearData = useMemo(() => {
    if (selectedYear === null) {
      // Return latest year data
      return summary.latest ? {
        year: summary.latest.year,
        perCapitaElectricity: summary.latest.perCapitaElectricity,
        perCapitaWater: summary.latest.perCapitaWater,
        perCapitaRecycled: summary.latest.perCapitaRecycled,
        greenCoverage: summary.latest.greenCoverage
      } : null;
    }
    
    // Find selected year data from yearlyData
    const yearData = yearlyData.find(row => row.year === selectedYear);
    if (!yearData) return null;
    
    return {
      year: yearData.year,
      perCapitaElectricity: yearData.perCapitaElectricity,
      perCapitaWater: yearData.perCapitaWater,
      perCapitaRecycled: yearData.perCapitaRecycled,
      greenCoverage: yearData.greenCoverage
    };
  }, [selectedYear, yearlyData, summary.latest]);

  const yearLabel = useMemo(() => {
    if (!selectedYearData) {
      return 'Latest';
    }
    if (selectedYear === null) {
      return `Latest (FY ${selectedYearData.year})`;
    }
    return `FY ${selectedYearData.year}`;
  }, [selectedYearData, selectedYear]);

  // Scale data for Annual Electricity Consumption chart (divide by 1000 to show in thousands)
  const scaledYearlyData = useMemo(() => {
    return yearlyData.map(row => ({
      ...row,
      annualElectricityScaled: row.annualElectricity / 1000 // Scale to thousands
    }));
  }, [yearlyData]);

  return (
    <div className={isPublicView ? "" : "page-container"}>
      <div className={isPublicView ? "" : "page-content"}>
        {!isPublicView && <h1>Engineering and Works Division (EWD)</h1>}
        <p>
          Monitor institute-wide energy and water usage trends along with per capita consumption indicators and green
          coverage metrics maintained by the Engineering and Works Division.
        </p>

        {isPublicView ? null : user && user.role_id === 3 && (
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

            {selectedYearData && (
              <div className="indicator-grid">
                <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <label htmlFor="year-selector" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1a1a1a' }}>
                      Select Year:
                    </label>
                    <select
                      id="year-selector"
                      value={selectedYear || 'latest'}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedYear(value === 'latest' ? null : parseInt(value));
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        fontSize: '0.9rem',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        minWidth: '150px'
                      }}
                    >
                      <option value="latest">Latest</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>FY {year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{yearLabel}</p>
                  <p className="indicator-value">{formatDecimal(selectedYearData.perCapitaElectricity)} kWh</p>
                  <span className="indicator-subtitle">Per capita electricity</span>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{yearLabel}</p>
                  <p className="indicator-value">{formatDecimal(selectedYearData.perCapitaWater)} litres</p>
                  <span className="indicator-subtitle">Per capita water</span>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{yearLabel}</p>
                  <p className="indicator-value">{formatDecimal(selectedYearData.perCapitaRecycled)} litres</p>
                  <span className="indicator-subtitle">Per capita recycled water</span>
                </div>
                <div className="indicator-card">
                  <p className="indicator-title">{yearLabel}</p>
                  <p className="indicator-value">{formatDecimal(selectedYearData.greenCoverage)} sq.m</p>
                  <span className="indicator-subtitle">Green coverage</span>
                </div>
              </div>
            )}
            {/* View selector for different EWD charts */}
            <div className="chart-tabs" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className={`chart-tab ${activeView === 'electricity' ? 'active' : ''}`}
                onClick={() => setActiveView('electricity')}
              >
                Annual Electricity
              </button>
              <button
                type="button"
                className={`chart-tab ${activeView === 'perCapita' ? 'active' : ''}`}
                onClick={() => setActiveView('perCapita')}
              >
                Per Capita Trends
              </button>
              <button
                type="button"
                className={`chart-tab ${activeView === 'environment' ? 'active' : ''}`}
                onClick={() => setActiveView('environment')}
              >
                Environmental Summary
              </button>
            </div>

            {activeView === 'electricity' && (
              <div className="chart-section">
                <div className="chart-header">
                  <div>
                    <p className="chart-description">
                      Institution-wide electricity usage (kWh) recorded by EWD each financial year.
                    </p>
                  </div>
                </div>

                {yearlyData.length === 0 ? (
                  <div className="no-data">No EWD records available.</div>
                ) : (
                  <div className="chart-container">
                    <h3 className="chart-heading">Annual Electricity Consumption</h3>
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                      Scale: 1 unit = 1,000 kWh
                    </div>
                    <ResponsiveContainer width="100%" height={420}>
                      <BarChart data={scaledYearlyData} margin={{ top: 20, right: 30, left: 70, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#000000"
                          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                        />
                        <YAxis 
                          stroke="#000000"
                          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Electricity Consumption (in thousands of kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                          formatter={(value) => {
                            // Convert scaled value back to actual value for display
                            const actualValue = value * 1000;
                            return [formatNumber(actualValue), 'kWh'];
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} 
                          iconType="rect" 
                        />
                        <Bar dataKey="annualElectricityScaled" name="Annual electricity (in thousands of kWh)" fill={ENERGY_BAR_COLOR} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {activeView === 'perCapita' && (
              <div className="chart-section">
                <div className="chart-header">
                  <div>
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
                    <h3 className="chart-heading">Per Capita Consumption Trends</h3>
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart data={yearlyData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#000000"
                          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                        />
                        <YAxis 
                          stroke="#000000"
                          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Per Capita Consumption', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                          formatter={(value, name) => {
                            const suffix =
                              name === 'Per capita electricity' ? 'kWh' : 'litres';
                            return [formatDecimal(value), suffix];
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} 
                          iconType="plainline" 
                        />
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
            )}

            {activeView === 'environment' && (
              <div className="chart-section">
                <div className="chart-header">
                  <div>
                    <p className="chart-description">
                      Green coverage (sq.m) illustrates campus sustainability efforts over time.
                    </p>
                  </div>
                </div>

                {yearlyData.length === 0 ? (
                  <div className="no-data">No environmental records available.</div>
                ) : (
                  <div className="chart-container">
                    <h3 className="chart-heading">Environmental Summary</h3>
                    <ResponsiveContainer width="100%" height={360}>
                      <AreaChart data={yearlyData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                        <defs>
                          <linearGradient id="colorGreenCoverage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={GREEN_AREA_STROKE} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={GREEN_AREA_STROKE} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#000000"
                          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                        />
                        <YAxis 
                          stroke="#000000"
                          tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
                          label={{ value: 'Green Coverage (sq.m)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#000000', fontSize: 16, fontWeight: 'bold' } }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555' }}
                          formatter={(value) => [formatDecimal(value), 'sq.m']}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} 
                          iconType="rect" 
                        />
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
            )}
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

