<template>
  <a-tag :color="color">
    {{ label }}
  </a-tag>
</template>
<script>
export default {
  props: ["value"],

  data() {
    return {
      bool : false,
      color: '',
      label: '',
    }
  },

  mounted() {
    if (this.value === null || this.value === 'null' || this.value === 'NULL') {
      this.bool  = null;
      this.color = '';
      this.label = 'All';
    } else {
      this.bool = this.value === 1 || this.value === '1' || this.value === true || this.value === 'true' || this.value === 'TRUE';

      this.color = this.bool ? 'green' : 'red';
      this.label = this.bool ? 'Yes' : 'No';
    }
  }
}
</script>
