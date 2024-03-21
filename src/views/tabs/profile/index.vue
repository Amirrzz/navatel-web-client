<template>
  <IonPage> </IonPage>
</template>

<script setup>
import { IonPage, onIonViewWillEnter, modalController } from '@ionic/vue';
import Profile from '@/components/profile/index.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const openProfileModal = async () => {
  const modal = await modalController.create({
    component: Profile,
    keepContentsMounted: true,
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    router.push('/callpad');
    // here should handel end call [process
  }
};
onIonViewWillEnter(() => {
  openProfileModal();
});
</script>
