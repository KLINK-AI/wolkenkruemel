# DATABASE_URL finden

## OPTION 1: In Replit Environment Variable

Die DATABASE_URL ist als Umgebungsvariable in Replit verfügbar.

**So finden Sie sie:**
```bash
echo $DATABASE_URL
```

## OPTION 2: Neon Dashboard

**Falls Sie direkten Zugriff wollen:**

1. **Gehen Sie zu console.neon.tech**
2. **Melden Sie sich an** (mit dem Account, den Sie für die Database erstellt haben)
3. **Wählen Sie Ihr Wolkenkrümel-Projekt**
4. **"Connection Details" oder "Connect"**
5. **Kopieren Sie die "Connection String"**

Die URL sieht etwa so aus:
```
postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/database?sslmode=require
```

## OPTION 3: Aus Replit kopieren

**In Vercel verwenden Sie die gleiche URL wie in Replit:**
- Replit kennt bereits Ihre DATABASE_URL
- Wir müssen sie nur für Vercel kopieren

---

**Führen Sie `echo $DATABASE_URL` aus, dann können wir mit Vercel weitermachen.**