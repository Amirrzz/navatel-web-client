import { defineStore } from 'pinia';
import { modalController, isPlatform } from '@ionic/vue';
import { computed } from 'vue';
import messageDeatilAndroid from '@/components/message/modals/messageDeatil.vue';
import addMemberGroupAndroid from '@/components/message/modals/addMemberGroup.vue';
import NewGroupAndroid from '@/components/message/modals/android/newGroupName/index.vue';
import NewGroupIos from '@/components/message/modals/ios/newGroupName/index.vue';
// import groupChatRoom from '@/components/message/groups/index.vue';

const isAndroid = computed(() => {
  return isPlatform('android');
});

export const useNestedModals = defineStore('nestedmodals', {
  state: () => ({
    stickerInformation: false,
  }),

  actions: {
    async messagePageNavigateToMessageDeatail() {
      const modal = await modalController.create({
        component: isAndroid.value
          ? messageDeatilAndroid
          : messageDeatilAndroid,
      });

      modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role === 'cancel') {
      }
    },

    closeMessageDeatailModal() {
      modalController.dismiss();
    },

    async messageDeatailNavigateToAddMemberToGroup() {
      const modal = await modalController.create({
        component: isAndroid.value
          ? addMemberGroupAndroid
          : addMemberGroupAndroid,
      });

      modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role === 'cancel') {
      }
    },

    closeAddMemberGroup() {
      modalController.dismiss();
    },

    async addMemberToGroupNavigateToNewGroup() {
      const modal = await modalController.create({
        component: isAndroid.value ? NewGroupAndroid : NewGroupIos,
      });

      modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role === 'cancel') {
      }
    },

    closeNewGroup() {
      modalController.dismiss();
    },

    async newGroupNavigateToGroupChatRoom() {
      modalController.dismiss();
      setTimeout(async () => {
        modalController.dismiss();
      }, 600);
    },

    async leaveGroupStatus() {
      modalController.dismiss();
      setTimeout(() => {
        modalController.dismiss();
      }, 1000);
    },

    async openStickerInformationModal() {
      this.stickerInformation = !this.stickerInformation;
    },
    async closeStickerInformationModal() {
      this.stickerInformation = false;
    },
  },

  persist: true,
});
