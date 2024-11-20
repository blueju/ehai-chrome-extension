<template>
  <div class="QuickQueryStock">
    <div style="display: flex;align-items: center">
      <div>城市：</div>
      <a-select v-model:value="cityId" show-search placeholder="Select a person" style="width: 200px"
        :options="cityOptions" :filter-option="filterOption" @change="handleChange" @select="handleChange"></a-select>
    </div>
    <br>
    <br>
    <div style="display: flex;column-gap: 10px;">
      <a-date-picker v-model:value="pickupDate" valueFormat="YYYY-MM-DD" :disabledDate="disabledDate" />
      <a-time-picker v-model:value="pickupHour" format="HH" :minuteStep="30" :showNow="false"
        :disabledHours="disabledHours" allowClear value-format="HH:mm" />
    </div>
    <br>
    <div style="display: flex;column-gap: 20px;align-items: center;">
      <div>
        使用天数：
        <a-input-number v-model:value="usageDays" :min="1" :max="5" style="margin-right: 20px;" />
      </div>
      <a-checkbox v-model:checked="isWednesday">周三下单88折扣</a-checkbox>
      <a-checkbox v-model:checked="isAdd51">总价+51保障</a-checkbox>
    </div>
    <br>
    <a-button type="primary" @click="confirm">确认</a-button>
    <br>
    <br>
    <div>
      还车时间：{{ this.returnTime }}
    </div>
    <a-divider />
    <a-table :columns="newEnergyTableColumns" :data-source="stock" :pagination="false"></a-table>

  </div>
</template>

<script>
import Header from './Header.vue'
import cityStockMock from './cityStockMock.json'
import queryList from './queryList';
import dayjs from 'dayjs'

