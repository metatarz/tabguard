<template>
  <div class="container">
    <Settings></Settings>
    <TabManager></TabManager>
  </div>
</template>

<script>
import TabManager from "./components/TabManager.vue";
import Settings from "./components/Settings.vue";

export default {
  name: "App",
  components: {
    TabManager,
    Settings,
  },
};
</script>
