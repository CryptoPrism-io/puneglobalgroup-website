const OPT_IN_MARKER = 'WA_OPT_IN:';
const OPT_OUT_MARKER = 'WA_OPT_OUT:';

function hasWhatsAppOptIn(contact) {
  const notes = String(contact?.notes || '');
  return notes.lastIndexOf(OPT_IN_MARKER) > notes.lastIndexOf(OPT_OUT_MARKER);
}

function appendConsentNote(notes, marker, source, at = new Date()) {
  const current = String(notes || '').trim();
  const entry = `${marker} ${source} ${at.toISOString()}`;
  return current ? `${current}\n${entry}` : entry;
}

module.exports = { OPT_IN_MARKER, OPT_OUT_MARKER, hasWhatsAppOptIn, appendConsentNote };
