<template>
  <div class="landing-page-container">
    <TheHeader @start-questionnaire="$emit('start-questionnaire')" />
    
    <div class="image-stack">
      <img class="warna-bg" src="../../assets/gambar-warna.png" alt="Gambar Warna" />
      <img class="candi-image" src="../../assets/candi.png" alt="Gambar Candi Prambanan" />
    </div>

    <HowToFill />
  </div>
</template>

<script>
import TheHeader from './TheHeader.vue';
import HowToFill from './HowToFill.vue';

export default {
  name: 'LandingPage',
  components: {
    TheHeader,
    HowToFill
  },
  emits: ['start-questionnaire']
};
</script>

<style scoped>
.landing-page-container {
  text-align: center;
}

/* Container untuk menumpuk gambar */
.image-stack {
  position: relative;
  width: 100%;
  max-width: 800px; /* Sesuaikan dengan kebutuhan layout Anda */
  margin: 20px auto;
  display: flex;           /* Membantu menengahkan konten jika perlu */
  justify-content: center;
  align-items: center;
}

/* Gambar latar belakang */
.warna-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;    /* Atau 'auto' tergantung proporsi gambar Anda */
  object-fit: cover; /* Agar gambar memenuhi area tanpa terdistorsi */
  z-index: 0;      /* Pastikan layer-nya di bawah */
}

/* Gambar utama (Candi) */
.candi-image {
  position: relative;
  z-index: 1;      /* Pastikan layer-nya di atas warna-bg */
  width: 100%;     /* Agar responsif */
  height: auto;
  display: block;
}
</style>