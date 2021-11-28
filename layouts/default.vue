<template>
  <a-layout id="main" class="layout-main">
    <a-layout-sider class="layout-slider" v-model="collapsed" :trigger="null" collapsible>
      <div class="logo"/>
      <a-menu theme="dark" mode="inline" :default-selected-keys="['1']">
        <a-menu-item key="1" @click="gotoDashboard">
          <a-icon type="home" />
          <span>Dashboard</span>
        </a-menu-item>
        <a-menu-item key="2" @click="gotoOrders">
          <a-icon type="shopping" />
          <span>Orders</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout class="layout-child" :style="{ marginLeft: collapsed ? '80px' : '200px'}">
      <a-layout-header class="layout-header">
        <a-icon
          class="trigger"
          :type="collapsed ? 'menu-unfold' : 'menu-fold'"
          @click="() => (collapsed = !collapsed)"
        />
        <a-icon type="logout" class="trigger ico-logout" @click="logout"/>
      </a-layout-header>
      <a-layout-content class="layout-content">
        <div class="content">
          <div class="features">
            <Nuxt/>
          </div>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
export default {
  data() {
    return {
      collapsed: false,
    };
  },
  methods: {
    async logout() {
      this.$message.loading('Logout ...', 0.3)
      await this.$auth.logout();
      await this.$router.push('/login');
    },
    async gotoDashboard(){
      await this.$router.push('/');
    },
    async gotoOrders(){
      await this.$router.push('/orders');
    },
  }
}
</script>
