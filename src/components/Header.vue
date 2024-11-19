<template>
  <div class="header">
    <!-- <h3 class="header-title">{{AppName}}</h3> -->
     <h3 class="header-title">付费升级</h3>
    <a-tag color="#b25eef">v{{AppVersion}}</a-tag>
  </div>
</template>

<script>
import { AppName, AppVersion } from '@/config'
export default {
  name: 'Header',
  data() {
    return {
      AppName,
      AppVersion,
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  padding:10px;

  i {
    font-size: 20px;
  }

  .header-title {
    margin: 0 10px;
    font-size: 20px;
  }
}
</style>