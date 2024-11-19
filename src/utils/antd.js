import {
  Button,
  Select,
  Divider,
} from 'ant-design-vue'

const Antd = {
  install: function (Vue) {
    Vue.component('a-button', Button)
    Vue.component('a-select', Select)
    Vue.component('a-divider', Divider)
  }
}

export default Antd