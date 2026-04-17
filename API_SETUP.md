# Guide de Configuration des Clés API

## 🚀 Démarrage Rapide

1. **Obtenez vos clés API** (voir ci-dessous)
2. **Modifiez le fichier `.env`** avec vos vraies clés
3. **Redémarrez le serveur** : `npm start`

## 💳 Configuration Stripe

### Étape 1 : Créer un compte Stripe
1. Allez sur https://dashboard.stripe.com/register
2. Créez un compte (utilisez le mode test pour commencer)

### Étape 2 : Obtenir les clés API
1. Dans le dashboard Stripe, allez dans "Developers" > "API keys"
2. Copiez la **Secret key** (commence par `sk_test_`)
3. Copiez la **Publishable key** (commence par `pk_test_`)

### Étape 3 : Configurer dans .env
```env
STRIPE_SECRET_KEY=sk_test_51ABC...XYZ
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...XYZ
```

## 💰 Configuration PayPal

### Étape 1 : Créer un compte PayPal Developer
1. Allez sur https://developer.paypal.com/
2. Connectez-vous avec votre compte PayPal

### Étape 2 : Créer une application
1. Allez dans "My Apps & Credentials"
2. Cliquez sur "Create App"
3. Donnez un nom à votre app
4. Sélectionnez "Merchant" comme type

### Étape 3 : Obtenir les credentials
1. Dans votre app, copiez le **Client ID**
2. Copiez le **Secret**

### Étape 4 : Configurer dans .env
```env
PAYPAL_CLIENT_ID=AZ...XYZ
PAYPAL_CLIENT_SECRET=EP...XYZ
PAYPAL_MODE=sandbox  # ou 'live' pour la production
```

## 🧪 Test des Paiements

### Stripe Test
- Utilisez la carte de test : `4242 4242 4242 4242`
- Date d'expiration : n'importe quelle date future
- CVC : 123

### PayPal Test
- Créez un compte sandbox sur https://developer.paypal.com
- Utilisez les credentials sandbox pour tester

## 🔒 Sécurité

- **NE JAMAIS** commiter les vraies clés dans Git
- Utilisez toujours des clés de test pour le développement
- Passez en mode `live` seulement pour la production

## ❓ Dépannage

Si vous avez des erreurs :
1. Vérifiez que les clés sont correctement copiées
2. Assurez-vous qu'il n'y a pas d'espaces ou de caractères invisibles
3. Redémarrez le serveur après modification du `.env`

## 📞 Support

- **Stripe** : https://support.stripe.com/
- **PayPal** : https://developer.paypal.com/support/

---

Une fois configuré, votre système de paiement sera pleinement fonctionnel ! 🎉