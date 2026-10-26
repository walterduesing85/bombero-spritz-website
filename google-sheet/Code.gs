const COLUMNS = [
  ['Eingegangen', null],
  ['Status', null],
  ['Sprache', 'sprache'],
  ['Art des Events', 'eventtyp'],
  ['Gäste', 'gaeste'],
  ['Stunden', 'stunden'],
  ['Datum', 'datum'],
  ['Adresse', 'adresse'],
  ['Karte', 'karte'],
  ['Spritz-Aperitivi', 'aperitivo'],
  ['Wasser still', 'wasser_still'],
  ['Wasser sprudelnd', 'wasser_sprudel'],
  ['Wasser Liter', 'wasser_liter'],
  ['Bubbles Sorte', 'bubbles_sorte'],
  ['Bubbles Gläser', 'bubbles_glaeser'],
  ['Limonade', 'limonade'],
  ['Bier alkoholfrei', 'bier_alkoholfrei'],
  ['Bier mit Alkohol', 'bier_peroni'],
  ['Tramezzini', 'tramezzini'],
  ['Weitere Wünsche', 'wunsch'],
  ['Name', 'name'],
  ['E-Mail', 'email'],
  ['Telefon', 'telefon'],
];

// Stops text from being interpreted as a spreadsheet formula.
function safe(value) {
  const text = String(value == null ? '' : value).slice(0, 2000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map((column) => column[0]));
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    }

    sheet.appendRow(COLUMNS.map(([title, key]) => {
      if (title === 'Eingegangen') {
        return new Date();
      }
      if (title === 'Status') {
        return 'Neu';
      }
      return safe(data[key]);
    }));

    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
