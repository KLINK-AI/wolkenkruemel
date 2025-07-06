# Stripe Integration Setup für Wolkenkrümel

## 1. Stripe Test-Account erstellen
1. Gehen Sie zu https://dashboard.stripe.com/register
2. Erstellen Sie einen kostenlosen Test-Account
3. Wechseln Sie in den "Test Mode" (oben rechts im Dashboard)

## 2. Produkte und Preise erstellen
1. Gehen Sie zu "Products" im Stripe Dashboard
2. Erstellen Sie ein neues Produkt:
   - Name: "Wolkenkrümel Premium"
   - Beschreibung: "Premium Zugang zur Wolkenkrümel Dog Training Platform"

3. Fügen Sie zwei Preise hinzu:
   - **Monatlich**: €2.99 pro Monat, wiederkehrend
   - **Jährlich**: €29.90 pro Jahr, wiederkehrend

## 3. API Keys einrichten
Nach dem Erstellen der Preise:

1. Gehen Sie zu "Developers" > "API keys"
2. Kopieren Sie:
   - **Publishable key** (beginnt mit `pk_test_`) → `VITE_STRIPE_PUBLIC_KEY`
   - **Secret key** (beginnt mit `sk_test_`) → `STRIPE_SECRET_KEY`

3. Gehen Sie zu "Products" und kopieren Sie die Price IDs:
   - Monatlicher Preis → `price_...` (ersetzen Sie in SubscriptionPage.tsx)
   - Jährlicher Preis → `price_...` (ersetzen Sie in SubscriptionPage.tsx)

## 4. Test-Kreditkarten
Stripe bietet Test-Kreditkarten:
- **Erfolgreiche Zahlung**: 4242 4242 4242 4242
- **Datum**: Beliebiges zukünftiges Datum
- **CVC**: Beliebige 3 Ziffern

## 5. Webhooks (Optional)
Für echte Subscription-Updates:
1. Gehen Sie zu "Developers" > "Webhooks"
2. Fügen Sie Endpoint hinzu: `https://your-domain.com/api/stripe-webhook`
3. Wählen Sie Events: `invoice.payment_succeeded`, `customer.subscription.updated`

## Aktueller Demo-Modus
Momentan läuft ein Demo-Modus ohne echte Stripe-Integration. 
Um auf echte Stripe-Tests umzustellen:

1. Setzen Sie die echten Price IDs in `SubscriptionPage.tsx`
2. Das System erkennt automatisch echte vs. Demo Price IDs
3. Nutzen Sie die Test-Kreditkarten für Zahlungen

## Vorteile der echten Stripe-Integration
- Vollständiger Zahlungsflow-Test
- Webhook-Testing
- Subscription-Management
- Echte Stripe-Dashboard-Einblicke