<template>
  <header class="header-section">
    <img class="batik-header" src="../../assets/header-batik.png" alt="Header Batik" />
    
    <div class="text-content">
      <h1 class="welcome-text">Selamat Datang!</h1>
      <h2 class="title-text">Kuesioner CAWI PKL 65</h2>
      <p class="description-text">
        Mari berpartisipasi dalam pengumpulan data sosial ekonomi untuk mendukung riset lapangan PKL 65 Polstat STIS.
      </p>
      <button @click="$emit('start-questionnaire')" class="start-button">
        Mulai Isi Kuesioner
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
  emits: ['start-questionnaire']
};
</script>

<style scoped>
.header-section {
  padding: 20px;
  /* PERBAIKAN UTAMA: Gunakan text-align left untuk meratakan semua konten teks dan tombol inline */
  text-align: left; 
}

/* Opsional: Jika Anda ingin membatasi lebar teks agar tidak terlalu panjang ke kanan di layar besar */
.text-content {
  max-width: 800px; /* Sesuaikan sesuai kebutuhan desain */
  /* margin: 0 auto; */ /* Hapus komentar ini jika ingin blok teksnya ada di tengah, tapi isinya rata kiri */
}

.batik-header {
  width: 100%;
  height: auto;
  margin-bottom: 20px; /* Memberi jarak antara batik dan teks */
}

.welcome-text {
  color: #c95111;
  font-size: 3em;
  margin-bottom: 5px;
  /* Memastikan tidak ada margin otomatis yang mengganggu */
  margin-left: 0; 
}

.title-text {
  color: #333;
  font-size: 4em;
  margin-top: 0;
  margin-left: 0;
}

.description-text {
  font-size: 1.1em;
  color: #555;
  max-width: 600px; /* Opsional: Membuat teks deskripsi tidak terlalu lebar agar mudah dibaca */
  margin-left: 0;
}

.start-button {
  background-color: #c95111;
  color: white;
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 20px;
  /* Pastikan tombol tidak di-tengah-kan oleh margin auto jika ada style global */
  margin-left: 0; 
  display: inline-block; /* Memastikan tombol patuh pada text-align parent-nya */
}
</style>