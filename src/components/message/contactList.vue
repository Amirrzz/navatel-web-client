<template>
  <div v-bind="containerProps" class="list-container">
    <ion-searchbar
      v-if="!isAndroid && hasSearch"
      :debounce="256"
      @ionInput="emit('iosSearchInputEvent', $event.target.value)"
    ></ion-searchbar>
    <div>
      <div v-for="item in list" :key="item.index">
        <div
          class="firstchar-container"
          v-if="item.data.category != 'inviteContatcsTitle'"
        >
          {{ item.data.category }}
        </div>
        <NavaphoneUser
          v-if="item.data.contact_username"
          :item="item.data"
        ></NavaphoneUser>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isPlatform, IonSearchbar } from '@ionic/vue';
import { useVirtualList } from '@vueuse/core';
import { computed, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import NavaphoneUser from '@/components/message/NavaphoneUser.vue';

const isAndroid = computed(() => {
  return isPlatform('android');
});

const { t } = useI18n();

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  hasSearch: {
    type: Boolean,
    default: true,
    required: false,
  },
});

const getterList = computed(() => {
  return props.list;
});

const detectSizeOfContainer = computed(() => {
  return isAndroid ? '85vh' : 'calc(100dvh - 75px)';
});

const emit = defineEmits([
  'handleAddToGroup',
  'openContactProfileModal',
  'handelGettingUserData',
  'iosSearchInputEvent',
]);

const { list, containerProps } = useVirtualList(getterList, {
  // Keep `itemHeight` in sync with the item's row.
  itemHeight: 65,
  overscan: 10,
});
</script>

<style scoped>
.firstchar-container {
  font-weight: bold;
  font-size: calc(30px - 1vmin);
}
.item-container {
  display: flex;
  width: 100%;
  align-items: flex-end;
}
.set-center {
  align-items: center;
  font-size: calc(30px - 2vmin);
}
.list-container {
  scrollbar-width: none;
  padding-bottom: 10vh;
}
.list-container::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none; /* Hide scrollbar in IE, Edge, and Firefox */
}
</style>