export default {
  name: 'Card',
  components: { Header },
  data() {
    return {
      isWednesday: dayjs().day() === 3 ? true : false,
      isAdd51: true,
      // 城市ID与城市名映射集合
      cityMap: new Map(),
      // 门店ID与门店名映射集合
      storeMap: new Map(),
      // 门店列表
      cityList: [],
      // 车型列表
      carLevel: [],
      // 门店数据
      city: undefined,
      // 整个城市的车辆库存
      cityStock: [],

      // 库存
      stock: [],
      // 城市ID（默认深圳）
      cityId: 21,
      // 取车日期
      pickupDate: dayjs().format('YYYY-MM-DD'),
      // 取车时刻
      pickupHour: dayjs().add(1, 'hour').format('HH:00'),
      // 使用天数
      usageDays: 1,
      // 最高的舒适车价格
      topComfortCarPrice: 0,
      // 最高的精英车价格
      topBetterCarPrice: 0,
      // 基础费用（基本保障服务费+车辆整备费）
      preparePrice: 20,
      basicServicePrice: 50,
      // 新能源车列表
      allNewEnergyCar: [],

      // 舒适车列表
      allComfortCar: [],
      // 舒适车价格集合
      comfortCarPriceSet: new Set(),
      // 精英车列表
      allBetterCar: [],
      // 精英车价格集合
      betterCarPriceSet: new Set(),

      newEnergyTableColumns: [
        {
          title: '车型',
          dataIndex: 'carType',
          key: 'carType',
          customRender: ({ _, record }) => {
            return record.carTypeItem.name
          }
        },
        {
          title: '门店',
          dataIndex: 'storeName',
          key: 'storeName',
          customRender: ({ _, record }) => {
            return record.carTypeItem.name
          }
        },
        {
          title: '总价',
          dataIndex: 'totalPrice',
          key: 'totalPrice',
          customCell: (record, rowIndex, column) => {
            const totalPrice = record.priceItemList[0].totalPrice
            return {
              title: this.isWednesday
                ? `${totalPrice}-${Math.floor(totalPrice * 0.12)}+${this.basicServicePrice}*${this.usageDays}+${this.preparePrice}` + (this.isAdd51 ? `+${51 * this.usageDays}` : 0)
                : `${totalPrice}+${this.basicServicePrice}*${this.usageDays}+${this.preparePrice}` + (this.isAdd51 ? `+${51 * this.usageDays}` : 0)
            }
          },
          customRender: ({ _, record }) => {
            const totalPrice = record.priceItemList[0].totalPrice
            return this.isWednesday
              // 总价-周三88折折扣+基本保障服务费*使用天数+车辆整备费+51保障
              ? record.priceItemList[0].totalPrice - Math.floor(totalPrice * 0.12) + this.basicServicePrice * this.usageDays + this.preparePrice + (this.isAdd51 ? (51 * this.usageDays) : 0)
              // 总价+基本保障服务费*使用天数+车辆整备费+51保障
              : record.priceItemList[0].totalPrice + this.basicServicePrice * this.usageDays + this.preparePrice + (this.isAdd51 ? (51 * this.usageDays) : 0)
          }
        },
      ]
    }
  },
  mounted() {
    this.queryCityList()
    this.queryStoreList()
    this.queryCarLevel()
  },
  computed: {
    // 门店选项
    cityOptions() {
      return this.cityList.map(item => {
        return {
          ...item,
          label: item.city,
          value: item.cityId,
        }
      })
    },
    // 取车时间
    pickupTime() {
      const pickupTime = `${this.pickupDate} ${this.pickupHour}`
      return dayjs(pickupTime).format('YYYY-MM-DD HH:mm')
    },
    // 还车时间
    returnTime() {
      const returnTime = dayjs(this.pickupTime).add(this.usageDays, 'day').format('YYYY-MM-DD HH:mm')
      return returnTime
    }
  },
  methods: {
    disabledDate(current) {
      return current < dayjs();
    },
    disabledHours() {
      const currentHour = dayjs().hour();
      const currentDate = dayjs().format('YYYY-MM-DD');
      // 如果是今天
      if (currentDate === this.pickupDate) {
        const hours = [];
        // 禁用当前时间之前的小时
        for (let i = 0; i < currentHour; i++) {
          hours.push(i);
        }
        // 禁用当前小时内的小时（即当前小时的下一个小时）
        if (currentHour < 23) {
          hours.push(currentHour + 1);
        }
        return hours;
      } else {
        // 如果不是今天，返回空数组
        return [];
      }
    },
    // 查询门店列表
    queryStoreList() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/storeList')
        .then(res => res.json())
        .then(storeList => {
          this.storeList = storeList
          storeList.forEach(store => {
            if (store.id === 2596) {
              this.store = store
            }
            this.storeMap.set(store.id, store.name)
          })
        })
    },
    // 查询城市列表
    queryCityList() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/cityList')
        .then(res => res.json())
        .then(cityList => {
          this.cityList = cityList
          cityList.forEach(city => {
            if (city.id === 21) {
              // 21 深圳
              this.city = city
            }
            this.cityMap.set(city.id, city.city)
          })
        })
    },
    // 查询车型列表
    queryCarLevel() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/carLevel')
        .then(res => res.json())
        .then(resJson => {
          this.carLevel = resJson
        })
    },
    filterOption(input, option) {
      return option.label.indexOf(input) >= 0
    },
    handleChange(cityId, option) {
      this.cityId = cityId
      this.city = option
    },
    confirm() {
      // 城市门店（仅看门店）
      const cityStoreList = this.storeList.filter(item => {
        return (item.cityId === this.cityId) && (item.type === 1)
      })
      console.log(cityStoreList)

      function getRandomDelay() {
        // 返回 1 到 3 秒之间的随机延迟（以毫秒为单位）
        return Math.floor(Math.random() * 3000);
      }

      const requestQueue = cityStoreList.map(item => {
        const params = {
          cityId: this.cityId,
          storeId: item.id,
          pickupTime: this.pickupTime,
          returnTime: this.returnTime,
        }
        return new Promise(async (resolve, reject) => {
          try {
            setTimeout(async () => {
              const response = await queryList(params)
              console.log(response)
              resolve(response)
            }, getRandomDelay());
          } catch (error) {
            debugger
            reject(error)
          }
        })
      })
      console.log(process.env.NODE_ENV)
      if (process.env.NODE_ENV === 'development') {
        // mock
        setTimeout(() => {
          this.cityStock = cityStockMock
        }, 0);
      } else {
        // 实际
        Promise
          .allSettled(requestQueue)
          .then(results => {
            console.log(results)
            const cityStock = results
              .filter(item => {
                return item.status === 'fulfilled'
              })
              .map(item => {
                return item.value
              })
              .map(item => {
                const cityId = item.config.param.pickupDto.cityId
                const storeId = item.config.param.pickupDto.storeId
                return {
                  cityId,
                  cityName: this.cityMap.get(cityId),
                  storeId,
                  storeName: this.storeMap.get(storeId),
                  stock: item.data.result
                }
              })
            console.log(cityStock);
            this.cityStock = cityStock
          })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.QuickQueryStock {
  position: relative;
}
</style>
