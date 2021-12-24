import { createApp } from 'vue'
import { Quasar } from 'quasar'
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

// network graph
import "v-network-graph/lib/style.css"
import VNetworkGraph from "v-network-graph"

app.use(VNetworkGraph)

// Axios
import { installApiv1, apiv1 } from './request'
app.use(installApiv1)

// Vuex
import { store, key as storeKey } from './store'
app.use(store, storeKey)
store.commit("setApi", { apiv1 })

// Router
import router from './router'
app.use(router)


app.use(Quasar, {
	plugins: {}, // import Quasar plugins and add here
	lang: quasarLang,
})

// Assumes you have a <div id="app"></div> in your index.html
app.mount('#app')
