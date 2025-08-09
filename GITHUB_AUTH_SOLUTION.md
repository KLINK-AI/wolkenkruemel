# GitHub Authentifizierung lösen

## PROBLEM:
Permission denied - GitHub benötigt Authentifizierung

## EINFACHSTE LÖSUNG: GitHub CLI

### 1. GitHub CLI installieren und authentifizieren:
```bash
# GitHub CLI verwenden (bereits in Replit verfügbar)
gh auth login

# Folgen Sie den Anweisungen:
# - Wählen Sie "GitHub.com"
# - Wählen Sie "HTTPS"
# - Wählen Sie "Login with a web browser"
# - Folgen Sie dem Link und autorisieren
```

### 2. Nach der Authentifizierung:
```bash
git push -u origin main
```

## ALTERNATIVE: Personal Access Token

Falls gh auth nicht funktioniert:

### 1. GitHub Personal Access Token erstellen:
- GitHub.com → Settings → Developer settings → Personal access tokens
- "Generate new token (classic)"
- Scopes: `repo` (full control)
- Token kopieren

### 2. Git-URL mit Token:
```bash
git remote set-url origin https://IHRUSERNAME:IHPERSONALTOKEN@github.com/KLINK-AI/wolkenkruemel.git
git push -u origin main
```

## SCHNELLSTE LÖSUNG: Zip-Upload

### Falls Git-Probleme weiter bestehen:
1. Code als ZIP exportieren
2. GitHub → Repository → "Upload files"
3. ZIP hochladen und committen
4. Direkt zu Vercel

---

**Versuchen Sie zuerst: `gh auth login`**