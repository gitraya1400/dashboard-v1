<template>
  <div class="landing-page-desktop">
    <div class="landing-page-5">
      <div class="container-20">
        <div class="icon-2" />
      </div>

      <div class="overlap">
        <img
          class="clip-path-group-2"
          alt="Clip path group"
          :src="clipPathGroup"
        />

        <img
          class="clip-path-group-3"
          alt="Clip path group"
          :src="image"
        />

        <img
          class="clip-path-group-4"
          alt="Clip path group"
          :src="clipPathGroup2"
        />

        <img
          class="clip-path-group-5"
          alt="Clip path group"
          :src="clipPathGroup3"
        />
      </div>

      <ContainerSubsection />
      <ContainerWrapperSubsection />
      <FooterSubsection />
      <FrameSubsection />
      <DivWrapperSubsection />
    </div>
  </div>
</template>

<script>
import ContainerSubsection from './ContainerSubsection.vue';
import ContainerWrapperSubsection from './ContainerWrapperSubsection.vue';
import DivWrapperSubsection from './DivWrapperSubsection.vue';
import FooterSubsection from './FooterSubsection.vue';
import FrameSubsection from './FrameSubsection.vue';
import clipPathGroup2 from './clip-path-group-2.png';
import clipPathGroup3 from './clip-path-group-3.png';
import clipPathGroup from './clip-path-group.png';
import image from './image.png';

export default {
  name: 'LandingPageDesktop',
  components: {
    ContainerSubsection,
    ContainerWrapperSubsection,
    DivWrapperSubsection,
    FooterSubsection,
    FrameSubsection,
  },
  data() {
    return {
      clipPathGroup2,
      clipPathGroup3,
      clipPathGroup,
      image,
    };
  },
};
</script>

<style>
.landing-page-desktop {
  align-items: flex-start;
  background-color: #faf3e9;
  display: flex;
  flex-direction: column;
  position: relative;
}

.landing-page-desktop .landing-page-5 {
  align-self: stretch;
  background-color: #fffbdf;
  height: 2776px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.landing-page-desktop .container-20 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  height: 2981px;
  left: 0;
  opacity: 0.2;
  position: absolute;
  top: 0;
  width: 1440px;
}

.landing-page-desktop .icon-2 {
  align-self: stretch;
  background-image: url(./vector.svg);
  background-size: 100% 100%;
  height: 896px;
  margin-left: -4475.00px;
  margin-top: -27.00px;
  position: relative;
  width: 100%;
}

.landing-page-desktop .overlap {
  height: 2776px;
  left: 0;
  position: absolute;
  top: 0;
  width: 1440px;
}

.landing-page-desktop .clip-path-group-2 {
  aspect-ratio: 1.72;
  height: 638px;
  left: 0;
  position: absolute;
  top: 0;
  width: 1440px;
}

.landing-page-desktop .clip-path-group-3 {
  aspect-ratio: 1.72;
  height: 840px;
  left: 0;
  position: absolute;
  top: 595px;
  width: 1440px;
}

.landing-page-desktop .clip-path-group-4 {
  aspect-ratio: 1.72;
  height: 840px;
  left: 0;
  position: absolute;
  top: 1386px;
  width: 1440px;
}

.landing-page-desktop .clip-path-group-5 {
  aspect-ratio: 1.72;
  height: 596px;
  left: 0;
  position: absolute;
  top: 2180px;
  width: 1440px;
}
</style>