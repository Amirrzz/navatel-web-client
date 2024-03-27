<template></template>
<script>
import { h, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import MessageCard from '@/components/message/basics/MessageCard/index.vue';

export default {
  props: [
    'list',
    'minItemSize',
    'scrollerClasses',
    'showLoading',
    'hasPrevMessages',
  ],
  emits: ['onScrollTop', 'onScroll', 'onScrollEnd', 'setScrollerElement'],
  setup(props) {
    console.log(props);
    const scroller = ref();
    const output = () => h(DynamicScroller, { ref: divEl }, 'hi');
    // <div ref="divEl">
    console.log(output());
    return output;
  },
};
</script>
<style>
.scroller {
  height: 83vh;
  background-color: var(--ion-color-bg-chat);
  transition: 0.5s;
  padding-bottom: 13vh;
}
</style>
