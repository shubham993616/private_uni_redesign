import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, FileText, FileSpreadsheet, Check } from 'lucide-react';
import axios from 'axios';
import api from '../../utils/api';  

const ExcelUploader = ({ onUploadComplete, type = 'universities' }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('upload'); // upload, preview, confirm
  const [previewData, setPreviewData] = useState(null);
  const [uploadMode, setUploadMode] = useState('upsert');
  const [progress, setProgress] = useState(0);
  const [useBulkMode, setUseBulkMode] = useState(true); // NEW: Use bulk upload (both sheets)
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      if (useBulkMode) {
        // For bulk mode, directly proceed to bulk upload
        handleBulkUpload(uploadedFile);
      } else {
        // For single sheet mode, get sheet names first
        getSheetNames(uploadedFile);
      }
    }
  }, [useBulkMode]);

  const getSheetNames = async (fileToCheck) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToCheck);

    try {
      const response = await api.post('/admin/upload/sheets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSheetNames(response.data.sheets);
      
      // Auto-select first valid sheet
      const firstSheet = response.data.sheets[0] || '';
      setSelectedSheet(firstSheet);
      handlePreview(fileToCheck, firstSheet);
    } catch (error) {
      alert(`Failed to read Excel file: ${error.response?.data?.error || error.message}`);
      setUploading(false);
    }
  };

  const handlePreview = async (fileToPreview, sheetName = selectedSheet) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToPreview);
    formData.append('sheetName', sheetName);
    formData.append('uploadType', type);

    try {
      const response = await api.post('/admin/upload/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Excel imports do heavy DB work (dedup + upserts + course linking) and
        // run on a slow/cold free-tier backend — allow up to 15 min, not the
        // global 30s default, so large sheets don't get cancelled mid-import.
        timeout: 900000,
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      setPreviewData(response.data);
      setStep('preview');
    } catch (error) {
      alert(`Preview failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleConfirm = async () => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', uploadMode);
    formData.append('validateOnly', 'false');
    formData.append('sheetName', selectedSheet);
    formData.append('uploadType', type);

    try {
      const response = await api.post('/admin/upload/confirm', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Excel imports do heavy DB work (dedup + upserts + course linking) and
        // run on a slow/cold free-tier backend — allow up to 15 min, not the
        // global 30s default, so large sheets don't get cancelled mid-import.
        timeout: 900000,
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      if (onUploadComplete) onUploadComplete(response.data);
      setStep('complete');
    } catch (error) {
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // NEW: Handle bulk upload (both sheets together)
  const handleBulkUpload = async (fileToUpload) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('mode', uploadMode);

    try {
      const response = await api.post('/admin/upload/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Excel imports do heavy DB work (dedup + upserts + course linking) and
        // run on a slow/cold free-tier backend — allow up to 15 min, not the
        // global 30s default, so large sheets don't get cancelled mid-import.
        timeout: 900000,
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      // Set preview data from bulk response
      setPreviewData({
        sheetType: 'bulk',
        totalRows: (response.data.results?.universities?.created || 0) + (response.data.results?.courses?.created || 0),
        validCount: (response.data.results?.universities?.created || 0) + (response.data.results?.courses?.created || 0),
        invalidCount: (response.data.results?.universities?.skipped || 0) + (response.data.results?.courses?.skipped || 0),
        errors: [...(response.data.results?.universities?.errors || []), ...(response.data.results?.courses?.errors || [])],
        warnings: [],
        preview: [],
        bulkResults: response.data.results
      });
      
      setStep('preview');
    } catch (error) {
      alert(`Bulk upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewData(null);
    setStep('upload');
    setUploadMode('upsert');
    setSheetNames([]);
    setSelectedSheet('');
  };

  const ValidationSummary = () => {
    if (!previewData) return null;
    
    // Check if this is bulk upload results
    if (previewData.bulkResults) {
      const { universities, courses } = previewData.bulkResults;
      return (
        <div className="mb-6 space-y-4">
          <div className="bg-success-tint dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-card p-4">
            <h4 className="flex items-center gap-1.5 font-semibold text-success-text dark:text-green-300 mb-2"><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Bulk Upload Complete!</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-label">Universities:</p>
                <ul className="text-sm tabular-nums mt-1 space-y-1">
                  <li className="flex items-center gap-1.5 text-success-text dark:text-green-400"><Check className="w-3.5 h-3.5" aria-hidden="true" /> Created: {universities.created}</li>
                  <li className="flex items-center gap-1.5 text-info-text dark:text-blue-400"><Check className="w-3.5 h-3.5" aria-hidden="true" /> Updated: {universities.updated}</li>
                  <li className="flex items-center gap-1.5 text-warning-text dark:text-amber-300"><AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Skipped: {universities.skipped}</li>
                </ul>
              </div>
              <div>
                <p className="text-label">Courses:</p>
                <ul className="text-sm tabular-nums mt-1 space-y-1">
                  <li className="flex items-center gap-1.5 text-success-text dark:text-green-400"><Check className="w-3.5 h-3.5" aria-hidden="true" /> Created: {courses.created}</li>
                  <li className="flex items-center gap-1.5 text-info-text dark:text-blue-400"><Check className="w-3.5 h-3.5" aria-hidden="true" /> Updated: {courses.updated}</li>
                  <li className="flex items-center gap-1.5 text-warning-text dark:text-amber-300"><AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Skipped: {courses.skipped}</li>
                </ul>
              </div>
            </div>
          </div>
          
          {previewData.errors && previewData.errors.length > 0 && (
            <div className="bg-error-tint dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card p-4">
              <h4 className="font-semibold text-error-text dark:text-red-300 mb-2">Errors ({previewData.errors.length})</h4>
              <ul className="list-disc list-inside space-y-1 max-h-40 overflow-auto">
                {previewData.errors.slice(0, 10).map((err, i) => (
                  <li key={i} className="text-sm text-error-text dark:text-red-400">{err.error || err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    
    // Regular single sheet preview
    const { validCount, invalidCount, errors, warnings, totalRows } = previewData;

    return (
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-info-tint dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-card">
            <div className="text-stat !text-info-text dark:!text-blue-300">{totalRows}</div>
            <div className="text-caption">Total Rows</div>
          </div>
          <div className="bg-success-tint dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-card">
            <div className="text-stat !text-success-text dark:!text-green-300">{validCount}</div>
            <div className="text-caption">Valid Rows</div>
          </div>
          <div className="bg-error-tint dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-card">
            <div className="text-stat !text-error-text dark:!text-red-300">{invalidCount}</div>
            <div className="text-caption">Invalid Rows</div>
          </div>
        </div>

        {errors && errors.length > 0 && (
          <div className="bg-error-tint dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card p-4">
            <h4 className="font-semibold text-error-text dark:text-red-300 mb-2">Errors ({errors.length})</h4>
            <ul className="list-disc list-inside space-y-1 max-h-40 overflow-auto">
              {errors.slice(0, 10).map((err, i) => (
                <li key={i} className="text-sm text-error-text dark:text-red-400">{err}</li>
              ))}
              {errors.length > 10 && (
                <li className="text-sm text-error-text dark:text-red-400">...and {errors.length - 10} more</li>
              )}
            </ul>
          </div>
        )}

        {warnings && warnings.length > 0 && (
          <div className="bg-warning-tint dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-card p-4">
            <h4 className="font-semibold text-warning-text dark:text-amber-300 mb-2">Warnings ({warnings.length})</h4>
            <ul className="list-disc list-inside space-y-1 max-h-40 overflow-auto">
              {warnings.slice(0, 10).map((warn, i) => (
                <li key={i} className="text-sm text-warning-text dark:text-amber-400">{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {previewData.preview && previewData.preview.length > 0 && (
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-card overflow-hidden">
            <h4 className="text-card-title p-3 bg-light-card dark:bg-white/5 border-b border-light-border dark:border-dark-border">Preview (First 5 rows)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm tabular-nums">
                <thead className="bg-light-card dark:bg-white/5">
                  <tr>
                    <th className="px-3 py-2 text-left text-eyebrow !text-light-muted dark:!text-dark-muted">Status</th>
                    {Object.keys(previewData.preview[0] || {})
                      .filter(k => !k.startsWith('_'))
                      .slice(0, 6)
                      .map(key => (
                        <th key={key} className="px-3 py-2 text-left text-eyebrow !text-light-muted dark:!text-dark-muted">{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className={row._validation?.isValid ? '' : 'bg-error-tint dark:bg-red-900/20'}>
                      <td className="px-3 py-2">
                        {row._validation?.isValid
                          ? <CheckCircle2 className="w-4 h-4 text-success" aria-label="Valid row" />
                          : <XCircle className="w-4 h-4 text-error" aria-label="Invalid row" />}
                      </td>
                      {Object.entries(row)
                        .filter(([k]) => !k.startsWith('_'))
                        .slice(0, 6)
                        .map(([key, val]) => (
                          <td key={key} className="px-3 py-2 truncate max-w-xs">
                            {typeof val === 'object' ? JSON.stringify(val).slice(0, 50) : String(val || '').slice(0, 50)}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: 10485760 // 10MB
  });

  if (step === 'complete') {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" aria-hidden="true" />
        <h3 className="text-h3 mb-2">Upload Complete!</h3>
        <p className="text-support mb-4">Your data has been successfully imported.</p>
        <button onClick={reset} className="btn-primary text-sm">
          Upload Another File
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-light-border dark:border-dark-border">
        <h2 className="text-h3">
          Upload {type === 'universities' ? 'Universities' : 'Courses'} Data
        </h2>
        <p className="text-support mt-1">
          Upload Excel files with messy data — auto-detects headers and cleans values
        </p>
      </div>

      <div className="p-6">
        {/* NEW: Bulk Mode Toggle */}
        <div className="mb-6">
          <label className="block text-label mb-2">Upload Mode</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setUseBulkMode(true);
                reset();
              }}
              className={`px-4 py-2 rounded-btn text-sm font-semibold transition-colors duration-150 ${
                useBulkMode
                  ? 'bg-primary text-white'
                  : 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:border-primary/40'
              }`}
            >
              <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-4 h-4" aria-hidden="true" /> Bulk Upload (Both Sheets)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUseBulkMode(false);
                reset();
              }}
              className={`px-4 py-2 rounded-btn text-sm font-semibold transition-colors duration-150 ${
                !useBulkMode
                  ? 'bg-primary text-white'
                  : 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:border-primary/40'
              }`}
            >
              <span className="inline-flex items-center gap-1.5"><FileText className="w-4 h-4" aria-hidden="true" /> Single Sheet Upload</span>
            </button>
          </div>
          <p className="text-caption mt-2">
            {useBulkMode 
              ? 'Upload one file with both "Universities" and "Courses" sheets - they will be linked automatically'
              : 'Upload a single sheet (Universities OR Courses) from your Excel file'}
          </p>
        </div>

        {step === 'upload' && (
          <>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-colors duration-150
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-light-border dark:border-dark-border hover:border-primary/60'}`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-light-muted dark:text-dark-muted" aria-hidden="true" />
              {isDragActive ? (
                <p className="text-link dark:text-primary-300">Drop the Excel file here...</p>
              ) : (
                <>
                  <p className="text-body">Drag & drop an Excel file here, or click to select</p>
                  <p className="text-support mt-1">Supports .xlsx, .xls, .csv (max 10MB)</p>
                </>
              )}
            </div>

            {/* Sheet selector - only for single sheet mode */}
            {!useBulkMode && sheetNames.length > 0 && (
              <div className="mt-4">
                <label className="block text-label mb-2">Select Sheet</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => {
                    setSelectedSheet(e.target.value);
                    if (file) handlePreview(file, e.target.value);
                  }}
                  className="input-field"
                >
                  {sheetNames.map((sheet, i) => (
                    <option key={i} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {step === 'preview' && previewData && (
          <>
            <ValidationSummary />
            
            {/* Only show import mode selector for single sheet mode */}
            {!previewData.bulkResults && (
              <div className="mb-4">
                <label className="block text-label mb-2">Import Mode</label>
                <select 
                  value={uploadMode} 
                  onChange={(e) => setUploadMode(e.target.value)}
                  className="h-11 w-48 px-3.5 rounded-btn border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-primary transition-colors duration-150"
                >
                  <option value="upsert">Update existing / Insert new</option>
                  <option value="insert">Insert only (skip existing)</option>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              {previewData.bulkResults ? (
                <button
                  onClick={() => setStep('complete')}
                  className="btn-primary text-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={uploading || previewData.validCount === 0}
                  className="btn-primary text-sm"
                >
                  {uploading ? `Importing... ${progress}%` : `Import ${previewData.validCount} Valid Rows`}
                </button>
              )}
              <button
                onClick={reset}
                disabled={uploading}
                className="btn-outline text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {!previewData.bulkResults && previewData.invalidCount > 0 && (
              <p className="flex items-center gap-1.5 text-sm text-error-text dark:text-red-400 mt-4">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" /> {previewData.invalidCount} rows have errors and will be skipped. Fix them in Excel and re-upload.
              </p>
            )}
          </>
        )}

        {uploading && step === 'upload' && (
          <div className="mt-4">
            <div className="bg-light-card dark:bg-dark-border rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-support tabular-nums mt-2">Processing file... {progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploader;
