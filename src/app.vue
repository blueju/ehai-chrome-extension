<template>
  <a-config-provider :locale="locale">
    <div class="app">
      <div class="app-info">Hello {{ AppName }} v{{ AppVersion }} !</div>
      <Card />
    </div>
  </a-config-provider>
</template>

<script>
import Card from '@/components/Card.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
import { AppName, AppVersion } from './config'

export default {
  name: 'app',
  components: {
    Card,
  },
  data() {
    return {
      AppName,
      AppVersion,
      locale: zhCN,
    }
  },
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}

.app-info {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(178, 94, 239, 0.5);
  padding: 10px;
  z-index: 999;
}
</style>
