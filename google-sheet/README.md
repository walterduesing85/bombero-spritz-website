# Anfragen automatisch in Google Sheets

Bei jeder gesendeten Anfrage wird zusätzlich eine Zeile in ein Google Sheet geschrieben.

1. Neues Google Sheet anlegen (z. B. „Bombero Anfragen“).
2. **Erweiterungen → Apps Script**, den Inhalt von `Code.gs` einfügen, speichern.
3. **Bereitstellen → Neue Bereitstellung → Typ: Web-App**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
4. Berechtigungen bestätigen und die **Web-App-URL** kopieren.
5. In `app.js` die URL bei `SHEET_URL` eintragen, committen und pushen.

Die Kopfzeile wird beim ersten Eintrag automatisch angelegt. Nach Änderungen an `Code.gs`
muss eine neue Bereitstellung (neue Version) veröffentlicht werden.

Hinweis: In der Datenschutzerklärung ist Google (Sheets) als Empfänger zu ergänzen.
