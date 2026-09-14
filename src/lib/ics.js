function stamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
}

const encoder = new TextEncoder()

// RFC 5545 §3.1: lines longer than 75 octets continue on the next line after a space.
function fold(line) {
  if (encoder.encode(line).length <= 75) return line
  const parts = []
  let current = ''
  let size = 0
  for (const char of line) {
    const bytes = encoder.encode(char).length
    const limit = parts.length ? 74 : 75
    if (size + bytes > limit) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += char
    size += bytes
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/** A one-event calendar file that reminds you when a pint is ready to spin. */
export function pintReminderIcs({ uid, title, readyAt, url, now = new Date() }) {
  const end = new Date(readyAt.getTime() + 15 * 60 * 1000)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Spinly//Pint reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@spinly`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(readyAt)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(`Spin your ${title}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(`${title} is ready to spin`)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(fold).join('\r\n') + '\r\n'
}
