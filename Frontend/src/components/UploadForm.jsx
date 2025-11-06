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
  'externship_info'
];

/**
 * This component receives the auth `token` and a `onLogout` function as props.
 */
function UploadForm({ token, onLogout }) {
  const [selectedTable, setSelectedTable] = useState(tableOptions[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // New state for the CSV preview data
  const [previewData, setPreviewData] = useState(null); // { header: [], rows: [] }

  /**
   * Parses the first few lines of a CSV text for preview.
   * @param {string} csvText - The raw text content of the CSV file.
   */
  const parseCSVPreview = (csvText) => {
    try {
      const lines = csvText.trim().split('\n');
      
      // Get header (first line)
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

  /**
   * Handles the file input change event.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage(''); // Clear previous messages
    
    if (file) {
      // --- New CSV Preview Logic ---
      const reader = new FileReader();
      
      // This event fires when the file is read
      reader.onload = (e) => {
        const text = e.target.result;
        parseCSVPreview(text);
      };
      
      // Read the file as plain text
      reader.readAsText(file);
    } else {
      setPreviewData(null); // Clear preview if no file is selected
    }
  };

  /**
   * Handles the table selection change event.
   */
  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
    setMessage('');
  };

  /**
   * Handles the form submission.
   */
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

    console.log("--- DEBUG: Sending token ---", token ? `${token.substring(0, 20)}...` : 'NULL')
    
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
            // DO NOT manually set Content-Type for FormData - axios will set it automatically with the correct boundary
            // If you set it manually, axios cannot add the boundary parameter which is required for multipart/form-data
            'Authorization': `Bearer ${token}`
          },
        }
      );

      // Success
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
      {/* Header with Logout Button */}
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