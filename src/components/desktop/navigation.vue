<template>
  <div class="navigation-container">
    <div class="nav-item" @click="navigate('/desktop/message')">
      <ion-icon
        class="icon"
        icon="/Images/tabs/message.svg"
        :class="{ active: Route.path === '/desktop/message' }"
      />
      <span class="name" :class="{ active: Route.path === '/desktop/message' }">
        {{ $t('desktop.tabs.message') }}
      </span>
    </div>
    <div class="nav-item" @click="navigate('/desktop/contacts')">
      <ion-icon
        class="icon"
        icon="/Images/tabs/contacts.svg"
        :class="{ active: Route.path === '/desktop/contacts' }"
      />
      <span
        class="name"
        :class="{ active: Route.path === '/desktop/contacts' }"
      >
        {{ $t('desktop.tabs.contacts') }}
      </span>
    </div>
    <div class="nav-item" @click="nestedModalsDesktop.callPad = true">
      <ion-icon class="icon" icon="/Images/tabs/call-pad.svg" />
      <span class="name">
        {{ $t('desktop.tabs.callpad') }}
      </span>
    </div>
    <div class="nav-item" @click="navigate('/desktop/callhistory')">
      <ion-icon
        class="icon"
        icon="/Images/tabs/history.svg"
        :class="{ active: Route.path === '/desktop/callhistory' }"
      />
      <span
        class="name"
        :class="{ active: Route.path === '/desktop/callhistory' }"
      >
        {{ $t('desktop.tabs.callHistory') }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

const Route = useRoute();
const Router = useRouter();
const nestedModalsDesktop = useNestedModalsDesktop();

const navigate = (path) => {
  Router.push(path);
};
</script>

<style scoped>
.navigation-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(236, 240, 248, 0.3);
}

.nav-item {
  width: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15px 15px;
}

.name {
  font-size: 10px;
  font-weight: 700;
  color: #c0c0c0;
  padding-top: 10px;
  cursor: pointer;
}

.icon {
  font-size: 25px;
  color: #c0c0c0;
  cursor: pointer;
}

.active {
  color: #0066ff;
}
</style>
