# GitHub Verbindung einrichten

## PROBLEM: 
Git Repository ist noch nicht mit GitHub verbunden.

## LÖSUNG:

### 1. GitHub Repository URL finden:
- Gehen Sie zu Ihrem GitHub `wolkenkruemel` Repository
- Klicken Sie den grünen **"Code"** Button
- Kopieren Sie die HTTPS URL (z.B. `https://github.com/IHRUSERNAME/wolkenkruemel.git`)

### 2. In Replit Shell ausführen:
```bash
# GitHub Repository als "origin" hinzufügen
git remote add origin https://github.com/IHRUSERNAME/wolkenkruemel.git

# Code zu GitHub pushen
git push -u origin main
```

**Ersetzen Sie `IHRUSERNAME` mit Ihrem echten GitHub Username!**

### 3. Alternative - Direkte Befehle:
Falls Sie mir Ihren GitHub Username geben, kann ich die exakten Befehle erstellen.

## NACH DER VERBINDUNG:
- `git push origin main` funktioniert
- Code wird zu GitHub übertragen
- Bereit für Vercel Import

---

**Holen Sie sich die GitHub URL und führen Sie die Befehle aus!**