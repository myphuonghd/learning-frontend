import {message} from "ant-design-vue";

export default function ({$axios, store, redirect}) {
  $axios.onError(error => {
    if (error.response === undefined) {
      message.error('Server error.')
    }
    else if(error.response.status === 422){
      store.dispatch("validation/setErrors", error.response.data.errors);
    }
    else if (error.response.status === 401) {
      store.$auth.logout();
    }
    else {
      message.error('There are some problems with your operation.')
      return Promise.reject(error);
    }
  });

  $axios.onRequest(() => {
    store.dispatch("validation/clearErrors");
  });
}
