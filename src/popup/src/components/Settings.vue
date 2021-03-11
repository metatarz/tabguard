Global chrome

<template>
  <div class="container">
    <p>Settings</p>
    <label for="autosave">Auto saved tabs</label>
    <input name="autosave" id="autosave" v-model="autosave" type="checkbox" />
  </div>
</template>
<script>
import { setToStorage, getFromStorage } from "../utils/utils";
export default {
  data() {
    return {
      autosave: false,
    };
  },
  created() {
    getFromStorage("autosave", (result) => {
      if (result?.autosave) {
        this.autosave = result.autosave;
      }
    });
  },
  watch: {
    autosave: function () {
      const autosave = this.autosave;
      chrome.runtime.sendMessage({ properties: { autosave } });
      setToStorage({ autosave });
    },
  },
};
</script>