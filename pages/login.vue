<template>
  <div class="form-auth">
    <h2 class="text-center">Login SSC Order</h2>
    <a-form
      :form="form"
      @submit.prevent="submit"
    >
      <a-form-item>
        <a-input
          placeholder="Enter email"
          v-decorator="['email']"
        >
          <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)"/>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          type="password"
          placeholder="Enter password"
          v-decorator="['password']"
        >
          <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary"
                  html-type="submit"
                  block
                  :loading="loading"
        >
          Login
        </a-button>
        Don't have an account ?
        <nuxt-link to="/register">Register</nuxt-link>
        <br>
        <nuxt-link to="/password/forgot" class="forgot">Forgot Password</nuxt-link>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  middleware: ['guest'],
  layout    : 'auth',
  data() {
    return {
      form   : this.$form.createForm(this),
      loading: false
    }
  },
  methods: {
    async submit() {
      this.loading = true;
      this.form.validateFields(async (err, values) => {
        try {
          await this.$auth.loginWith('local', {
            data: {
              email   : values.email,
              password: values.password
            }
          });

          // Redirect when OK
          await this.$router.push({
            path: this.$route.query.redirect || "/"
          })
        } catch (error) {
          const errors = error.response.data.errors;

          this.form.setFields({
            'email'   : {
              value : values.email,
              errors: errors.email !== undefined ? [
                {
                  "message": errors.email,
                }
              ] : null
            },
            'password': {
              value : values.password,
              errors: errors.password !== undefined ? [
                {
                  "message": errors.password,
                }
              ] : null
            },
          });
        }
        this.loading = false
      });
    }
  },

}
</script>








