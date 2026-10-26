# Bombero Spritz – HTML-Projekt

Aktuelle Website-Version mit Original-Logo, rotem Header, Teamfoto im Hero-Bild mit feinem schwarzem Rahmen, Eventgalerie und Eventanfrage.

## In Visual Studio Code öffnen

1. ZIP-Datei entpacken.
2. In VS Code **Datei → Ordner öffnen** wählen und den Ordner `Bombero-Spritz-HTML` öffnen.
3. `index.html` im Browser öffnen. Das Projekt funktioniert ohne Installation und ohne Build-Schritt.

Optional mit lokalem Server: Im Terminal des Projektordners `python3 -m http.server 8000` starten und http://localhost:8000 öffnen. Auf Windows kann der Befehl `py -m http.server 8000` verwendet werden. Mit Strg+C beenden.

## Dateien

- `index.html`: Seitenstruktur, Texte, Formular und Bildergalerie
- `style.css`: Farben, Schriftarten, Layout und mobile Darstellung
- `impressum.html`: Impressum mit den Angaben der bestehenden Website (Firmenname, Firmensitz, Geschäftsführer, Kontakt, Umsatzsteuer-Nr.). Der Footer-Link „Kontakt & Anbieterinformationen“ führt hierher.
- `datenschutz.html`: Datenschutzerklärung mit dem Wortlaut der bestehenden Website (Stand Mai 2026). Impressum und Datenschutzerklärung sind im Footer verlinkt.
- `i18n.js`: Sprachumschalter (DE/EN) mit den englischen Übersetzungen. Deutsch ist der Originaltext im HTML; neue deutsche Texte brauchen hier einen englischen Eintrag.
- `app.js`: Formularschritte, Mengenberechnung, Eingabeprüfung und E-Mail-Vorbereitung
- `assets/`: Alle aktuell verwendeten Bilder, inklusive Logo

## Eventanfrage

1. Gästezahl, Servicestunden, Datum und optionale Thunfisch-Tramezzini.
2. Auswahl per Häkchen, Mengen änderbar: Aperitivo (Gäste × Stunden) und Wasser (kleine Flaschen à 0,2 l, Hälfte still, Hälfte sprudelnd, zusammen eine pro Gast) sind vorausgewählt; Begrüßungsbubbles (Sekt, Crémant oder Champagner), Limonade und Thunfisch-Tramezzini lassen sich zuwählen (je ein Stück pro Gast). Die Mengenzeile erscheint nur bei gesetztem Häkchen; bei Menge 0 verschwindet der Eintrag wieder. Oliven inklusive. Mengen können nicht negativ sein.
3. Kontaktangaben und Übersicht.

Der letzte Button „Anfrage senden“ schickt die Anfrage per `fetch` an den Formular-Dienst FormSubmit (`formsubmit.co/ajax/info@bomberospritz.de`), der sie als E-Mail an `info@bomberospritz.de` weiterleitet. Beim allerersten Absenden schickt FormSubmit eine Aktivierungs-Mail an diese Adresse, die einmal bestätigt werden muss. Schlägt das Senden fehl, erscheint ein Link, der stattdessen das E-Mail-Programm öffnet (`mailto:`). Ein verstecktes Feld `website` dient als einfacher Spam-Schutz. Es gibt keine Datenbank, Zahlungsabwicklung oder serverseitige Speicherung. Zum tatsächlichen Absenden ist ein eingerichtetes E-Mail-Programm erforderlich.

## Externe Ressourcen

Schriftarten werden über Google Fonts geladen. Ohne Internet verwendet der Browser die hinterlegten Ersatzschriften. Alle Bilder liegen lokal bei. Die Anbieterinformationen stehen lokal in `impressum.html`.

## Hinweise zur Bearbeitung

Das Hero-Bild `assets/hero.webp` zeigt das Bombero-Team am Feuerwehrwagen. Es wurde aus dem bereitgestellten RAW-Foto für die Website aufbereitet. Die vier Eventfotos sind unveränderte Originalfotos.

Bei einer Veröffentlichung auf eigener Hosting-Infrastruktur die Anbieter- und Datenschutzangaben sowie eine gewünschte direkte Formularzustellung passend ergänzen.

## Instagram

Der Abschnitt „Instagram“ (`#instagram`) zeigt neun lokal gespeicherte Fotos aus `assets/insta/` und verlinkt auf https://www.instagram.com/bomberospritz/. Es werden keine Inhalte von Instagram geladen (keine Cookies, kein Tracking). Fotos austauschen: Dateien in `assets/insta/` ersetzen und die `<img>`-Tags in `index.html` anpassen.

## Adresssuche & Karte

Schritt 01 enthält ein Adressfeld mit Vorschlägen (Photon/komoot) und einer Kartenansicht (Leaflet lokal in `assets/leaflet/`, Kacheln von OpenStreetMap). Beides wird erst nach Klick auf „Vorschläge & Karte aktivieren“ geladen (Einwilligung, gespeichert in `localStorage` als `mapConsent`). Bei Auswahl erscheint die Karte, und die E-Mail enthält einen OpenStreetMap-Link. Das frühere Feld „Ort / Postleitzahl“ im Kontaktschritt entfällt. Die Datenschutzerklärung enthält dazu einen eigenen Abschnitt.
