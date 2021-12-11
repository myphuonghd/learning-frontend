<template>
  <a-tag :color="bool ? 'green' : 'red'">
    {{ bool ? 'Yes' : 'No' }}
  </a-tag>
</template>
<script>
export default {
  props: ["value"],

  data() {
    return {
      bool: false
    }
  },

  mounted() {
    this.bool = this.value === 1 || this.value === '1' || this.value === true || this.value === 'true' || this.value === 'TRUE';
  }
}
</script>
