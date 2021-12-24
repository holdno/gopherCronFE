import { createApp } from 'vue'
import { Quasar, Notify, useQuasar } from 'quasar'
import quasarLang from 'quasar/lang/zh-CN'


// Import icon libraries
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css'
import '@quasar/extras/material-icons/material-icons.css'

// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import Custom css
import './index.css'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
	plugins: {
		Notify,
	},
	config: {
		dark: true,  /* false, "auto" */
		notify: { /* look at QuasarConfOptions from the API card */ }
	},
	lang: quasarLang,
})

// network graph
import "v-network-graph/lib/style.css"
import VNetworkGraph from "v-network-graph"

app.use(VNetworkGraph)

// Axios
import { apiv1, installApiv1 } from './request'
app.use(installApiv1)

// Vuex
import { store, key as storeKey } from './store'
app.use(store, storeKey)
store.commit("setQuasar", { $q: app.config.globalProperties.$q })
store.commit("setApi", { apiv1: apiv1 })

// Router
import router from './router'
app.use(router)

// Assumes you have a <div id="app"></div> in your index.html
app.mount('#app')
