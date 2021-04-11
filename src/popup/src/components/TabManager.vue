<template>
  <div class="container">
    <div v-if="tabs && tabs.length">
      <h2 class="title">My saved tabs</h2>
      <div class="tab-heading-wrapper">
        <p class="tab-heading">Favicon</p>
        <p class="tab-heading">Title</p>
        <p class="tab-heading">Reason</p>
        <p class="tab-heading">Actions</p>
      </div>
      <div v-for="(tab, i) in tabs" :key="i">
        <div class="tab-wrapper">
          <img class="tab-favicon" :src="tab.favIconUrl" />
          <div class="tab-text-wrapper" @click="spawnNewTab(tab.id)">
            <p class="tab-title">{{ tab.title }}</p>
            <p class="tab-host">{{ host(tab.url) }}</p>
          </div>
          <div class="tab-reason-wrapper">
            <p class="tab-reason" :class="'tab-reason-' + tab.reason">
              {{ tab.reason }}
            </p>
          </div>
          <Dropdown class="dropdown">
            <div class="dropdown-item" @click="removeTab(tab.id)">
              <p class="dropdown-text">Remove</p>
            </div>
            <div class="dropdown-item">
              <p class="dropdown-text" @click="popoutTab(tab.id)">Pop out</p>
            </div>
          </Dropdown>
        </div>
      </div>
      <button class="remove-button" @click="clearTabsFromStorage()">
        Delete all
      </button>
    </div>
    <div v-else>
      <p class="text-light">
        Currently, you don't have any saved tabs. Keep on surfing the net!
      </p>
    </div>
  </div>
</template>

<script>
import {
  getFromStorage,
  setToStorage,
  createNewTab,
  removeFromStorage,
  onMessageListener,
  sendMessage,
  setBadgeText,
  setTitle,
} from "./../utils/utils";
import Dropdown from "./Dropdown.vue";

export default {
  components: { Dropdown },
  data() {
    return {
      tabs: [],
      showDropdown: false,
    };
  },
  created() {
    this.resetActionState();
    getFromStorage("tabs", (result) => {
      if (result?.tabs) {
        this.updateTabs(result.tabs);
      }
    });
    onMessageListener((request, sender, sendResponse) => {
      const tabs = request?.tabs;
      this.updateTabs(tabs);
      sendResponse({ received: true });
    });
  },
  methods: {
    updateTabs(tabs) {
      this.tabs = [...this.tabs, ...tabs];
    },
    clearTabsFromStorage() {
      this.tabs = undefined;
      removeFromStorage("tabs");
    },
    removeTab(tabId) {
      const filteredTabs = this.tabs.filter((tab) => tab.id !== tabId);
      this.tabs = filteredTabs;
      setToStorage({ tabs: filteredTabs });
    },
    popoutTab(tabId) {
      this.spawnNewTab(tabId);
      this.removeTab(tabId);
    },
    spawnNewTab(tabId) {
      const tabUrl = this.tabs.find((tab) => tab.id === tabId)?.url;
      createNewTab(tabUrl);
    },
    action() {
      this.showDropdown = !this.showDropdown;
    },
    host(url) {
      return new URL(url).hostname;
    },
    resetActionState() {
      sendMessage({ properties: { unseenTabs: 0 } });
      setBadgeText("");
      setTitle("");
    },
  },
};
</script>
<style lang="scss" scoped>
$cpu-color: #338eca;
$network-color: #ffee33;
$memory-color: #44fd32;

.container {
  text-align: center;
}

.dropdown {
  margin-left: auto;
}

.dropdown-item {
  padding: 5px 10px;
  margin-top: 10px;
}
.dropdown-item:hover {
  cursor: pointer;
  background-color: lightgrey;
}

.tab-wrapper {
  display: flex;
  align-items: center;
  margin: 5px;
}

.tab-text-wrapper {
  max-width: 150px;

  &:hover {
    cursor: pointer;
  }
}

.text-light {
  color: #4a4a4a;
}

.tab-host {
  color: gray;
  font-size: 12px;
}

.tab-favicon {
  width: 30px;
  height: 30px;
}

.tab-heading {
  font-weight: 900;
}

.tab-heading-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.tab-reason-wrapper {
  margin-left: auto;
}

.tab-text-wrapper {
  margin-left: auto;
}
.tab-reason {
  border: 2px solid;
  border-radius: 500px;
  width: 50px;
  height: 20px;
  &-cpu {
    border-color: $cpu-color;
    background-color: rgba($cpu-color, 0.55);
  }
  &-memory {
    border-color: $memory-color;
    background-color: rgba($memory-color, 0.55);
  }
  &-network {
    border-color: $network-color;
    background-color: rgba($network-color, 0.55);
  }
}

.title {
  text-align: left;
}

.remove-button {
  cursor: pointer;
  margin-bottom: 30px;
  padding: 8px 16px;
  background-color: transparent;
  color: #1a73e8;
  border: 1px solid rgba(218, 220, 224);
  border-radius: 4px;

  &:hover {
    background-color: rgba(66, 133, 244, 0.04);
  }
}
</style>