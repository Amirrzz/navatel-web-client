<template>
  <div class="numbers-pad">
    <button
      @click="setNumber('1')"
      class="number ion-activatable ripple-parent rounded-rectangle ion-justify-content-start padding-top-10"
    >
      <span class="num" style="padding-top: 10px">1</span>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('2')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">2</div>
      <div>ABC</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('3')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">3</div>
      <div>DEF</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('4')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">4</div>
      <div>GHI</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('5')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">5</div>
      <div>JKL</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('6')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">6</div>
      <div>MNO</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('7')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">7</div>
      <div>PQRS</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('8')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">8</div>
      <div>TUV</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('9')"
      class="number ion-activatable ripple-parent rounded-rectangle"
    >
      <div class="num">9</div>
      <div>WXYZ</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('*')"
      class="number ion-activatable ripple-parent rounded-rectangle ion-justify-content-center"
    >
      <div>*</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('0')"
      class="number ion-activatable ripple-parent rounded-rectangle ion-justify-content-center padding-top-0"
    >
      <div class="num">0</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
    <button
      @click="setNumber('#')"
      class="number ion-activatable ripple-parent rounded-rectangle ion-justify-content-center padding-top-0"
    >
      <div class="num">#</div>
      <ion-ripple-effect></ion-ripple-effect>
    </button>
  </div>
</template>
<script setup>
import { defineProps, defineEmits, watch } from 'vue';
import { IonRippleEffect } from '@ionic/vue';
import { ref } from 'vue';

const props = defineProps({
  numbers: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['update:numbers']);
const phoneNumber = ref('');
const setNumber = (num) => {
  // if(phoneNumber.value.length >= 12) return;
  phoneNumber.value = phoneNumber.value + num;
  emit('update:numbers', phoneNumber.value);
};
watch(
  props,
  (val) => {
    if (val.numbers != phoneNumber.value) {
      phoneNumber.value = val.numbers;
    }
  },
  {
    immediate: true,
  },
);
</script>
<style scoped>
.num {
  font-size: 22px;
  font-weight: 600;
}
.numbers-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(20px - 0.5vw);
  margin: 0 auto;
  padding: calc(20px - 0.5vw);
  padding-top: calc(10px - 0.5vw);
  max-width: 430px;
}
.number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  background-color: #d9d9d99a;
  font-size: 12px;
  color: #333;
  border-radius: 20px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  font-weight: 700;
}
.md .number {
  border-radius: 10px;
}
.padding-top-0 {
  padding-top: 0;
}
.padding-top-10 {
  padding-top: 13px;
}

.number:hover {
  background-color: #f0f0f0;
}

.number:active {
  transform: scale(0.95);
}
</style>
