// src/utils/formatDate.js

import { formatDistanceToNow, format, isPast } from 'date-fns';

/**
 * Convert Firestore Timestamp or JS Date to a JS Date object safely
 */
const toDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();   // Firestore Timestamp
  if (value instanceof Date) return value;
  return new Date(value);                      // ISO string or number
};

/**
 * "2 days ago", "5 minutes ago", etc.
 */
export const timeAgo = (value) => {
  const d = toDate(value);
  if (!d) return 'Recently';
  return formatDistanceToNow(d, { addSuffix: true });
};

/**
 * "Jan 15, 2025"
 */
export const formatDate = (value) => {
  const d = toDate(value);
  if (!d) return 'N/A';
  return format(d, 'MMM d, yyyy');
};

/**
 * Check if a deadline date has passed
 */
export const isExpired = (value) => {
  const d = toDate(value);
  if (!d) return false;
  return isPast(d);
};