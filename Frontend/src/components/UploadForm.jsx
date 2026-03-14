    import { useState } from 'react';
import axios from 'axios';

// This list should match the 'UPDATABLE_TABLES' dict in the backend
const tableOptions = [
  'student',
  'course',
  'department',
  'alumni',
  'alumini',  // Alternative spelling
  'designation',
  'employee',
  'employment_history',
  'additional_roles',
  'externship_info',
  'igrs_yearwise',
  'icc_yearwise',
  'ewd_yearwise',
  'faculty_engagement',
  'placement_summary',
  'placement_companies',
  'placement_packages',
  'industry_courses',
  'academic_program_launch',
  'research_projects',
  'research_mous',
  'research_patents',
  'research_publications',
  'startups',
  'innovation_projects',
  'industry_events',
  'industry_conclave',
  'open_house',
  'nptel_local_chapters',
  'nptel_courses',
  'nptel_enrollments',
  'uba_projects',
  'uba_events'
];

/**
 * A form for administrators to upload CSV files and bulk-update database tables.
 * @param {Object} props
 * @param {string} props.token - The user's auth token.
 * @param {Function} props.onLogout - Callback to log the user out.
 */
function UploadForm({ token, onLogout }) {
  const [selectedTable, setSelectedTable] = useState(tableOptions[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewData, setPreviewData] = useState(null);

  /**
   * Parses the first 5 lines of a CSV text buffer into a preview table.
   * @param {string} csvText - The raw CSV string.
   */
  const parseCSVPreview = (csvText) => {
    try {
      const lines = csvText.trim().split('\n');
      const header = lines[0].split(',');
      
      // Get rows (next 5 lines, or fewer if the file is short)
      const rows = lines.slice(1, 6)
        .filter(line => line) // Filter out empty lines
        .map(line => line.split(','));

      setPreviewData({ header, rows });
    } catch (e) {
      console.error("Failed to parse CSV preview:", e);
      setMessage('Error: Could not parse CSV for preview.');
      setPreviewData(null);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage('');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => parseCSVPreview(e.target.result);
      reader.readAsText(file);
    } else {
      setPreviewData(null);
    }
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage('Please select a CSV file to upload.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('table_name', selectedTable);
    formData.append('csv_file', selectedFile);

    // Validate token before making request
    if (!token) {
      setMessage('Error: No authentication token found. Please log in again.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/upload-csv',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }
      );

      setMessage(`Success: ${response.data.message}`);
      setSelectedFile(null);
      setPreviewData(null); // Clear preview
      event.target.reset(); // Reset the form
      
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      if (error.response) {
        // Use the specific error message from the backend
        errorMessage = error.response.data.message;
        
        // Handle token errors specifically
        if (error.response.status === 401) {
           errorMessage += " Your session may have expired. Please log out and log back in.";
        }
        
        // (rest of the error handling logic is the same)
        if (error.response.data.details) {
          // ... (same as before)
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Update Database from CSV</h2>
        <button onClick={onLogout} style={{ height: 'fit-content' }}>
          Logout
        </button>
      </div>
      <p>Select a table, upload a CSV file, and preview it before updating.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* --- Form Inputs (same as before) --- */}
        <div>
          <label htmlFor="table-select" style={{ marginRight: '1rem' }}>
            Table to Update:
          </label>
          <select 
            id="table-select"
            value={selectedTable}
            onChange={handleTableChange}
            disabled={isLoading}
            style={{ padding: '0.5em', fontSize: '1em' }}
          >
            {tableOptions.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file-input" style={{ marginRight: '1rem' }}>
            Upload CSV File:
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
        
        {/* --- NEW: CSV Preview Table --- */}
        {previewData && (
          <div className="csv-preview">
            <h4>CSV Preview (First 5 Rows)</h4>
            <table style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  {previewData.header.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload and Update'}
        </button>
      </form>
      
      {/* Display messages (success or error) */}
      {message && (
        <p 
          style={{ 
            color: message.startsWith('Error') ? 'red' : 'green', 
            marginTop: '1rem',
            whiteSpace: 'pre-wrap'
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default UploadForm;