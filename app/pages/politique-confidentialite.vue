<script setup lang="ts">
// No special middleware needed for legal pages
</script>

<template>
  <div
    class="min-h-screen w-full"
    :style="{
      backgroundImage:
        'linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    }"
  >
    <!-- Container -->
    <div
      class="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20"
    >
      <!-- Title -->
      <h1
        class="pt-12 text-4xl md:text-5xl font-black mb-8 animate-fade-in-up"
        :style="{ color: '#FF1493' }"
      >
        Politique de Confidentialité
      </h1>

      <!-- Introduction -->
      <div
        class="border-2 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 backdrop-blur-sm animate-fade-in-up"
        :style="{
          borderColor: '#FF69B4',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '--delay': '0.05s',
        }"
      >
        <p class="text-gray-700">
          Chez Réenchanter, nous accordons une grande importance à la protection
          de votre vie privée. Cette politique de confidentialité explique
          comment nous collectons, utilisons et protégeons vos données
          personnelles.
        </p>
      </div>

      <!-- Content Cards -->
      <div class="space-y-6 md:space-y-8">
        <!-- Données collectées -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.1s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            1. Données collectées
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <p class="font-semibold mb-2">Authentification</p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Email</strong> - Utilisé pour la connexion et les
                  communications
                </li>
                <li>
                  <strong>Mot de passe</strong> - Hashé et stocké de façon
                  sécurisée (Supabase)
                </li>
                <li>
                  <strong>ID Google</strong> - Si vous choisissez
                  l'authentification Google (optionnel)
                </li>
              </ul>
            </div>

            <div>
              <p class="font-semibold mb-2">Profil utilisateur</p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Pseudo</strong> - Pour identifier publiquement votre
                  profil
                </li>
                <li>
                  <strong>Avatar</strong> - Image de profil (optionnel, stockée
                  dans Supabase Storage)
                </li>
                <li>
                  <strong>Bio</strong> - Description personnelle (optionnel)
                </li>
                <li>
                  <strong>Points totaux</strong> - Accumulation de vos bonnes
                  actions
                </li>
              </ul>
            </div>

            <div>
              <p class="font-semibold mb-2">Bonnes actions et preuves</p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Détails soumis</strong> - Descriptions de vos bonnes
                  actions
                </li>
                <li><strong>Pays</strong> - Localisation de vos actions</li>
                <li>
                  <strong>Images/preuves</strong> - Photos ou captures (stockées
                  dans Supabase Storage)
                </li>
                <li>
                  <strong>Dates</strong> - Quand vous avez effectué ou soumis
                  une action
                </li>
              </ul>
            </div>

            <div>
              <p class="font-semibold mb-2">Données techniques</p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Adresse IP</strong> - Collectée automatiquement par
                  Supabase
                </li>
                <li>
                  <strong>Logs de connexion</strong> - Pour la sécurité et le
                  support
                </li>
                <li>
                  <strong>Données de navigateur</strong> - Informations
                  d'utilisation du site
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Utilisation des données -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.2s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            2. Utilisation de vos données
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>Nous utilisons vos données pour :</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Fournir et améliorer nos services</li>
              <li>Vérifier et valider vos bonnes actions</li>
              <li>Maintenir les classements et les statistiques</li>
              <li>
                Vous envoyer des notifications et mises à jour (si autorisé)
              </li>
              <li>Prévenir les fraudes et abus</li>
              <li>Respecter les obligations légales</li>
            </ul>
          </div>
        </div>

        <!-- Partage des données -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.3s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            3. Partage des données
          </h2>
          <div class="space-y-4 text-gray-700">
            <p>
              <strong>Données publiques :</strong> Votre pseudo, points, et
              bonnes actions validées sont visibles publiquement sur la galerie
              et le classement.
            </p>
            <p>
              <strong>Données privées :</strong> Votre email, mot de passe et
              images ne sont jamais partagées avec des tiers, sauf si requis par
              la loi.
            </p>
            <p>
              <strong>Services tiers :</strong>
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li>
                <strong>Supabase</strong> - Héberge vos données (
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  :style="{ color: '#FF1493' }"
                  class="underline"
                >
                  voir leur politique
                </a>
                )
              </li>
              <li>
                <strong>Google</strong> - Si vous utilisez Google OAuth (
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  :style="{ color: '#FF1493' }"
                  class="underline"
                >
                  voir leur politique
                </a>
                )
              </li>
              <li><strong>Netlify</strong> - Héberge le site web</li>
            </ul>
          </div>
        </div>

        <!-- Sécurité -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.4s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            4. Sécurité de vos données
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Nous employons des mesures de sécurité standard pour protéger vos
              données personnelles :
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Mots de passe hashés avec algorithmes modernes (Supabase)</li>
              <li>Accès limité aux données sensibles</li>
              <li>Sauvegardes régulières</li>
            </ul>
            <p class="text-sm mt-4">
              Cependant, aucune transmission sur Internet n'est 100% sécurisée.
              Nous ne pouvons garantir une sécurité absolue.
            </p>
          </div>
        </div>

        <!-- Cookies -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.5s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            5. Cookies et suivi
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Nous utilisons des cookies pour maintenir votre session de
              connexion et améliorer votre expérience. Ces cookies sont :
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>Session</strong> - Pour vous maintenir connecté</li>
              <li>
                <strong>Préférences</strong> - Pour mémoriser vos paramètres
              </li>
              <li>
                <strong>Locaux</strong> - Comme le flag
                "hasSeenInstructionModal" pour les expériences utilisateur
              </li>
            </ul>
            <p class="text-sm mt-4">
              Vous pouvez désactiver les cookies dans vos paramètres de
              navigateur, mais cela peut affecter la fonctionnalité du site.
            </p>
          </div>
        </div>

        <!-- Vos droits -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.6s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            6. Vos droits (RGPD)
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>Vous avez le droit de :</p>
            <ul class="list-disc list-inside space-y-1">
              <li>
                <strong>Accès</strong> - Consulter vos données personnelles
              </li>
              <li>
                <strong>Rectification</strong> - Corriger vos informations
              </li>
              <li>
                <strong>Suppression</strong> - Demander la suppression de vos
                données
              </li>
              <li><strong>Portabilité</strong> - Exporter vos données</li>
              <li>
                <strong>Opposition</strong> - Vous opposer à certains
                traitements
              </li>
            </ul>
            <p class="text-sm mt-4">
              Pour exercer ces droits, contactez-nous à
              <a
                href="mailto:contact@reenchanter.fr"
                :style="{ color: '#FF1493' }"
                class="underline"
              >
                contact@reenchanter.fr
              </a>
            </p>
          </div>
        </div>

        <!-- Rétention -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.7s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            7. Rétention des données
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Nous conservons vos données tant que votre compte est actif. Si
              vous supprimez votre compte :
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li>
                Vos données personnelles sont supprimées (email, mot de passe,
                bio)
              </li>
              <li>
                Vos bonnes actions validées restent visibles publiquement
                (anonymisées si possible)
              </li>
              <li>
                Les logs de sécurité peuvent être conservés temporairement
              </li>
            </ul>
          </div>
        </div>

        <!-- Modifications -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.8s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            8. Contact & Modifications
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Pour toute question concernant cette politique ou vos données,
              contactez-nous à :
            </p>
            <p>
              <strong>Email :</strong>
              <a
                href="mailto:contact@reenchanter.fr"
                :style="{ color: '#FF1493' }"
                class="underline"
              >
                contact@reenchanter.fr
              </a>
            </p>
            <p class="text-sm mt-4">
              Cette politique peut être mise à jour à tout moment. Les
              modifications sont communiquées par email ou notification sur le
              site.
            </p>
          </div>
        </div>
      </div>

      <!-- Last update -->
      <div class="mt-12 text-center text-sm text-gray-500">
        <p>Dernière mise à jour : 5 février 2026</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: var(--delay, 0s);
  opacity: 0;
}
</style>
