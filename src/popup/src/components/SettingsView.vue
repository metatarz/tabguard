<template>
  <div class="settings">
    <div>
      <label for="autosave">Auto saved tabs</label>
      <input name="autosave" id="autosave" v-model="autosave" type="checkbox" />
    </div>
    <div>
      <label for="telemetry">Allow usage metrics</label>
      <input
        name="telemetry"
        id="telemetry"
        v-model="telemetry"
        type="checkbox"
      />
    </div>
  </div>
</template>
<script>
import { getFromStorage, sendMessage, setToStorage } from "../utils/utils";
export default {
  data() {
    return {
      telemetry: true,
      autosave: true,
    };
  },
  created() {
    getFromStorage("autosave", (result) => {
      if (result?.autosave) {
        this.autosave = result.autosave;
      }
    });
    getFromStorage("telemetry", (result) => {
      if (result?.telemetry) {
        this.telemetry = result.telemetry;
      }
    });
  },
  watch: {
    autosave: function () {
      const autosave = this.autosave;
      sendMessage({ properties: { autosave } });
      setToStorage({ autosave });
    },
    telemetry: function () {
      const telemetry = this.telemetry;
      sendMessage({ properties: { telemetry } });
      setToStorage({ telemetry });
    },
  },
};
</script>
<style lang="scss" scoped>
.settings {
  max-width: 80%;
  margin: auto;
  & > div {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    margin-top: 10px;
  }
}
</style>