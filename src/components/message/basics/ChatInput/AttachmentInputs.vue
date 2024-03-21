<template>
  <div class="attach-menu-container slid-up-animation">
    <!-- Image Input Type -->
    <label class="item" for="attachmentInputImage">
      <div class="circle item-blue-background">
        <img
          class="circle-image item-cyan-background"
          src="/Images/tabs/gallery.svg"
          alt="gallery icon"
          loading="lazy"
        />
      </div>
      <span>{{ $t('tabs.message.gallery') }}</span>
    </label>
    <input
      type="file"
      id="attachmentInputImage"
      hidden
      accept="image/*"
      @change="handlerSelectFile($event.target, 'image')"
    />
    <!-- (document) File Input Type -->
    <label class="item" for="attachmentInputDocument">
      <div class="circle item-cyan-background">
        <img
          class="circle-image"
          src="/Images/tabs/file-white.svg"
          alt="select file icon"
          loading="lazy"
        />
      </div>
      <span>{{ $t('tabs.message.file') }}</span>
    </label>
    <input
      type="file"
      id="attachmentInputDocument"
      hidden
      accept="documents/*"
      @change="handlerSelectFile($event.target, 'file')"
    />

    <!-- Video Input Type -->
    <label class="item" for="attachmentInputVideo">
      <div class="circle item-yellow-background">
        <img
          class="circle-image"
          src="/Images/tabs/video-white.svg"
          alt="select video icon"
          loading="lazy"
        />
      </div>
      <span>{{ $t('tabs.message.video') }}</span>
    </label>
    <input
      type="file"
      id="attachmentInputVideo"
      hidden
      accept="video/*"
      @change="handlerSelectFile($event.target, 'video')"
    />

    <!-- Music Input Type -->
    <label class="item" for="attachmentInputMusic">
      <div class="circle item-green-background">
        <img
          class="circle-image"
          src="/Images/tabs/music-white.svg"
          alt="select audio icon"
          loading="lazy"
        />
      </div>
      <span>{{ $t('tabs.message.music') }}</span>
    </label>
    <input
      type="file"
      id="attachmentInputMusic"
      hidden
      accept="audio/*"
      @change="handlerSelectFile($event.target, 'audio')"
    />

    <!-- Location  Type -->
    <label class="item" @click="sendLocation">
      <div class="circle item-red-background">
        <img
          class="circle-image"
          src="/Images/tabs/location-white.svg"
          alt="image"
        />
      </div>
      <span>{{ $t('tabs.message.location') }}</span>
    </label>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
const emit = defineEmits(['selectedFile']);
const handlerSelectFile = (element, type) => {
  const files = element.files;
  switch (type) {
    case 'image':
      setImageMetadata(files, type);
      break;
    case 'video':
      setVideoMetadata(files, type);
      break;
    case 'audio':
      setAudioMetadata(files, type);
      break;
    case 'file':
      emit('selectedFile', {
        files,
        forceFileType: type,
      });
      break;

    default:
      break;
  }
};
const setImageMetadata = (files, type) => {
  let imagesLoaded = 0;
  const totalImages = files.length;
  for (const item of files) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        item['dimension'] = {
          width: this.width,
          height: this.height,
        };
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          emit('selectedFile', {
            files,
            type,
          });
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(item);
  }
};
const setVideoMetadata = (files, type) => {
  let videosLoaded = 0;
  const totalVideos = files.length;

  for (const item of files) {
    const video = document.createElement('video');
    const objectURL = URL.createObjectURL(item);
    video.src = objectURL;
    video.onloadedmetadata = function () {
      const duration = video.duration;
      item['duration'] = duration.toString();
      item['dimension'] = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      URL.revokeObjectURL(objectURL); // Release the object URL

      // Increment the counter for each loaded video
      videosLoaded++;

      // Check if all videos have been loaded
      if (videosLoaded === totalVideos) {
        // Call emit function when all videos are loaded
        emit('selectedFile', {
          files,
          type,
        });
      }
    };
    video.load();
  }
};
const setAudioMetadata = (files, type) => {
  let audiosLoaded = 0;
  const totalAudios = files.length;

  for (const item of files) {
    const audio = document.createElement('audio');
    const objectURL = URL.createObjectURL(item);
    audio.src = objectURL;
    audio.onloadedmetadata = function () {
      const duration = audio.duration;
      item['duration'] = duration.toString();
      URL.revokeObjectURL(objectURL); // Release the object URL

      // Increment the counter for each loaded audio
      audiosLoaded++;

      // Check if all audios have been loaded
      if (audiosLoaded === totalAudios) {
        // Call emit function when all audios are loaded
        emit('selectedFile', {
          files,
          type,
        });
      }
    };
    audio.load();
  }
};
const sendLocation = () => {};
</script>

<style scoped>
.attach-menu-container {
  width: 100%;
  height: 95px;
  background: var(--ion-color-bg-input);
  display: flex;
  justify-content: space-between;
  z-index: 1;
  position: relative;
  overflow: hidden;
  gap: 10px;
  padding: 0 10px;
}

.attach-menu-container .item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.attach-menu-container .item span {
  font-size: 12px;
  font-weight: 600;
  color: #808080;
}

.circle {
  width: calc(50px - 1.5vw);
  height: calc(50px - 1.5vw);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: 22px;
}
.circle-image {
  width: 50%;
  height: 50%;
}
</style>
