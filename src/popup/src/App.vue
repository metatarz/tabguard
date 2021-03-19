<template>
  <div class="app">
    <div class="header">
      <img
        width="50"
        height="50"
        class="logo"
        src="./assets/logo.png"
        alt="tab guard logo"
      />
      <div class="settings-trigger">
        <img
          title="Options"
          class="settings-image"
          @click="toggleSettings"
          src="./assets/settings.png"
          width="15"
          height="15"
        />
      </div>
    </div>
    <div class="body">
      <TabManager v-if="!active"></TabManager>
      <SettingsView v-if="active"></SettingsView>
    </div>
  </div>
</template>

<script>
import TabManager from "./components/TabManager.vue";
import SettingsView from "./components/SettingsView.vue";

export default {
  name: "App",
  components: {
    TabManager,
    SettingsView,
  },
  data() {
    return {
      active: false,
    };
  },
  methods: {
    toggleSettings() {
      this.active = !this.active;
    },
  },
};
</script>
<style scoped>
.header {
  margin: 10px;
  border-bottom: 2px solid lightgray;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.settings-image {
  cursor: pointer;
}
</style>

