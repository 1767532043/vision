import Vue from 'vue';
import App from './App.vue';
// import Router from 'vue-router';
// import router from './router';
import common from './util';
import echarts from 'echarts';
import axios from './router/axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import scroll from 'vue-seamless-scroll'

Vue.config.productionTip = false;

// Vue.use(Router);
Vue.use(ElementUI);
Vue.use(scroll)

Vue.prototype.$http = axios;
Vue.prototype.$common = common;
Vue.prototype.$echarts = echarts;

new Vue({
  // router: new Router(router),
  render: h => h(App)
}).$mount('#app');
