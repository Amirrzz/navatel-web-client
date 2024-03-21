<script setup>
const props = defineProps({
  blob: {
    type: String,
    default: '',
    required: false,
  },
  name: {
    type: String,
    default: '',
    required: false,
  },
});
</script>

<template>
  <div class="group-member-chip">
    <div class="avatar">
      <img
        :src="blob"
        alt="image"
        class="image-profile"
        v-if="blob"
        style="border-radius: 50%"
        loading="lazy"
      />
      <span v-else> {{ name.slice(0, 1).toUpperCase() }}</span>
    </div>
    <div class="member-name">
      {{ name }}
    </div>
  </div>
</template>

<style scoped>
.group-member-chip {
  width: auto;
  height: auto;
  border-radius: 40px;
  background: #d9d9d9;
  display: flex;
}

.image-profile{
  width: 35px;
  height: 35px;
}

.avatar {
  border-radius: 50%;
  width: 35px;
  height: 35px;
  background: #4b6ee2;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.member-name {
  display: flex;
  align-items: center;
  padding: 0 5px;
  color: rgba(0, 0, 0, 0.8);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
</style>
