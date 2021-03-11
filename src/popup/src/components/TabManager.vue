<template>
  <div class="container" v-if="tabs && tabs.length">
    <p>Your saved tabs:</p>
    <ul v-for="(tab, i) in tabs" :key="i">
      <li>{{ tab }}</li>
    </ul>
    <button @click="clearTabsFromStorage()">Delete all</button>
  </div>
</template>

<script>
import { getFromStorage } from "./../utils/utils";
export default {
  data() {
    return {
      tabs: [],
    };
  },
  created() {
    getFromStorage("tabs", (result) => {
      if (result?.tabs) {
        console.log(result.tabs);
        this.updateTabs(result.tabs);
      }
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const tabs = request?.tabs;
      this.updateTabs(tabs);
    });
  },
  methods: {
    updateTabs(tabs) {
      this.tabs = [...this.tabs, ...tabs];
    },
    clearTabsFromStorage() {
      this.tabs = undefined;
      chrome.storage.sync.remove("tabs");
    },
  },
};
</script>
<style scoped>
.container {
  text-align: center;
}
</style>