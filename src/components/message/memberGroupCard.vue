<template>
  <div
    class="member-group-avatar"
    :class="{ 'ios-member-group-avatar': platform === 'ios' }"
  >
    <div class="avatar-container">
      <img
        :src="blob"
        alt="image"
        v-if="blob"
        style="border-radius: 50%; width: 50px; height: 50px"
        loading="lazy"
      />
      <span v-else>{{ name.slice(0, 1).toUpperCase() }}</span>
    </div>
    <div class="info-container">
      <span
        :class="{ 'desktop-style': mode == 'desktop', name: mode == 'mobile' }"
        v-if="name"
      >
        {{ name.slice(0,20) }}
      </span>
      <span class="name" v-else>
        {{ nickname.slice(0,20) }}
      </span>
      <span class="last-seen">
        {{ $t('tabs.message.lastseen') }} {{ lastSeen }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'mobile',
    required: false,
  },
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
  nickname: {
    type: String,
    default: '',
    required: false,
  },
  lastSeen: {
    type: String,
    default: '',
    required: false,
  },
  platform: {
    type: String,
    default: '',
    required: false,
  },
});
</script>

<style scoped>
.desktop-style {
  font-size: 14px;
  font-weight: 700;
}
.member-group-avatar {
  width: 100%;
  display: flex;
  margin: 15px 0;
}
.ios-member-group-avatar {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px 8px;
}
.avatar-container {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #da56fb;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  line-height: normal;
}
.info-container {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}
.name {
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.last-seen {
  color: rgb(155, 148, 148);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
</style>
