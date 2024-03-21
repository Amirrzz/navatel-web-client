import { createApp } from 'vue';
import { IonicVue, createAnimation } from '@ionic/vue';
import App from '@/App.vue';
import { useI18n } from 'vue-i18n';

const enterInRightAnimation = (baseEl) => {
  const root = baseEl.shadowRoot;
  const backdropAnimation = createAnimation()
    .addElement(root.querySelector('ion-backdrop'))
    .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

  const wrapperAnimation = createAnimation()
    .addElement(root.querySelector('.modal-wrapper'))
    .keyframes([
      { offset: 0, opacity: '0', transform: 'translateX(100%)' }, // Slide in from right
      { offset: 1, opacity: '1', transform: 'translateX(0)' }, // Fully visible
    ]);

  return createAnimation()
    .addElement(baseEl)
    .easing('ease-out')
    .duration(350)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};

const enterInLeftAnimation = (baseEl) => {
  const root = baseEl.shadowRoot;
  const backdropAnimation = createAnimation()
    .addElement(root.querySelector('ion-backdrop'))
    .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

  const wrapperAnimation = createAnimation()
    .addElement(root.querySelector('.modal-wrapper'))
    .keyframes([
      { offset: 0, opacity: '0', transform: 'translateX(-100%)' }, // Slide in from right
      { offset: 1, opacity: '1', transform: 'translateX(0)' }, // Fully visible
    ]);

  return createAnimation()
    .addElement(baseEl)
    .easing('ease-out')
    .duration(350)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};

const reverseInRightAnimation = (baseEl) => {
  return enterInRightAnimation(baseEl).direction('reverse');
};
const reverseInLeftAnimation = (baseEl) => {
  return enterInLeftAnimation(baseEl).direction('reverse');
};
const navigationInRightAnimation = (baseEl, opts) => {
  const { enteringEl, leavingEl } = opts;

  // Create a slide-in-right animation for the entering page
  const enteringPage = createAnimation('entering-page-animation')
    .addElement(enteringEl)
    .fromTo('transform', 'translateX(100%)', 'translateX(0)') // Slide in from right
    .fromTo('opacity', 0, 1); // Fade in simultaneously

  // Create a fade-out animation for the leaving page
  const leavingPage = createAnimation('leaving-page-animation')
    .addElement(leavingEl)
    .fromTo('opacity', 1, 0); // Fade out

  // Combine both animations
  return createAnimation('root-transition')
    .duration(500)
    .easing('ease-in-out')
    .addAnimation([enteringPage, leavingPage]);
};
const navigationInLeftAnimation = (baseEl, opts) => {
  const { enteringEl, leavingEl } = opts;

  // Create a slide-in-right animation for the entering page
  const enteringPage = createAnimation('entering-page-animation')
    .addElement(enteringEl)
    .fromTo('transform', 'translateX(-100%)', 'translateX(0)') // Slide in from right
    .fromTo('opacity', 0, 1); // Fade in simultaneously

  // Create a fade-out animation for the leaving page
  const leavingPage = createAnimation('leaving-page-animation')
    .addElement(leavingEl)
    .fromTo('opacity', 1, 0); // Fade out

  // Combine both animations
  return createAnimation('root-transition')
    .duration(500)
    .easing('ease-in-out')
    .addAnimation([enteringPage, leavingPage]);
};
export const configurationModalTheme = (lang) => {
  const langIsFa = lang === 'fa';
  const app = createApp(App).use(IonicVue, {
    innerHTMLTemplatesEnabled: true,
    modalEnter: langIsFa ? enterInRightAnimation : enterInLeftAnimation,
    modalLeave: langIsFa ? reverseInRightAnimation : reverseInLeftAnimation,
    navAnimation: langIsFa
      ? navigationInRightAnimation
      : navigationInLeftAnimation,
  });
};
