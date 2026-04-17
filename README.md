# Anber Backend - Système de Paiement

Ce backend fournit des intégrations de paiement réelles pour Stripe et PayPal.

## Installation

1. Naviguez vers le dossier backend :
   ```bash
   cd backend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Copiez `.env` et remplissez les clés API

## Configuration des Clés API

### Stripe
1. Créez un compte sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtenez vos clés dans "Developers > API keys"
3. Remplissez dans `.env` :
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### PayPal
1. Créez un compte sur [PayPal Developer](https://developer.paypal.com)
2. Créez une app dans "My Apps & Credentials"
3. Remplissez dans `.env` :
   ```
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox  # ou 'live' pour la production
   ```

## Démarrage

```bash
npm start
# ou pour le développement :
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## API Endpoints

### POST /api/create-stripe-session
Crée une session Stripe Checkout.

**Body :**
```json
{
  "cartItems": [
    {
      "id": 1,
      "size": "50ml",
      "quantity": 2
    }
  ]
}
```

### POST /api/create-paypal-payment
Crée un paiement PayPal.

**Body :** Même format que Stripe.

### POST /api/execute-paypal-payment
Exécute un paiement PayPal approuvé.

**Body :**
```json
{
  "paymentId": "PAY-...",
  "payerId": "PAYER-..."
}
```

## Test

1. Démarrez le backend
2. Ouvrez le frontend dans un navigateur
3. Ajoutez des produits au panier
4. Cliquez sur "Payer avec Stripe" ou "Payer avec PayPal"

## Production

Pour la production :
- Changez `PAYPAL_MODE=live`
- Utilisez des clés de production Stripe
- Configurez `FRONTEND_URL` avec votre domaine réel
- Déployez le backend sur un serveur (Heroku, Vercel, etc.)

## Sécurité

- Ne commitez jamais les vraies clés API dans Git
- Utilisez HTTPS en production
- Validez les données côté serveur
- Implémentez une vérification des webhooks Stripe pour confirmer les paiements