<template>
  <el-config-provider :locale="locale">
    <div class="ehai-helper">
      <Entry />
    </div>
  </el-config-provider>
</template>

<script>
import Entry from '@/components/Entry.vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ElConfigProvider } from 'element-plus'

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

export default {
  name: 'App',
  components: {
    Entry,
    ElConfigProvider
  },
  data() {
    return {
      locale: zhCn,
    };
  },
};
</script>

<style lang="less" scoped>
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
