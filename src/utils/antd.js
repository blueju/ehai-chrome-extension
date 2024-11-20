import {
  Button,
  Select,
  Divider,
  DatePicker,
  TimePicker,
  InputNumber,
  Checkbox,
  Table,
  ConfigProvider
} from 'ant-design-vue'

const Antd = {
  install: function (Vue) {
    Vue.component('a-button', Button)
    Vue.component('a-select', Select)
    Vue.component('a-divider', Divider)
    Vue.component('a-date-picker', DatePicker)
    Vue.component('a-time-picker', TimePicker)
    Vue.component('a-input-number', InputNumber)
    Vue.component('a-checkbox', Checkbox)
    Vue.component('a-table', Table)
    Vue.component('a-config-provider', ConfigProvider)
  }
}

export default Antd