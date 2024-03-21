<template>
  <div class="arrow-loading-container">
    <img
      class="loading-icon"
      src="/Images/tabs/messages/loading-arrows.svg"
      alt="loading"
    />
  </div>
</template>

<style scoped>
.arrow-loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--ion-color-bg-chat);
  position: absolute;
}

.loading-icon {
  width: 35px;
  height: 35px;
  animation: 0.9s loading infinite linear;
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
