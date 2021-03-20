<template>
  <div class="app">
    <div class="header">
      <img class="logo" src="./assets/logo.png" alt="tab guard logo" />
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
    <div class="footer">
      <a
        class="footer-link"
        target="__blank"
        href="https://github.com/sirdmon/tabguard"
        >Star this project</a
      >
      <span> · </span>
      <p>
        Developed by
        <a class="footer-link" target="__blank" href="https://audits.digital"
          >Digital Sustainability Audits</a
        >
      </p>
      <p class="app-version">v. {{ appversion }}</p>
    </div>
  </div>
</template>

<script>
import TabManager from "./components/TabManager.vue";
import SettingsView from "./components/SettingsView.vue";
import { version } from "./../package.json";

export default {
  name: "App",
  components: {
    TabManager,
    SettingsView,
  },
  data() {
    return {
      active: false,
      appversion: version,
    };
  },
  methods: {
    toggleSettings() {
      this.active = !this.active;
    },
  },
};
</script>
<style lang="scss" scoped>
.header {
  margin: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.body {
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
  width: 100%;
}

.footer {
  margin: 10px;
  text-align: center;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
}

.footer-link {
  text-decoration: none;
  color: #3367fc;
}
.settings-image {
  cursor: pointer;
}

.app-version {
  font-size: 0.8rem;
}
</style>

