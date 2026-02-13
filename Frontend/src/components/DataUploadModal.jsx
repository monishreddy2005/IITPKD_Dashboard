import { useState } from 'react';
import axios from 'axios';
import './DataUploadModal.css';

/**
 * Reusable Modal for uploading CSV data to a specific table.
 * 
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {function} onClose - Function to close the modal.
 * @param {string} tableName - The backend table name to update (e.g., 'student').
 * @param {string} token - Auth token.
 */
function DataUploadModal({ isOpen, onClose, tableName, token }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    if (!isOpen) return null;

    // Reset state when closing (optional, but good UX if checking `isOpen` change)
    // For simplicity, we assume parent unmounts or we reset on close if needed.

    const parseCSVPreview = (csvText) => {
        try {
            const lines = csvText.trim().split('\n');
            if (lines.length === 0) return;

            const header = lines[0].split(',');
            const rows = lines.slice(1, 6)
                .filter(line => line)
                .map(line => line.split(','));

            setPreviewData({ header, rows });
        } catch (e) {
            console.error("Failed to parse CSV preview:", e);
            setPreviewData(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setMessage(null);

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                parseCSVPreview(event.target.result);
            };
            reader.readAsText(file);
        } else {
            setPreviewData(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !token) return;

        setIsLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('table_name', tableName);
        formData.append('csv_file', selectedFile);

        try {
            const response = await axios.post(
                'http://127.0.0.1:5000/api/upload-csv',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setMessage({ type: 'success', text: response.data.message || 'Upload successful!' });
            // Optional: Close after delay or let user close
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred during upload.';
            const errorDetails = error.response?.data?.details;

            // Format the final message to include details if available
            const finalMessage = errorDetails
                ? `${errorMsg} (${errorDetails})`
                : errorMsg;

            setMessage({ type: 'error', text: finalMessage });
        } finally {
            setIsLoading(false);
        }
    };

    // Template Data for various tables
    const getTemplateData = (table) => {
        switch (table) {
            case 'student':
                return {
                    headers: ['rollno', 'name', 'program', 'yearofadmission', 'batch', 'branch', 'department', 'pwd', 'state', 'category', 'gender', 'status'],
                    sample: ['123456', 'John Doe', 'BTech', '2023', 'Jan', 'CSE', 'Computer Science', 'FALSE', 'Kerala', 'Gen', 'Male', 'Ongoing']
                };
            case 'employee':
                return {
                    headers: ['empname', 'email', 'phonenumber', 'bloodgroup', 'dateofbirth', 'gender', 'department', 'currentdesignationid', 'isactive', 'category', 'pwd_exs', 'state'],
                    sample: ['Jane Smith', 'jane@example.com', '9876543210', 'O+', '1990-01-01', 'Female', 'Computer Science', '1', 'TRUE', 'Gen', 'FALSE', 'Kerala']
                };
            case 'employment_history':
                return {
                    headers: ['employeeid', 'designationid', 'designation', 'dateofjoining', 'dateofrelieving', 'appointmentmode', 'natureofappointment', 'isonlien', 'lienstartdate', 'lienenddate', 'lienduration', 'status', 'remarks'],
                    sample: ['1', '2', 'Assistant Professor', '2020-01-15', '', 'Direct', 'Regular', 'No', '', '', '', 'Active', 'Initial appointment']
                };
            case 'igrs_yearwise':
                return {
                    headers: ['grievance_year', 'total_grievances_filed', 'grievances_resolved', 'grievances_pending'],
                    sample: ['2023', '10', '8', '2']
                };
            case 'icc_yearwise':
                return {
                    headers: ['complaints_year', 'total_complaints', 'complaints_resolved', 'complaints_pending'],
                    sample: ['2023', '5', '4', '1']
                };
            case 'ewd_yearwise':
                return {
                    headers: ['ewd_year', 'annual_electricity_consumption', 'per_capita_electricity_consumption', 'per_capita_water_consumption', 'per_capita_recycled_water', 'green_coverage'],
                    sample: ['2023', '50000', '120.5', '45.2', '10.5', '35.5']
                };
            case 'alumni':
                return {
                    headers: ['rollno', 'name', 'alumniidno', 'currentdesignation', 'jobcountry', 'jobplace', 'yearofgraduation', 'department', 'program', 'category', 'gender', 'homestate', 'jobstate', 'outcome', 'employer_or_institution'],
                    sample: ['112233', 'Alice Bob', 'AL123', 'Software Engineer', 'India', 'Bangalore', '2022', 'CSE', 'BTech', 'Gen', 'Female', 'Kerala', 'Karnataka', 'Corporate', 'Google']
                };
            case 'research_projects':
                return {
                    headers: ['project_title', 'principal_investigator', 'department', 'project_type', 'funding_agency', 'client_organization', 'amount_sanctioned', 'start_date', 'end_date', 'status'],
                    sample: ['AI Project', 'Dr. Smith', 'CSE', 'Funded', 'DST', '', '5000000', '2023-01-01', '2025-01-01', 'Ongoing']
                };
            case 'research_mous':
                return {
                    headers: ['partner_name', 'collaboration_nature', 'date_signed', 'validity_end', 'remarks'],
                    sample: ['Tech Corp', 'Joint Research', '2023-05-15', '2026-05-15', 'Active collaboration']
                };
            case 'research_patents':
                return {
                    headers: ['patent_title', 'inventors', 'patent_status', 'filing_date', 'grant_date', 'remarks'],
                    sample: ['New Algorithm', 'Dr. Smith, John Doe', 'Filed', '2023-08-20', '', 'Pending review']
                };
            case 'externship_info':
                return {
                    headers: ['empname', 'department', 'industry_name', 'startdate', 'enddate', 'type', 'remarks'],
                    sample: ['Prof. Jones', 'EE', 'Power Grid Corp', '2023-06-01', '2023-07-31', 'Summer Externship', 'Completed']
                };
            case 'research_publications':
                return {
                    headers: ['publication_title', 'journal_name', 'department', 'faculty_name', 'publication_year', 'publication_type'],
                    sample: ['Deep Learning', 'IEEE Transactions', 'CSE', 'Dr. Smith', '2023', 'Journal']
                };
            case 'industry_courses':
                return {
                    headers: ['year_offered', 'course_title', 'department', 'industry_partner', 'is_active'],
                    sample: ['2023', 'Cloud Computing', 'CSE', 'Google', 'TRUE']
                };
            case 'academic_program_launch':
                return {
                    headers: ['launch_year', 'program_code', 'program_name', 'program_type', 'department', 'oelp_students'],
                    sample: ['2023', 'DS_MTECH', 'Data Science', 'MTech', 'CSE', '50']
                };
            case 'placement_summary':
                return {
                    headers: ['placement_year', 'program', 'gender', 'registered', 'placed'],
                    sample: ['2023', 'UG', 'Male', '120', '110']
                };
            case 'placement_companies':
                return {
                    headers: ['placement_year', 'company_name', 'sector', 'offers', 'hires', 'is_top_recruiter'],
                    sample: ['2023', 'Microsoft', 'IT', '10', '8', 'TRUE']
                };
            case 'startups':
                return {
                    headers: ['startup_name', 'founder_name', 'innovation_focus_area', 'year_of_incubation', 'status', 'sector', 'is_from_iitpkd'],
                    sample: ['InnovateAI', 'Jane Doe', 'AI/ML', '2022', 'Active', 'DeepTech', 'TRUE']
                };
            case 'industry_conclave':
                return {
                    headers: ['year', 'theme', 'focus_area', 'number_of_companies', 'description', 'sessions_held', 'key_speakers', 'brochure_url', 'event_photos_url'],
                    sample: ['2023', 'Industry 4.0', 'Automation', '50', 'Annual Conclave', '5', 'Mr. X, Ms. Y', '', '']
                };
            case 'open_house':
                return {
                    headers: ['event_year', 'event_date', 'theme', 'target_audience', 'departments_participated', 'num_departments', 'total_visitors', 'key_highlights', 'photos_url', 'poster_url', 'brochure_url'],
                    sample: ['2023', '2023-10-15', 'Science Day', 'School Students', '"CSE, ECE, ME"', '3', '500', 'Robot Demo', 'https://example.com/photos', 'https://example.com/poster.pdf', 'https://example.com/brochure.pdf']
                };
            case 'nptel_local_chapters':
                return {
                    headers: ['chapter_name', 'faculty_coordinator', 'is_active', 'established_year'],
                    sample: ['IIT Palakkad Chapter', 'Dr. Smith', 'TRUE', '2019']
                };
            case 'nptel_courses':
                return {
                    headers: ['course_code', 'course_title', 'course_category', 'offering_semester', 'offering_year'],
                    sample: ['NPTEL123', 'Data Structures', 'Engineering', 'Spring', '2023']
                };
            case 'nptel_enrollments':
                return {
                    headers: ['enrollment_year', 'course_code', 'student_name', 'enrollment_semester', 'certification_earned', 'certification_date'],
                    sample: ['2023', 'NPTEL123', 'John Doe', 'Spring', 'TRUE', '2023-05-20']
                };
            case 'uba_projects':
                return {
                    headers: ['project_title', 'coordinator_name', 'project_status', 'start_date', 'end_date', 'intervention_description', 'collaboration_partners'],
                    sample: ['Water Conservation', 'Dr. Green', 'Ongoing', '2023-01-01', '', 'Village pond restoration', 'Panchayat']
                };
            case 'uba_events':
                return {
                    headers: ['project_title', 'event_title', 'event_type', 'event_date', 'location', 'description', 'photos_url', 'brochure_url'],
                    sample: ['Water Conservation', 'Awareness Camp', 'Workshop', '2023-03-22', 'Village Hall', 'Community meeting', '', '']
                };

            default:
                return { headers: [], sample: [] };
        }
    };

    const handleDownloadTemplate = () => {
        const { headers, sample } = getTemplateData(tableName);
        if (headers.length === 0) return;

        const csvContent = [
            headers.join(','),
            sample.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${tableName}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const templateInfo = getTemplateData(tableName);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upload Data: {tableName}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="warning-box">
                        <span className="warning-icon">⚠️</span>
                        <div>
                            <strong>Warning:</strong> You are directly modifying the database.
                            Ensure the CSV format matches the table schema exactly.

                            <div style={{ marginTop: '0.5rem' }}>
                                <button
                                    className="download-template-btn"
                                    onClick={handleDownloadTemplate}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #f59e0b',
                                        color: '#f59e0b',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Download CSV Template
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="required-format-section" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                        <strong>Required Column Headers:</strong>
                        <div style={{
                            backgroundColor: '#2d3748',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            marginTop: '0.25rem',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap'
                        }}>
                            {templateInfo.headers.join(', ')}
                        </div>
                    </div>

                    <div className="file-input-container">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                    </div>

                    {previewData && (
                        <div className="preview-section">
                            <h4>CSV Preview (First 5 Rows)</h4>
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        {previewData.header.map((head, i) => <th key={i}>{head}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.rows.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => <td key={j}>{cell}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {message && (
                        <div className={`status-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="upload-actions">
                        <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button
                            className="upload-btn"
                            onClick={handleUpload}
                            disabled={!selectedFile || isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataUploadModal;
