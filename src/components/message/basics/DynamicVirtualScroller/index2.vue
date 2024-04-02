<template>
  <DynamicScroller
    :items="getList"
    :min-item-size="minItemSize"
    :class="[scrollerClasses, { 'opacity-0': !showingChat }]"
    :emit-update="true"
    @scroll-start="emitOnScrollTop"
    @scroll-end="emitOnScrollEnd"
    @scroll="emitOnScroll"
    ref="scroller"
    :buffer="0"
    :prerender="500"
  >
    <template #before v-if="hasPrevMessages">
      <div class="prev-loading"><Loading></Loading></div>
    </template>

    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :key="index + '-' + item.id"
        :active="active"
        :size-dependencies="[
          item.content,
          item.type,
          item?.dimension?.renderedHeight,
          item?.repliedData,
          item?.repliedData?.messageText,
          item?.repliedData?.replyFromName,
          item?.forwardedData,
          item?.forwardedData?.forwardFromName,
        ]"
        :data-index="item.id"
        :data-active="active"
      >
        <slot name="item" :item="item" :index="index" :active="active"> </slot>
      </DynamicScrollerItem>
    </template>
    <template #after> </template>
  </DynamicScroller>
  <Loading v-if="showLoading"></Loading>
</template>
<script setup>
import {
  ref,
  computed,
  defineProps,
  defineEmits,
  onMounted,
  nextTick,
} from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import Loading from '@/components/message/basics/loading.vue';

const props = defineProps({
  list: {
    type: [String, Object],
  },
  minItemSize: {
    type: [String, Number],
    default: 30,
  },
  scrollerClasses: {
    type: Array,
    default: ['scroller'],
  },
  sizeAffecter: {
    type: String,
    default: 'content',
  },
  showLoading: {
    type: Boolean,
    default: true,
  },
  hasPrevMessages: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'onScrollTop',
  'onScroll',
  'onScrollEnd',
  'setScrollerElement',
]);
const scroller = ref();
const showingChat = ref(false);
const getList = computed(() => {
  return props.list;
});
const emitOnScrollTop = () => {
  if (props.hasPrevMessages && showingChat.value) emit('onScrollTop');
};
const emitOnScrollEnd = () => {
  if (showingChat.value) emit('onScrollEnd');
};
const emitOnScroll = () => {
  emit('onScroll');
};
const scrollToBottom = async () => {
  if (scroller.value) {
    await scroller.value.scrollToBottom();
    emit('setScrollerElement', scroller.value);
    requestAnimationFrame(() => {
      nextTick(() => {
        setTimeout(() => {
          showingChat.value = true;
        }, 100);
      });
    });
  }
  // scroller.value.$el.scrollToBottom(duration);
};

onMounted(() => {
  // Scroll to bottom after all elements have been updated
  setTimeout(() => {
    nextTick(() => {
      setTimeout(() => {
        nextTick(() => {
          setTimeout(() => {
            requestAnimationFrame(() => {
              scrollToBottom();
            });
          }, 100);
        });
      }, 100);
    });
  }, 100);
});
</script>
<style scoped>
.scroller {
  height: 100%;
  background-color: var(--ion-color-bg-chat);
  transition: 0.5s;
}
.prev-loading {
  position: relative;
  height: 50px;
}
</style>
