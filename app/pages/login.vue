<script setup lang="ts">

definePageMeta({
  middleware: ['guest']
})

const email = ref("");
const password = ref("");
const errorMsg = ref("");

const supabase = useSupabaseClient();
const user = useSupabaseUser();

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  });
  if (error) alert(error.message);
}



async function signUp() {
  errorMsg.value = "";
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  if (error) errorMsg.value = error.message;
}

async function signIn() {
  errorMsg.value = "";
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) errorMsg.value = error.message;
}

async function signOut() {
  await supabase.auth.signOut();
}
</script>

<template>
  <div style="max-width: 420px; margin: 40px auto">
    <h1>Login</h1>

    <p v-if="user">
      Connecté : <b>{{ user.email }}</b>
    </p>
    <p v-else>Pas connecté</p>

    <div v-if="!user" style="display: grid; gap: 8px">
      <input v-model="email" placeholder="email" >
      <input v-model="password" placeholder="password" type="password" >
      <button @click="signUp">S'inscrire</button>
      <button @click="signIn">Se connecter</button>
      <button @click="signInWithGoogle">Continuer avec Google</button>
      <p v-if="errorMsg" style="color: red">{{ errorMsg }}</p>
    </div>

    <button v-else @click="signOut">Se déconnecter</button>
  </div>
</template>
