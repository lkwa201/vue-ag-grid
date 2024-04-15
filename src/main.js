import { createApp } from 'vue'

import {AgGridVue} from 'ag-grid-vue3';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-material.css";


import App from './App.vue'
import router from './router'
//import store from './store'


const app = createApp(App);
app.use(router);

app.config.globalProperties.$router = router;

app.component("AgGridVue", AgGridVue);
app.mount("#app");

