<template>
  <span class="dropdown">
    <a
      v-show="!state"
      href="#"
      @click.prevent="toggleDropdown"
      class="dropdown-toggle"
      >&#xFE19;</a
    >
    <div class="dropdown-menu" v-show="state">
      <slot></slot>
    </div>
  </span>
</template>

<script>
export default {
  data() {
    return {
      state: false,
    };
  },
  methods: {
    toggleDropdown(e) {
      this.state = !this.state;
    },
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.state = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.close);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.close);
  },
};
</script>

<style scoped>
.dropdown-toggle {
  zoom: 200%;
  text-decoration: none;
  border-radius: 20px;
}

.dropdown-menu {
  display: inline;
  border: 2px solid transparent;
  border-radius: 4px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}

.dropdown-toggle:focus {
  background-color: lightgrey;
}
</style>