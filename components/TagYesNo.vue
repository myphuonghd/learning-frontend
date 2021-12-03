<template>
  <a-tag :color="value === true ? 'green' : 'red'">
    {{ value === true ? 'Yes' : 'No' }}
  </a-tag>
</template>
<script>
export default {
  props: {
    value: Boolean,
  },
}
</script>
