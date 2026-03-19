import { format, isValid } from 'date-fns';

/**
 * Safely formats a date or string, returning a fallback if invalid
 */
export const safeFormat = (date: any, formatStr: string, fallback: string = 'N/A') => {
  if (!date) return fallback;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (!isValid(dateObj)) {
    return fallback;
  }
  
  try {
    return format(dateObj, formatStr);
  } catch (err) {
    console.warn('Date formatting error:', err);
    return fallback;
  }
};
