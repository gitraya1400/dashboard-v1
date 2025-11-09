<template>
  <div class="questionnaire-app">
    <LandingPage v-if="currentStep === 0" @start-questionnaire="startQuestionnaire" />

    <div v-else class="questionnaire-form-wrapper">
      <header class="form-header">
        <h2>Langkah {{ currentStep }} dari {{ totalFormSteps }}</h2>
        <p>Isi data pada langkah ini.</p>
      </header>
      
      <div class="form-content">
        <component :is="currentFormStepComponent" />
        
        <div class="navigation-buttons">
          <button v-if="currentStep > 1" @click="prevStep" class="nav-button prev">
            &lt; Kembali
          </button>
          
          <button v-if="currentStep < totalFormSteps" @click="nextStep" class="nav-button next">
            Lanjut &gt;
          </button>
          
          <button v-else @click="submitAnswers" class="nav-button submit">
            Kirim Jawaban
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LandingPage from './LandingPage/LandingPage.vue';
// import Step1Form from './FormSteps/Step1Form.vue'; // Asumsi Anda membuat file ini

export default {
  name: 'TheQuestionnaire',
  components: {
    LandingPage,
    // Step1Form,
    // Daftarkan komponen formulir lainnya di sini: Step2Form, Step3Form, dst.
  },
  data() {
    return {
      currentStep: 0, // 0 = Landing Page, 1+ = Langkah Formulir
      totalFormSteps: 4, 
      formData: {}, // Tempat menyimpan data kuesioner
    };
  },
  computed: {
    // Mengubah nilai currentStep menjadi nama komponen formulir
    currentFormStepComponent() {
      switch (this.currentStep) {
        case 1:
          return 'Step1Form';
        // Tambahkan case lain jika Anda memiliki Step2Form, Step3Form, dll.
        // case 2: return 'Step2Form';
        case 4:
          return 'Step4Review'; // Anggap langkah terakhir adalah tinjauan
        default:
          return null;
      }
    }
  },
  methods: {
    startQuestionnaire() {
      this.currentStep = 1;
    },
    nextStep() {
      if (this.currentStep < this.totalFormSteps) {
        // Lakukan validasi di sini sebelum pindah
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    submitAnswers() {
      console.log('Mengirim data:', this.formData);
      alert('Kuesioner Selesai! Terima kasih telah berpartisipasi.');
      // Lakukan panggilan API untuk menyimpan data di sini
    }
  }
};
</script>

<style scoped>
/* Tambahkan styling dasar yang berlaku untuk seluruh aplikasi kuesioner */
.questionnaire-app {
  font-family: 'Arial', sans-serif;
  color: #333;
}
.form-header {
  text-align: center;
  padding: 20px;
}
/* Styling tombol navigasi */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
.nav-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.nav-button.prev {
  background-color: #eee;
  color: #333;
}
.nav-button.next, .nav-button.submit {
  background-color: #c95111; /* Warna Oranye Khas */
  color: white;
}
</style>