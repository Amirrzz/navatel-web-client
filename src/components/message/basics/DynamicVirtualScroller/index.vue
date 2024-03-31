<template>
  <div ref="container" class="container-scroller"></div>
  <Loading v-show="false" class="chat-loading"></Loading>
</template>
<script setup>
import {
  ref,
  computed,
  defineProps,
  defineEmits,
  nextTick,
  watch,
  h,
  createApp,
  KeepAlive,
} from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import Loading from '@/components/message/basics/loading.vue';
import MessageCard from '@/components/message/basics/MessageCard/index.vue';
import i18n from '@/plugins/i18n';
const props = defineProps({
  list: {
    type: [String, Object],
  },
  minItemSize: {
    type: [String, Number],
    default: 30,
  },
  scrollerClasses: {
    type: String,
    default: 'scroller',
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
const showLoading = ref(false);
const scroller = ref();
const showingChat = ref(false);
const getList = computed(() => {
  return props.list;
});
const container = ref(null);
let lastArrayLength = 0;
let itsFirstTry = true;
let itsOkToGettingPrevMessage = false;
let preventGettingNewMessages = true;
let tryToBottom = 3;
let minesOfIndex = 0;
watch(
  () => getList.value,
  async (val, newVal) => {
    const tempArrayLength = newVal?.length || val?.length || 0;
    console.log(tempArrayLength, 'tempArrayLength');
    lastArrayLength = Math.max(tempArrayLength - lastArrayLength, 0);
    console.log(lastArrayLength, 'lastArrayLength');
    console.log(tempArrayLength - lastArrayLength, 'scrollToIndex');

    if (container.value) container.value.style.opacity = 0;
    preventGettingNewMessages = true;
    const data = {
      messages: val || newVal || [],
      scrollToIndex: !itsOkToGettingPrevMessage
        ? tempArrayLength
        : tempArrayLength - lastArrayLength,
    };
    setTimeout(() => {
      preRenderMessageCard(data);
    }, 0);
  },
  {
    immediate: true,
    deep: true,
  },
);

const createParentComponent = ({ messages, scrollToIndex }) => {
  // Define the component options
  preventGettingNewMessages = true;
  const options = {
    render() {
      // Render the MessageCard component with TextType as its child
      return h(
        KeepAlive,
        {},
        h(
          DynamicScroller,
          {
            ref: scroller,
            items: messages,
            'min-item-size': props.minItemSize,
            class: `${props.scrollerClasses}`,
            'emit-update': true,
            buffer: 0,
            prerender: 100,
            'onScroll-start': emitOnScrollTop,
            'onScroll-end': emitOnScrollEnd,
            onScroll: emitOnScroll,
            onVnodeMounted(event) {
              console.log(tryToBottom);
              if (itsFirstTry && !itsOkToGettingPrevMessage) {
                const tempArrayLength = messages.length || 0;
                lastArrayLength = tempArrayLength;
                scrollToBottom();
                itsFirstTry = false;
              } else {
                const tempArrayLength = messages.length || 0;
                lastArrayLength = Math.max(
                  tempArrayLength - lastArrayLength,
                  0,
                );
                scrollToItem(scrollToIndex);
              }
              preventGettingNewMessages = false;
            },
          },
          {
            default: ({ item, index, active }) =>
              h(
                KeepAlive,
                {},
                h(
                  DynamicScrollerItem,
                  {
                    item: item,
                    key: item.id + '-scroller-item' + index,
                    'size-dependencies': [item.type, item.content, item.date],
                    'data-index': item.id,
                    active: active,
                  },
                  {
                    default: () =>
                      h(KeepAlive, {}, h(MessageCard, { messageData: item })),
                  },
                ),
              ),
          },
        ),
      );
    },
  };

  // Create the Vue application instance for the component
  const app = createApp(options).use(i18n);
  // Mount the component to a temporary element
  const tempContainer = document.createElement('div');
  app.mount(tempContainer);
  return tempContainer.firstChild;
};
const createChildsComponent = ({ messages, scrollToIndex }) => {
  // Define the component options
  preventGettingNewMessages = true;
  const fragment = document.createDocumentFragment();
  messages.forEach((item) => {
    const options = {
      render() {
        // Render the MessageCard component with TextType as its child
        return h(
          DynamicScrollerItem,
          {
            item: item,
            key: item.id + '-scroller-item',
            'size-dependencies': [item.type, item.content],
            'data-index': item.id,
            active: true,
          },
          {
            default: () =>
              h(KeepAlive, null, h(MessageCard, { messageData: item })),
          },
        );
      },
    };
    const app = createApp(options).use(i18n);
    // Mount the component to a temporary element
    const tempContainer = document.createElement('div');
    app.mount(tempContainer);
    fragment.appendChild(tempContainer.firstChild);
  });
  // Create the Vue application instance for the component
};
const preRenderMessageCard = async (data) => {
  const fragment = document.createDocumentFragment();
  const dynamicScrollerElement = createParentComponent(data);
  fragment.prepend(dynamicScrollerElement);
  container.value.innerHTML = '';
  container.value.appendChild(fragment);
  return;
};
let countOfgettingMessage = 0;
const emitOnScrollTop = (event) => {
  if (props.hasPrevMessages && !preventGettingNewMessages) {
    countOfgettingMessage++;
    if (countOfgettingMessage > 1) {
      minesOfIndex = 1;
    }
    showLoading.value = true;
    emit('onScrollTop');
  }
};
const emitOnScrollEnd = () => {
  if (showingChat.value) emit('onScrollEnd');
};
const emitOnScroll = (event) => {
  console.log('emitOnScroll', itsFirstTry);
  emit('onScroll');
};
const scrollToBottom = async () => {
  if (scroller.value) {
    tryToBottom++;
    await nextTick();
    await scroller.value.scrollToBottom();
    await nextTick();
    if (tryToBottom < 3) {
      container.value.style.opacity = 0;
      await nextTick();
      setTimeout(() => {
        scrollToBottom();
      }, 500);
      return;
    }
    setTimeout(async () => {
      showLoading.value = false;
      container.value.style.opacity = 1;
      itsOkToGettingPrevMessage = true;
    }, 0);
  }
  // scroller.value.$el.scrollToBottom(duration);
};
const scrollToItem = async (index) => {
  console.log('index in', index, minesOfIndex, itsOkToGettingPrevMessage);
  if (!itsOkToGettingPrevMessage) {
    tryToBottom = 0;
    return scrollToBottom();
  }
  if (scroller.value) {
    setTimeout(async () => {
      await scroller.value.scrollToItem(index - minesOfIndex);
      await nextTick();
      showLoading.value = false;
      container.value.style.opacity = 1;
    }, 0);
  }
  // scroller.value.$el.scrollToBottom(duration);
};
</script>
<style>
.scroller {
  height: 83vh;
  background-color: var(--ion-color-bg-chat);
  transition: 0.5s;
  padding-bottom: 15vh;
}

.prev-loading {
  position: relative;
  height: 50px;
}
.opacity-0 {
  opacity: 0;
}
.container-scroller {
  position: relative;
}
.chat-loading {
  height: 83vh;
  top: 0;
  z-index: 5;
}
</style>
