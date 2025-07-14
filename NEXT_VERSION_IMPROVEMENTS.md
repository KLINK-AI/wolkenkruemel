# 🔄 Nächste Version - Verbesserungen

## User Feedback vom 14. Juli 2025

### 📝 Community Posts - Kommentar-Zähler fehlt

**Problem identifiziert:**
Bei den Posts auf der Community-Seite wird bei den Kommentaren nicht angezeigt, wie viele Kommentare es auf den jeweiligen Post gibt. Bei den beiden vorhandenen Posts gibt es jeweils Kommentare, aber das kann man erst sehen, wenn man auf "Kommentare" klickt.

**Gewünschte Lösung:**
Es sollte hinter dem Wort "Kommentare" in Klammer die Zahl der Kommentare stehen.

**Beispiel:**
- Aktuell: "Kommentare"
- Gewünscht: "Kommentare (3)" wenn 3 Kommentare vorhanden sind

**Technische Umsetzung:**
- Posts-API muss Kommentar-Anzahl pro Post zurückgeben
- Frontend-Komponente für Community-Posts muss Anzahl anzeigen
- Datei: `client/src/components/CommunityPost.tsx` oder ähnlich

**Priorität:** Hoch - UX-Verbesserung für Community-Engagement

---

## Weitere geplante Verbesserungen

### 🔧 Bekannte Issues
- [ ] Kommentar-Zähler in Community-Posts
- [ ] Performance-Optimierungen für große Datenmengen
- [ ] Mobile UX-Verbesserungen

### 🚀 Feature-Erweiterungen
- [ ] Push-Benachrichtigungen
- [ ] Erweiterte Suchfunktionalität
- [ ] Social-Media-Integration

**Status:** Bereit für Implementierung nach erfolgreichem Deployment