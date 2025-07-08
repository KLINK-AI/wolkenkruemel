# Stripe Deployment Guide für Wolkenkrümel Beta Test

## 1. Stripe Dashboard Setup

### Schritt 1: Stripe Account aktivieren
1. Gehe zu https://dashboard.stripe.com
2. Aktiviere deinen Account für Live-Payments (falls noch nicht geschehen)
3. Wechsle zwischen "Test-Modus" und "Live-Modus" über den Toggle oben rechts

### Schritt 2: Produkte erstellen
1. Gehe zu **Products** > **Create Product**
2. **Monatliches Premium:**
   - Name: "Wolkenkrümel Premium Monatlich"
   - Beschreibung: "Vollzugriff auf alle Premium-Features"
   - Pricing: €2.99 monatlich, wiederkehrend
   - Währung: EUR
   - Billing period: Monthly
3. **Jährliches Premium:**
   - Name: "Wolkenkrümel Premium Jährlich" 
   - Beschreibung: "Vollzugriff auf alle Premium-Features - Spare 20%"
   - Pricing: €29.99 jährlich, wiederkehrend
   - Währung: EUR
   - Billing period: Yearly

### Schritt 3: API Keys kopieren
Nach dem Erstellen der Produkte:
1. **Publishable Key** (für VITE_STRIPE_PUBLIC_KEY):
   - Developers > API Keys > Publishable key
   - Beginnt mit `pk_live_` (Live) oder `pk_test_` (Test)
2. **Secret Key** (für STRIPE_SECRET_KEY):
   - Developers > API Keys > Secret key  
   - Beginnt mit `sk_live_` (Live) oder `sk_test_` (Test)
3. **Price IDs** notieren:
   - Gehe zu Products > dein Produkt > Price ID kopieren
   - Beginnt mit `price_`
   - Diese brauchst du für STRIPE_PRICE_ID_MONTHLY und STRIPE_PRICE_ID_YEARLY

## 2. Environment Variables für Deployment

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxx oder sk_test_xxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx oder pk_test_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx

# Database
DATABASE_URL=deine_production_database_url
```

## 3. Stripe Webhook Setup (nach Deployment)

### Schritt 1: Webhook Endpoint hinzufügen
1. Developers > Webhooks > Add endpoint
2. **Endpoint URL**: `https://deine-app.replit.app/api/webhook`
3. **Listen to**: Events on your account
4. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Schritt 2: Webhook Secret
1. Nach dem Erstellen des Webhooks, kopiere den "Signing secret"
2. Füge hinzu: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

## 4. Beta Test Strategie

### Test-Modus für Beta (Empfohlen)
- Verwende Stripe Test-Keys für die Beta-Phase
- Nutzer können mit Test-Kreditkarten "bezahlen" ohne echtes Geld
- Test-Kreditkarte: `4242 4242 4242 4242` (Visa)
- Beliebiges Ablaufdatum in der Zukunft
- Beliebige CVV (z.B. 123)

### Live-Modus für echte Beta-Tester
- Nur wenn du echte Zahlungen während der Beta akzeptieren möchtest
- Stelle sicher, dass alle Features vollständig getestet sind
- Implementiere Rückerstattungslogik für Beta-Probleme

## 5. Subscription Features in der App

Die App unterstützt bereits:
- ✅ Automatische Stripe Customer-Erstellung
- ✅ Subscription-Management
- ✅ Feature-Gating basierend auf Subscription-Status
- ✅ Premium vs. Free Tier Unterscheidung
- ✅ Checkout-Flow für Upgrades

## 6. Monitoring & Analytics

### Stripe Dashboard
- Überwache Subscriptions unter "Subscriptions"
- Verfolge Revenue unter "Payments"
- Analysiere Customer Churn unter "Analytics"

### Wichtige Metriken für Beta
- Conversion Rate (Free → Premium)
- Churn Rate nach der ersten Woche
- Feature-Nutzung von Premium-Usern
- Support-Anfragen zu Billing

## 7. Rechtliche Überlegungen

### Vor Go-Live benötigt:
- [ ] AGB für Subscription-Service
- [ ] Datenschutzerklärung für Stripe-Integration  
- [ ] Impressum mit Billing-Informationen
- [ ] Widerrufsrecht (EU-Recht)
- [ ] Steuerliche Registrierung für digitale Services

## Nächste Schritte für Deployment

1. **Jetzt**: Stripe Produkte erstellen und Keys kopieren
2. **Nach Deployment**: Webhook konfigurieren
3. **Beta Start**: Mit Test-Modus beginnen
4. **Nach erfolgreichem Beta**: Auf Live-Modus wechseln

Soll ich dir beim Setup der Stripe-Produkte helfen oder hast du Fragen zu bestimmten Schritten?