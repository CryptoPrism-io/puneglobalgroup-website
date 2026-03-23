function renderTemplate(templateStr, context) {
  if (!templateStr) return '';
  const { lead, contact, quote, custom } = context || {};
  return templateStr.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const parts = path.split('.');
    let value;
    switch (parts[0]) {
      case 'lead':
        value = lead ? lead[parts[1]] : null;
        break;
      case 'contact':
        value = contact ? contact[parts[1]] : null;
        break;
      case 'quote':
        value = quote ? quote[parts[1]] : null;
        if (parts[1] === 'grandTotal' && value) {
          value = '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        }
        if (parts[1] === 'validUntil' && value) {
          value = new Date(value).toLocaleDateString('en-IN');
        }
        break;
      case 'sender':
        if (parts[1] === 'name') value = process.env.SENDER_NAME || 'Pune Global Group';
        if (parts[1] === 'phone') value = process.env.SENDER_PHONE || '';
        break;
      case 'today':
        value = new Date().toLocaleDateString('en-IN');
        break;
      case 'custom':
        value = custom ? custom[parts[1]] : null;
        break;
      default:
        value = null;
    }
    return value != null ? String(value) : match;
  });
}

module.exports = { renderTemplate };
