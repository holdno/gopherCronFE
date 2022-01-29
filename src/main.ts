import { Notify, Quasar } from 'quasar';
import quasarLang from 'quasar/lang/zh-CN';
// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css
// Import Quasar css
import 'quasar/src/css/index.sass';
// network graph
import VNetworkGraph from 'v-network-graph';
import 'v-network-graph/lib/style.css';
import { createApp } from 'vue';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';

import App from '@/App.vue';
// Axios
import { apiv1, installApiv1 } from '@/api/request';
// Import Custom css
import '@/index.css';
// Router
import router from '@/router';
// Vuex
import { store, key as storeKey } from '@/store/index';

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify,
  },
  config: {
    dark: true /* true, false, "auto" */,
    notify: {
      /* look at QuasarConfOptions from the API card */
    },
  },
  lang: quasarLang,
});

app.use(VNetworkGraph);
app.use(installApiv1, { store });
app.use(store, storeKey);
store.commit('setQuasar', { $q: app.config.globalProperties.$q });
store.commit('setApi', { apiv1: apiv1 });
app.use(router);

// Assumes you have a <div id="app"></div> in your index.html
app.mount('#app');
