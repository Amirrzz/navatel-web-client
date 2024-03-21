<template>
  <div
    v-bind="containerProps"
    class="list-container"
    :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
  >
    <div v-bind="wrapperProps">
      <div
        v-for="item in list"
        :key="item.index"
        class="list-container-item"
        :class="{
          'item-container': item.data.category,
          'set-center': item.data.category == 'inviteContatcsTitle',
        }"
      >
        <div v-if="item.data.category" class="firstchar-container">
          {{
            item.data.category != 'inviteContatcsTitle'
              ? item.data.category
              : t('tabs.contacts.' + item.data.category)
          }}
        </div>
        <NavaphoneUser
          v-else-if="item.data.contact_username"
          :item="item.data"
          @getAddionalProfileInfo="emit('handelGettingUserData', item.data)"
        ></NavaphoneUser>
      </div>
    </div>
  </div>
</template>
<script setup>
import { isPlatform } from '@ionic/vue';
import { useVirtualList } from '@vueuse/core';
import { computed, defineProps, defineEmits } from 'vue';
import NavaphoneUser from '@/components/desktop/contacts/navaPhoneUser.vue';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

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
  showLastSeen: {
    type: Boolean,
    default: true,
  },
});
const getterList = computed(() => {
  return props.list;
});

const emit = defineEmits(['handelGettingUserData']);

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const { list, containerProps, wrapperProps } = useVirtualList(getterList, {
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
  padding-bottom: 30vh;
  height: 90vh;
  overflow-x: scroll;
}
.list-container-item {
  height: 65px;
}
</style>
