/**
 * Event object format:
 * {
 *   date: "2025-10-20",          // YYYY-MM-DD
 *   startTime: "14:00",          // HH:mm 24-hour
 *   endTime: "16:00",            // HH:mm 24-hour
 *   status: "active"             // "active", "cancelled", "ended"
 * }
 */

const validateDate = (eventDate) => {
  const now = new Date();
  return eventDate >= now;
};

const validateTime = (start, end) => {
  if (start >= end) return false;      // End must be after start
  return true;
};

const isActive = (event) => {
  const now = new Date();
  const start = new Date(`${event.date}T${event.startTime}`);
  const end = new Date(`${event.date}T${event.endTime}`);
  return event.status === "active" && now >= start && now <= end;
};

const hasEnded = (event) => {
  const now = new Date();
  const end = new Date(`${event.date}T${event.endTime}`);
  return now > end || event.status === "ended";
};

const isCancelled = (event) => {
  return event.status === "cancelled";
};

module.exports = {
  validateDate,
  validateTime,
  isActive,
  hasEnded,
  isCancelled,
};
