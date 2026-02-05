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
        Mentions Légales
      </h1>

      <!-- Content Cards -->
      <div class="space-y-6 md:space-y-8">
        <!-- Éditeur -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.1s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            Éditeur du site
          </h2>
          <div class="space-y-2 text-gray-700">
            <p><strong>Nom :</strong> Réenchanter</p>
            <p><strong>Nature :</strong> Plateforme communautaire web</p>
            <p><strong>Adresse :</strong> 4 pl Lucien Tharradin, 25200 Montbéliard</p>
            <p>
              <strong>Email contact :</strong>
              <a
                href="mailto:contact@reenchanter.fr"
                class="transition-all duration-300"
                :style="{ color: '#FF1493' }"
              >
                pierre.gachodpro@gmail.com
              </a>
            </p>
            <p>
              <strong>Directeur de la publication :</strong> Gachod Pierre
            </p>
          </div>
        </div>

        <!-- Hébergement -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.2s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            Hébergement
          </h2>
          <div class="space-y-2 text-gray-700">
            <p><strong>Hébergeur :</strong> Netlify, Inc.</p>
            <p>
              <strong>Adresse :</strong> 2325 3rd Street, Suite 215, San
              Francisco, CA 94107, USA
            </p>
            <p>
              <strong>Site web :</strong>
              <a
                href="https://www.netlify.com"
                target="_blank"
                rel="noopener noreferrer"
                class="transition-all duration-300"
                :style="{ color: '#FF1493' }"
              >
                www.netlify.com
              </a>
            </p>
          </div>
        </div>

        <!-- Base de données -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.3s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            Services tiers
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <p class="font-semibold mb-2">
                Backend et authentification : Supabase
              </p>
              <p class="text-sm">
                Supabase fournit la base de données PostgreSQL et le service
                d'authentification. Découvrez leur politique de confidentialité
                sur
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="transition-all duration-300"
                  :style="{ color: '#FF1493' }"
                >
                  supabase.com/privacy
                </a>
              </p>
            </div>
            <div>
              <p class="font-semibold mb-2">
                Authentification tiers : Google OAuth
              </p>
              <p class="text-sm">
                L'authentification Google est optionnelle. Consultez la
                politique Google sur
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="transition-all duration-300"
                  :style="{ color: '#FF1493' }"
                >
                  policies.google.com/privacy
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Propriété intellectuelle -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.4s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            Propriété intellectuelle
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Tous les éléments du site Réenchanter (textes, images, logos,
              design) sont la propriété exclusive de Réenchanter ou de ses
              partenaires, et sont protégés par les lois sur la propriété
              intellectuelle.
            </p>
            <p>
              Toute reproduction, distribution ou utilisation non autorisée est
              strictement interdite.
            </p>
          </div>
        </div>

        <!-- Responsabilité -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.5s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            Limitation de responsabilité
          </h2>
          <div class="space-y-3 text-gray-700">
            <p>
              Réenchanter s'efforce de maintenir ce site dans les meilleures
              conditions possible. Cependant, nous déclinons toute
              responsabilité concernant :
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>Les interruptions temporaires du service</li>
              <li>
                Les pertes de données ou les dysfonctionnements techniques
              </li>
              <li>Les contenus générés par les utilisateurs</li>
              <li>Les services tiers intégrés au site</li>
            </ul>
          </div>
        </div>

        <!-- Modifications -->
        <div
          class="border-2 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-fade-in-up"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '--delay': '0.6s',
          }"
        >
          <h2 class="text-2xl font-black mb-4" :style="{ color: '#FF1493' }">
            Modifications
          </h2>
          <p class="text-gray-700">
            Réenchanter se réserve le droit de modifier ces mentions légales à
            tout moment sans préavis. Les modifications entrent en vigueur dès
            leur publication sur le site.
          </p>
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
