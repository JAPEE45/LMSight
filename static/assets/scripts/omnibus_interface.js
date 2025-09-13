function downloadOmnibus() {
  const link = document.createElement('a');
  link.href = '../../static/assets/files/OmnibusRules.pdf';
  link.download = 'OmnibusRules.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}