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
  onMounted,
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
    type: Array,
    default: ['scroller'],
  },
  sizeAffecter: {
    type: String,
    default: 'content',
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
let lastIndex = 0;
let itsFirstTry = true;
let preventGettingNewMessages = true;
watch(
  () => getList.value,
  (val, newVal) => {
    if (!newVal) return;
    container.value.style.opacity = 0;
    if (scroller.value && newVal) {
      console.log(scroller.value);
      scroller.value.$props.items = newVal;
      console.log('exist');
      scrollToItem(49);
      setTimeout(() => {
        container.value.style.opacity = 1;
      });

      return;
    }
    preventGettingNewMessages = true;
    const data = {
      messages: val || newVal || [],
      needToScroll: !Boolean(newVal),
      scrollToIndex: lastIndex - 1,
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
  console.log(container);
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
            console.log('mounted', event);
            if (itsFirstTry) {
              scrollToBottom();
              itsFirstTry = false;
            } else {
              scrollToItem(49);
            }
            preventGettingNewMessages = false;
          },
        },
        {
          default: ({ item, index, active }) =>
            h(
              DynamicScrollerItem,
              {
                item: item,
                key: item.id + '-scroller-item' + index,
                'size-dependencies': [item.type, item.content],
                'data-index': item.id,
                active: active,
              },
              {
                default: () =>
                  h(KeepAlive, null, h(MessageCard, { messageData: item })),
              },
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
  console.log(fragment, 'in 2222222222222');
};
const preRenderMessageCard = async (data) => {
  // if (!itsFirstTry) {
  //   createChildsComponent(data);
  //   return;
  // }
  const fragment = document.createDocumentFragment();
  const dynamicScrollerElement = createParentComponent(data);
  console.log(dynamicScrollerElement, 'scroleeeeeeeeeeeeeer');

  fragment.prepend(dynamicScrollerElement);
  container.value.innerHTML = '';
  container.value.appendChild(fragment);
  return;
};
const emitOnScrollTop = (event) => {
  console.log('emitOnScrollTop', event);
  if (props.hasPrevMessages && !preventGettingNewMessages) {
    showLoading.value = true;
    emit('onScrollTop');
  }
};
const emitOnScrollEnd = () => {
  console.log('emitOnScrollEnd');

  if (showingChat.value) emit('onScrollEnd');
};
const emitOnScroll = (event) => {
  emit('onScroll');
};
const scrollToBottom = async () => {
  if (scroller.value) {
    console.count('first try');
    await scroller.value.scrollToBottom();
    setTimeout(async () => {
      showLoading.value = false;
      container.value.style.opacity = 1;
    }, 0);
  }
  // scroller.value.$el.scrollToBottom(duration);
};
const scrollToItem = async (index) => {
  if (scroller.value) {
    console.log('hello', scroller.value);
    setTimeout(async () => {
      console.log(index);
      await scroller.value.scrollToItem(index);
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
