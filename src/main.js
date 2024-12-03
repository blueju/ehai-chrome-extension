loadStyle('https://cdn.bootcdn.net/ajax/libs/ant-design-vue/3.2.20/antd.min.css');

import App from './app.vue';
// import { isDev } from './config';
import { loadStyle } from './utils';
import Antd from '@/utils/antd';
import './styles/global.scss';

const id = `app_vue_${Date.now()}`;
const root = document.createElement('div');
root.id = id;
document.body.appendChild(root);

const Vue = require('vue');
const app = Vue.createApp(App);
app.use(Antd);
app.mount(`#${id}`);
