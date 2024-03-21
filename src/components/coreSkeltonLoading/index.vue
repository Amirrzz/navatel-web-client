<template>
  <div
    class="core-skelton-loading"
    :style="{
      height: `${height}`,
      width: `${width}`,
      borderRadius: `${borderRadius}`,
    }"
  >
    <div class="line" :style="{ height: `${height}` }"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  height: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '',
  },
  borderRadius: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.core-skelton-loading {
  background: #c9c2c263;
  direction: ltr;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.line {
  /* transform: rotate(220deg); */
  position: absolute;
  z-index: 1;
  box-shadow: 10px 10px 20px 10px #fff;
  animation: 1s skelton infinite;
}

@keyframes skelton {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(400px);
  }
}
</style>
