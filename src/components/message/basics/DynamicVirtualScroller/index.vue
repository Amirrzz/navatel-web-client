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
  watchEffect,
  h,
  createApp,
  KeepAlive,
  onMounted,
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
  isSelectState: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'onScrollTop',
  'onScroll',
  'onScrollEnd',
  'setScrollerElement',
  'onParentClick',
  'onReply',
  'onCopy',
  'onForward',
  'onRemove',
  'onEndPointer',
  'onScrollToTargetChat',
  'onCancelRequest',
  'setActiveSelectState',
  'setSelectedItems',
  'seenMessage',
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
watchEffect(() => {
  const items = props.list || [];
  const tempArrayLength = items.length || 0;
  console.log(tempArrayLength, 'tempArrayLength');
  lastArrayLength = !itsOkToGettingPrevMessage
    ? tempArrayLength
    : Math.max(tempArrayLength - lastArrayLength, 0);
  console.log(lastArrayLength, 'lastArrayLength');
  console.log(tempArrayLength - lastArrayLength, 'scrollToIndex');

  preventGettingNewMessages = true;
  const data = {
    messages: items,
    scrollToIndex: !itsOkToGettingPrevMessage
      ? tempArrayLength
      : tempArrayLength - lastArrayLength,
  };
});

const createParentComponent = ({ messages, scrollToIndex }) => {
  // Define the component options
  preventGettingNewMessages = true;
  const options = {
    render() {
      // Render the MessageCard component with TextType as its child
      return h(
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
            if (itsFirstTry && !itsOkToGettingPrevMessage) {
              const tempArrayLength = messages.length || 0;
              lastArrayLength = tempArrayLength;
              scrollToBottom();
              itsFirstTry = false;
            } else {
              const tempArrayLength = messages.length || 0;
              lastArrayLength = !itsOkToGettingPrevMessage
                ? tempArrayLength
                : Math.max(tempArrayLength - lastArrayLength, 0);
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
                    h(MessageCard, {
                      messageData: item,
                      isSelectState: props.isSelectState,

                      onOnParentClick: (data) => {
                        emit('onParentClick', data);
                        console.log('onparent clicked');
                      },
                      onSetSelectedItems: (data) => {
                        console.log('setSelectedItems', data);
                        emit('setSelectedItems', data);
                      },
                      onOnCancelRequest: (data) => {
                        console.log('onOnCancelRequest', data);
                        emit('onCancelRequest', data);
                      },
                      onSeenMessage: (data) => {
                        // console.log('onseenMessage', data);
                        emit('seenMessage', data);
                      },
                    }),
                },
              ),
            ),
        },
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
  emit('onScrollTop');
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
      }, 250);
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
      await nextTick();
      await scroller.value.scrollToItem(index - minesOfIndex);
      await nextTick();
      showLoading.value = false;
      container.value.style.opacity = 1;
    }, 0);
  }
  // scroller.value.$el.scrollToBottom(duration);
};
onMounted(() => {
  if (container.value) container.value.style.opacity = 1;
  preRenderMessageCard({ messages: props.list });
});
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
