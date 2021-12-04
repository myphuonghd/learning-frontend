<template>
  <div class="form-auth">
    <h2 class="text-center">Ask for password reset link</h2>
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
        <a-button type="primary"
                  html-type="submit"
                  block
                  :loading="loading"
        >
          Send Password Rest Link
        </a-button>
        <nuxt-link to="/login">Back to Login</nuxt-link>
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
      loading: false,
    }
  },
  methods: {
    async submit() {
      this.loading = true;
      this.form.validateFields(async (err, values) => {
        try {
          let res = await this.$axios.post("/password/create", {
            email: values.email
          })
          this.$message.success(res.data.message);
          await this.$router.push('/login');
        } catch (error) {
          if (error.response !== undefined && error.response.status === 422){
            const errors = error.response.data.errors;
            if (errors !== undefined) {
              this.form.setFields({
                'email': {
                  value : values.email,
                  errors: errors.email !== undefined ? [
                    {
                      "message": errors.email,
                    }
                  ] : null
                },
              });
            }
          }
        }
        this.loading = false
      });
    }
  }
}
</script>









