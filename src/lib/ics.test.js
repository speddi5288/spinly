import assert from 'node:assert/strict'
import test from 'node:test'
import { pintReminderIcs } from './ics.js'

const base = {
  uid: 'pint-123',
  title: 'Mango Lime Sorbet',
  readyAt: new Date('2026-09-14T12:00:00.000Z'),
  url: 'https://spinly.app/pints',
  now: new Date('2026-09-13T08:30:05.123Z'),
}

const lines = (ics) => ics.split('\r\n')
const field = (ics, name) => lines(ics).find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1)

test('uses CRLF line endings and ends with a line break', () => {
  const ics = pintReminderIcs(base)
  assert.ok(ics.endsWith('\r\n'))
  assert.ok(!ics.replaceAll('\r\n', '').includes('\n'))
})

test('wraps one event with an alarm in a calendar', () => {
  const blocks = lines(pintReminderIcs(base)).filter((line) => /^(BEGIN|END):/.test(line))
  assert.deepEqual(blocks, ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'BEGIN:VALARM', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'])
  const ics = pintReminderIcs(base)
  assert.equal(field(ics, 'VERSION'), '2.0')
  assert.equal(field(ics, 'PRODID'), '-//Spinly//Pint reminder//EN')
  assert.equal(field(ics, 'ACTION'), 'DISPLAY')
  assert.equal(field(ics, 'TRIGGER'), 'PT0M')
})

test('event fields use UTC stamps and a 15 minute window', () => {
  const ics = pintReminderIcs(base)
  assert.equal(field(ics, 'UID'), 'pint-123@spinly')
  assert.equal(field(ics, 'DTSTAMP'), '20260913T083005Z')
  assert.equal(field(ics, 'DTSTART'), '20260914T120000Z')
  assert.equal(field(ics, 'DTEND'), '20260914T121500Z')
  assert.equal(field(ics, 'SUMMARY'), 'Spin your Mango Lime Sorbet')
  assert.equal(field(ics, 'DESCRIPTION'), 'Mango Lime Sorbet is ready to spin')
  assert.equal(field(ics, 'URL'), 'https://spinly.app/pints')
})

test('escapes backslashes, commas, semicolons, and newlines in text', () => {
  const ics = pintReminderIcs({ ...base, title: 'PB, banana; half\\half\nlite' })
  assert.equal(field(ics, 'SUMMARY'), 'Spin your PB\\, banana\\; half\\\\half\\nlite')
  assert.equal(field(ics, 'DESCRIPTION'), 'PB\\, banana\\; half\\\\half\\nlite is ready to spin')
})

// RFC 5545 section 3.1: content lines are folded at 75 octets.
test('folds content lines longer than 75 octets without losing text', () => {
  const title = 'A very long community recipe title that keeps going past the limit — crème brûlée'
  const ics = pintReminderIcs({ ...base, title })
  for (const line of lines(ics)) assert.ok(Buffer.byteLength(line) <= 75, line)
  const unfolded = ics.replaceAll('\r\n ', '')
  assert.equal(field(unfolded, 'SUMMARY'), `Spin your ${title}`)
})
