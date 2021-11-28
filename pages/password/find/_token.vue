<template>
  <div class="feature feature-auth">
    <h2 class="text-center">Update your password</h2>
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
          Login with new password
        </a-button>
        <nuxt-link to="/login">Back to Login</nuxt-link>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  middleware: ['guest'],
  data() {
    return {
      form    : this.$form.createForm(this),
      loading : false,
      token   : '',
      is_found: false,
      message : '',
    }
  },
  methods: {
    async submit() {
      let is_found   = false;
      let is_success = false;
      let is_login   = false;
      let error      = null;
      this.loading   = true;
      this.pushMessageLoading();
      this.message   = '';
      const email    = this.form.getFieldValue('email');
      const password = this.form.getFieldValue('password');
      await this.$axios.$get(`/password/find/${this.token}`).then(() => {
        is_found = true;
      }).catch(e => {
        error = e;
      });

      if (is_found) {
        // to reset password
        await this.$axios.$post(`/password/reset/`, {
          email   : email,
          password: password,
          token   : this.token,
        }).then(() => {
          is_success = true;
        }).catch(e => {
          error = e;
        });
      }

      if (is_success) {
        await this.$auth.loginWith('local', {
          data: {
            email   : email,
            password: password
          }
        }).then(() => {
          is_login = true;
        }).catch(e => {
          error = e;
        });
      }

      this.loading = false;
      if (is_found && is_success && is_login) {
        this.$message.success('Successfully');
        await this.$router.push('/');
      } else {
        const errors = error.response.data.errors;
        this.message = error.response.data.message;
        this.$message.error(this.message);
        if (errors !== undefined) {
          this.form.setFields({
            'email'   : {
              value : email,
              errors: errors.email !== undefined ? [
                {
                  "message": errors.email,
                }
              ] : null
            },
            'password': {
              value : password,
              errors: errors.password !== undefined ? [
                {
                  "message": errors.password,
                }
              ] : null
            },
          });
        }
      }
    },
    pushMessageLoading(){
      const hide = this.$message.loading('Loading...', 0);
      // Dismiss manually and asynchronously
      setTimeout(hide, 500);
    }
  },
  mounted() {
    this.token = this.$route.params.token
  }
}
</script>
