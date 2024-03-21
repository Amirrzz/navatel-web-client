<template>
  <div class="media-tabs-container">
    <div class="tabs-container">
      <div
        class="tab-group"
        :class="{ activetab: activeTab === 'group' }"
        @click="setTab('group')"
      >
        {{ $t('tabs.contacts.mediatabs.group') }}
      </div>
      <div
        class="tab-music"
        :class="{ activetab: activeTab === 'music' }"
        @click="setTab('music')"
      >
        {{ $t('tabs.contacts.mediatabs.music') }}
      </div>
      <div
        class="tab-file"
        :class="{ activetab: activeTab === 'file' }"
        @click="setTab('file')"
      >
        {{ $t('tabs.contacts.mediatabs.file') }}
      </div>
      <div
        class="tab-media"
        :class="{ activetab: activeTab === 'media' }"
        @click="setTab('media')"
      >
        {{ $t('tabs.contacts.mediatabs.media') }}
      </div>
    </div>

    <div class="actived-tab-deatail">
      <div class="active-tab-animation" v-if="activeTab === 'media'">
        <h1>media loaded...</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio minus
        doloribus ...
      </div>
      <div class="active-tab-animation" v-if="activeTab === 'file'">
        <h1>file loaded...</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio minus
        doloribus...
      </div>
      <div class="active-tab-animation" v-if="activeTab === 'music'">
        <h1>music loaded...</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio minus
        doloribus ....
      </div>
      <div class="active-tab-animation" v-if="activeTab === 'group'">
        <h1>group loaded...</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio minus
        doloribus accusamus sit aut ....
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('media');

const setTab = (param) => {
  activeTab.value = param;
};
</script>

<style scoped>
.media-tabs-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.media-tabs-container .tabs-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #b9b8b8;
  height: 65px;
}

.tabs-container .tab {
  padding: 0px 20px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.activetab {
  color: #0066ff;
  border-bottom: 3px solid #0066ff;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.actived-tab-deatail {
  width: 100%;
  display: flex;
  position: relative;
}

.active-tab-animation {
  padding: 10px 10px;
  position: absolute;
  z-index: 1;
  animation: 0.3s animation;
}

.tab-media {
  margin: 0px 15px;
  width: 60px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.tab-file {
  margin: 0px 15px;
  width: 45px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.tab-music {
  margin: 0px 15px;
  width: 70px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.tab-group {
  margin: 0px 15px;
  width: 75px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

@keyframes animation {
  0% {
    margin-left: -1000px;
  }
  100% {
    margin-left: 0;
  }
}
</style>
