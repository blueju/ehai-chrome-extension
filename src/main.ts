import './assets/main.css'

import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import App from './App.vue'
import { Select } from 'ant-design-vue';


const app = createApp(App)
app.use(Select)
// app.use(createPinia())

const isDev = import.meta.env.MODE === 'development';
const id = `ehai-helper`;
const root = document.createElement('div');
root.id = id;
document.body.appendChild(root);


if (isDev) {
    app.mount(`#${id}`);
} else {
    const timer = setInterval(() => {
        if (window.ehai) {
            clearInterval(timer);
            app.mount(`#${id}`);
        } else {
            console.log('等待下一次检查');
        }
    }, 1000);
}

