/**
 * Formats an ISO date string to a readable format
 * @param isoDate - ISO date string (e.g., "2024-10-01T10:30:00.000Z")
 * @returns Formatted date string (e.g., "Oct 1, 2024")
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats an ISO date string to include time
 * @param isoDate - ISO date string (e.g., "2024-10-01T10:30:00.000Z")
 * @returns Formatted date and time string (e.g., "Oct 1, 2024, 10:30 AM")
 */
export const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('en-US', options);
};
