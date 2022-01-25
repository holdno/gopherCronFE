import { createApp } from 'vue';
import { Quasar, Notify } from 'quasar';
import quasarLang from 'quasar/lang/zh-CN';

// Import icon libraries
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';

// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

// Import Quasar css
import 'quasar/src/css/index.sass';

// Import Custom css
import '@/index.css';

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from '@/App.vue';

// network graph
import 'v-network-graph/lib/style.css';
import VNetworkGraph from 'v-network-graph';

// Axios
import { apiv1, installApiv1 } from '@/api/request';

// Vuex
import { store, key as storeKey } from '@/store';

// Router
import router from '@/router';

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
