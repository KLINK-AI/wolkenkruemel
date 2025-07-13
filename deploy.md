# Deployment-Anleitung für Wolkenkrümel

## Schritt 1: Altes Deployment löschen

1. Gehen Sie zu https://replit.com/deployments
2. Finden Sie das Deployment "wolkenkruemel-sk324"
3. Klicken Sie auf das Deployment
4. Gehen Sie zu "Settings" (Einstellungen)
5. Klicken Sie auf "Delete Deployment" (Deployment löschen)
6. Bestätigen Sie die Löschung

## Schritt 2: Neues Deployment erstellen

1. Zurück zu diesem Repl
2. Klicken Sie auf "Deploy" (oben rechts)
3. Wählen Sie "Autoscale Deployment"
4. Verwenden Sie diese Einstellungen:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `.` (aktuelles Verzeichnis)

## Schritt 3: Umgebungsvariablen konfigurieren

Das System wird automatisch diese Variablen setzen:
- `DATABASE_URL` (automatisch)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` (automatisch)
- `NODE_ENV=production` (manuell setzen)

## Schritt 4: Deployment starten

1. Klicken Sie auf "Deploy"
2. Warten Sie, bis das Deployment abgeschlossen ist
3. Testen Sie die neue URL

## Warum das funktionieren wird

- Die Entwicklungsumgebung funktioniert bereits perfekt
- Alle 18 Aktivitäten sind in der Datenbank vorhanden
- Das Backend ist korrekt konfiguriert
- Das neue Deployment wird die aktuelle Version verwenden

## Falls Probleme auftreten

- Überprüfen Sie die Deployment-Logs
- Stellen Sie sicher, dass NODE_ENV=production gesetzt ist
- Kontaktieren Sie mich, wenn die API-Aufrufe weiterhin fehlschlagen