<template v-if="value_bool === true">
  <a-tag color="green">
    YES
  </a-tag>
</template>
<template v-else>
  <a-tag color="red">
    NO
  </a-tag>
</template>
<script>
export default {
  props: {
    value_bool: Boolean,
  },
}
</script>
