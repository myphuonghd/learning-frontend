<template>
  <div class="form-auth">
    <h2 class="text-center">Register SSC Order</h2>
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
          placeholder="Enter your name"
          v-decorator="['name']"
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
          Register
        </a-button>
        Already have an account ?
        <nuxt-link to="/login">Login</nuxt-link>
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
          await this.$axios.$post('register', {
            email   : values.email,
            name    : values.name,
            password: values.password
          });
          await this.$auth.loginWith('local', {
            data: {
              email   : values.email,
              password: values.password
            }
          })

          // Redirect when OK
          await this.$router.push({
            path: this.$route.query.redirect || "/"
          })
        } catch (error) {
          if (error.response !== undefined && error.response.status === 422) {
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
              'name'    : {
                value : values.name,
                errors: errors.name !== undefined ? [
                  {
                    "message": errors.name,
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
        }
        this.loading = false
      });
    }
  },

}
</script>








