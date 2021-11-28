<template>
  <header class="header">
    <div class="header-content">
      <div class="header-logo"><img src="/logo.png" class="common-logo" alt="logo"></div>
      <div class="header-menu">
        <ul class="menu-content">
          <li class="menu-item active">
            <nuxt-link to="/" class="menu-item">Dashboard</nuxt-link>
          </li>
          <li class="menu-item">
            <nuxt-link to="/orders" class="menu-item">Orders</nuxt-link>
          </li>
        </ul>
      </div>
      <div class="header-menu auth-menu">
        <ul class="menu-content">
          <template v-if="!authenticated">
            <nuxt-link to="/login" class="menu-item">Login</nuxt-link>
            <nuxt-link to="/register" class="menu-item">Register</nuxt-link>
          </template>
          <template v-if="authenticated">
            <a @click.prevent="logout" class="menu-item">Logout</a>
          </template>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>

export default {
  name      : "TheHeader",
  methods: {
    async logout () {
      await this.$auth.logout();
      await this.$router.push('/login');
    }
  }
}
</script>

<style scoped>


</style>
