<template>
  <section class="how-to-fill">
    <h3>Cara Mengisi Kuesioner</h3>
    <p>Ikuti langkah-langkah berikut untuk mengisi kuesioner dengan mudah</p>
    <div class="steps-indicator">
      <div v-for="step in steps" :key="step.id" class="step-item">
        <span class="step-number">{{ step.id }}</span>
        <p class="step-description">{{ step.description }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HowToFill',
  data() {
    return {
      steps: [
        { id: 1, description: 'Klik Tombol Mulai Isi Kuesioner di halaman utama.' },
        { id: 2, description: 'Isi Formulir: Lengkapi semua pertanyaan yang ada pada formulir.' },
        { id: 3, description: 'Periksa Kembali: Pastikan semua data yang diisi sudah benar dan lengkap.' },
        { id: 4, description: 'Kirim Jawaban: Klik tombol Kirim Jawaban untuk menyimpan data Anda.' },
      ],
    };
  }
};
</script>

<style scoped>
.how-to-fill {
  background-color: #333;
  color: white;
  padding: 40px 20px;
}
.how-to-fill h3 {
  font-size: 1.8em;
  margin-bottom: 5px;
}
.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap; /* Agar responsif */
}
.step-item {
  width: 150px;
}
.step-number {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #c95111;
  color: white;
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 10px;
}
.step-description {
  font-size: 0.9em;
  color: #ccc;
}
</style>