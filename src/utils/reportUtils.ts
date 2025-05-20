
import reportData from '../data/reports.json';

// Define the Report type
export interface Report {
  reportID: string;
  userID: string;
  type: string;
  description: string;
  geoPoint: { lat: number; lon: number };
  photos: string[];
  timestamp: string;
  status: string;
  isPrivate: boolean;
}

const REPORTS_STORAGE_KEY = 'mekarmap-reports';

// Get reports from localStorage or initial data
export const getLocalReports = (): Report[] => {
  const storedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
  
  if (storedReports) {
    try {
      return JSON.parse(storedReports);
    } catch (e) {
      console.error('Failed to parse stored reports:', e);
      return [...reportData];
    }
  }
  
  // First time: initialize with mock data
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reportData));
  return [...reportData];
};

// Save a new report
export const saveReport = (report: Report): void => {
  const reports = getLocalReports();
  reports.push(report);
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
};

// Update an existing report
export const updateReport = (reportID: string, updates: Partial<Report>): boolean => {
  const reports = getLocalReports();
  const index = reports.findIndex(r => r.reportID === reportID);
  
  if (index >= 0) {
    reports[index] = { ...reports[index], ...updates };
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    return true;
  }
  
  return false;
};

// Delete a report
export const deleteReport = (reportID: string): boolean => {
  const reports = getLocalReports();
  const newReports = reports.filter(r => r.reportID !== reportID);
  
  if (newReports.length < reports.length) {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(newReports));
    return true;
  }
  
  return false;
};

// Clear all reports (reset to initial data)
export const resetReports = (): void => {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reportData));
};
