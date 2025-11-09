<template>
  <div id="app">
    <TheQuestionnaire /> 
  </div>
</template>

<script>
// Koreksi 1 & 2: Tambahkan path relatif (./components/) dan koreksi ejaan (Questionnaire)
import TheQuestionnaire from './components/Kuisioner.vue'; 

export default {
  name: 'App',
  components: {
    // Koreksi 3: Pastikan nama komponen di sini (TheQuestionnaire) sama dengan nama impor (baris 6)
    TheQuestionnaire, 
  },
};
</script>

<style>
/* * Gaya Global (Opsional): 
 * Di sini Anda bisa menaruh CSS yang berlaku untuk seluruh halaman, 
 * seperti reset CSS, definisi font, dan warna dasar.
 */
#app {
  /* Pastikan elemen akar memiliki lebar penuh */
  min-height: 100vh; 
  /* Terapkan font default untuk seluruh aplikasi */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}
</style>