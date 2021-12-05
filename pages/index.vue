<template>
  <div class="feature">
    <a-result title="Great, we have done learning the NuxtJS!">
      <template #icon>
        <a-icon type="smile" theme="twoTone" />
      </template>
    </a-result>
  </div>
</template>
<script>
export default {
  middleware: ['auth']
}

</script>
