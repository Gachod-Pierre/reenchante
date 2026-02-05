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
        Conditions d'Utilisation
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
          Bienvenue sur Réenchanter ! En accédant et en utilisant ce site, vous
          acceptez de vous conformer à ces conditions d'utilisation. Si vous
          n'acceptez pas ces conditions, veuillez ne pas utiliser le site.
        </p>
      </div>

      <!-- Content Cards -->
      <div class="space-y-6 md:space-y-8">
        <!-- Accès et inscription -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.1s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            1. Accès et inscription
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              <strong>Utilisation gratuite :</strong> Réenchanter est gratuit et
              accessible à tous les utilisateurs de 13 ans ou plus.
            </p>
            <p>
              <strong>Authentification :</strong> Vous pouvez vous inscrire avec
              :
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li>Email et mot de passe (que vous créez)</li>
              <li>Compte Google (authentification tierce)</li>
            </ul>
            <p>
              <strong>Responsabilité du compte :</strong> Vous êtes responsable
              de la confidentialité de vos identifiants. Toute activité sous
              votre compte vous incombe.
            </p>
          </div>
        </div>

        <!-- Comportement attendu -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.2s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            2. Comportement attendu
          </h2>
          <div class="space-y-4 text-gray-700">
            <p><strong>Authenticité :</strong> Vous acceptez de :</p>
            <ul class="list-disc list-inside space-y-1 mb-4">
              <li>Ne soumettre que des bonnes actions réellement effectuées</li>
              <li>Fournir des preuves authentiques (vraies photos/captures)</li>
              <li>Utiliser votre vrai pseudo et identité</li>
            </ul>

            <p><strong>Comportement interdit :</strong> Vous ne devez pas :</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Soumettre du contenu frauduleux ou falsifié</li>
              <li>Harceler, insulter ou menacer d'autres utilisateurs</li>
              <li>Spammer ou partager du contenu offensant</li>
              <li>Utiliser plusieurs comptes pour tricher</li>
              <li>Contourner les systèmes de sécurité</li>
              <li>Soumettre du contenu illégal ou violent</li>
            </ul>
          </div>
        </div>

        <!-- Validation et points -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.3s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            3. Validation et attribution de points
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              <strong>Processus :</strong> Les bonnes actions sont validées
              automatiquement ou manuellement par notre équipe.
            </p>
            <p>
              <strong>Critères :</strong> Votre soumission doit être authentique
              et conforme aux critères de la bonne action sélectionnée.
            </p>
            <p>
              <strong>Points :</strong> Les points ne peuvent pas être
              transférés, échangés en monnaie réelle, ou utilisés hors de la
              plateforme.
            </p>
            <p>
              <strong>Révocation :</strong> Nous nous réservons le droit de
              révoquer les points et de bloquer des comptes en cas de fraude
              détectée.
            </p>
          </div>
        </div>

        <!-- Contenu utilisateur -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.4s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            4. Contenu utilisateur
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              <strong>Droits sur vos images :</strong> En soumettant une image
              comme preuve, vous nous accordez le droit de l'afficher
              publiquement sur le site et dans la galerie.
            </p>
            <p>
              <strong>Propriété :</strong> Vous conservez tous les droits
              d'auteur sur votre contenu. Nous ne le revendiquons pas.
            </p>
            <p>
              <strong>Suppression :</strong> Vous pouvez demander la suppression
              de vos données et images à contact@reenchanter.fr
            </p>
          </div>
        </div>

        <!-- Limitation de responsabilité -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.5s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            5. Limitation de responsabilité
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Réenchanter fournit le service "en l'état". Nous déclinons toute
              responsabilité pour :
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li>Les interruptions ou erreurs techniques du site</li>
              <li>La perte de données ou d'images</li>
              <li>Les dommages causés par des virus ou accès non autorisé</li>
              <li>Les comportements ou contenus d'autres utilisateurs</li>
              <li>Les préjudices indirects liés à l'utilisation du site</li>
            </ul>
          </div>
        </div>

        <!-- Modération et sanctions -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.6s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            6. Modération et sanctions
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              <strong>Modération :</strong> Notre équipe modère le contenu pour
              assurer un environnement sain et authentique.
            </p>
            <p>
              <strong>Violations :</strong> En cas de violation de ces
              conditions, nous pouvons :
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li>Rejeter votre soumission</li>
              <li>Supprimer votre contenu</li>
              <li>Révoquer vos points</li>
              <li>Suspendre temporairement votre compte</li>
              <li>Bannir définitivement votre compte</li>
            </ul>
          </div>
        </div>

        <!-- Services tiers -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.7s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            7. Services tiers
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Réenchanter utilise des services tiers pour fonctionner. Nous ne
              sommes pas responsables de :
            </p>
            <ul class="list-disc list-inside space-y-1 mb-3">
              <li>Les interruptions de Supabase, Google OAuth, ou Netlify</li>
              <li>Les modifications apportées par ces services</li>
              <li>Leurs politiques de confidentialité ou conditions</li>
            </ul>
            <p>
              Consultez directement leurs conditions d'utilisation pour plus
              d'informations.
            </p>
          </div>
        </div>

        <!-- Droits intellectuels -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.8s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            8. Propriété intellectuelle
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Tous les éléments du site Réenchanter (design, code, logos,
              textes) sont protégés par les lois sur la propriété
              intellectuelle.
            </p>
            <p>
              Vous n'avez pas le droit de reproduire, modifier, ou distribuer le
              contenu sans autorisation écrite.
            </p>
            <p class="text-sm">
              Exception : Vous pouvez partager des liens vers le site ou des
              bonnes actions spécifiques.
            </p>
          </div>
        </div>

        <!-- Modifications -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.9s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            9. Modifications des conditions
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Réenchanter se réserve le droit de modifier ces conditions à tout
              moment. Les modifications entrent en vigueur dès leur publication.
            </p>
            <p>
              Votre utilisation continue du site après les modifications
              signifie que vous acceptez les nouvelles conditions.
            </p>
          </div>
        </div>

        <!-- Contact -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '1s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            10. Contact & Support
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Pour toute question, réclamation, ou signalement de violation,
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
