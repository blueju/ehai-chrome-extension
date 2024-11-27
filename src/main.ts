import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import {Select} from 'ant-design-vue';
import {isDev} from './utils/index'


const app = createApp(App)
app.use(Select)

const id = `ehai-helper-${Date.now()}`;
const ehaiHelper = document.createElement('div');
ehaiHelper.id = id;
ehaiHelper.setAttribute('class', 'ehai-helper')
document.body.appendChild(ehaiHelper);

const timer1 = setInterval(() => {
    const root = document.querySelector('#root')
    const app = document.querySelector('#app')
    if (root) {
        root && root.remove()
        clearInterval(timer1)
    }
}, 500)

const timer2 = setInterval(() => {
    const app = document.querySelector('#app')
    if (app) {
        app && app.remove()
        clearInterval(timer2)
    }
}, 500)

if (isDev) {
    app.mount(`#${id}`);
} else {
    const timer3 = setInterval(() => {
        if (window.ehai) {
            clearInterval(timer3);
            app.mount(`#${id}`);
        } else {
            console.log('等待下一次检查');
        }
    }, 500);
}

