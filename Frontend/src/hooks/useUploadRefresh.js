import { useState, useEffect } from 'react';

/**
 * Returns an ever-incrementing version counter that bumps whenever a CSV
 * upload succeeds anywhere in the app.  Add the returned value to the
 * dependency array of any fetch useEffect to auto-refresh after an upload.
 *
 * Usage:
 *   const uploadVersion = useUploadRefresh();
 *   useEffect(() => { loadData(); }, [token, uploadVersion]);
 */
export function useUploadRefresh() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('iitpkd:upload-success', handler);
    return () => window.removeEventListener('iitpkd:upload-success', handler);
  }, []);

  return version;
}
