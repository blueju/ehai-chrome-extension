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

    <div class="card__btn" @click="hide">
      <svg t="1589962875590" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="2601">
        <path
          d="M730.020653 1018.946715l91.277028-89.978692a16.760351 16.760351 0 0 0 5.114661-11.803064 15.343983 15.343983 0 0 0-5.114661-11.803064l-400.123871-393.435467L821.691117 118.254899a17.075099 17.075099 0 0 0 0-23.606129L730.020653 4.670079a17.232473 17.232473 0 0 0-23.999564 0L202.030255 500.08402a16.445603 16.445603 0 0 0-4.721226 11.803064 15.265296 15.265296 0 0 0 5.114661 11.803064l503.597399 495.413941a17.153786 17.153786 0 0 0 23.999564 0z m0 0"
          fill="#FFFFFF" p-id="2602"></path>
      </svg>
    </div>
  </div>
</template>

<script>
import Header from './Header.vue'
import stockMock from './stockMock.json'
import queryList from './queryList';
import dayjs from 'dayjs'

export default {
  name: 'Card',
  components: { Header },
  data() {
    return {
      isHide: false,
      isWednesday: dayjs().day() === 3 ? true : false,
      isAdd51: true,
      // 门店列表
      cityList: [],
      // 车型列表
      carLevel: [],
      // 门店数据
      city: undefined,
      // 库存
      stock: [],
      // 城市ID
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
        .then(resJson => {
          this.storeList = resJson
          const store = resJson.find(item => {
            return item.id === 2596
          })
          this.store = store
        })
    },
    // 查询门店列表
    queryCityList() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/cityList')
        .then(res => res.json())
        .then(resJson => {
          this.cityList = resJson
          const city = resJson.find(item => {
            // 21 深圳
            return item.id === 21
          })
          this.city = city
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
    hide() {
      this.isHide = !this.isHide
    },
    filterOption(input, option) {
      return option.label.indexOf(input) >= 0
    },
    handleChange(cityId, option) {
      this.cityId = cityId
      this.city = option
    },
    confirm() {
      // 城市门店
      const cityStoreList = this.storeList.filter(item => {
        return item.cityId === this.cityId
      })
      console.log(cityStoreList)

      const requestQueue = cityStoreList.map(item => {
        const params = {
          cityId: this.cityId,
          storeId: item.id,
          pickupTime: this.pickupTime,
          returnTime: this.returnTime,
        }
        return queryList(params)
      })
      console.log(requestQueue)

      requestQueue.allSettled().then(value => {
        console.log(value)
      })


      return
      const params = {
        cityId: this.city.cityId,
        storeId: this.cityId,
        pickupTime: this.pickupTime,
        returnTime: this.returnTime,
      }
      console.log(process.env.NODE_ENV)
      if (process.env.NODE_ENV === 'development') {
        // mock
        setTimeout(() => {
          this.stock = stockMock
          compute(stockMock)
        }, 0);
      } else {
        // 实际
        queryList(params)
          .then(res => {
            console.log(res)
            this.stock = res.data.result.carTypeList
            compute(res.data.result.carTypeList)
          })
          .catch(err => {
            console.log(err)
          })
      }

      const compute = (stock) => {
        // 新能源
        const allNewEnergyCar = stock.filter(item => {
          return item.carTypeItem.carLevelId === this.carLevel['newEnergy'].carLevelId
        })
        this.allNewEnergyCar = allNewEnergyCar
        // 计算最高的舒适车价格
        const comfortCar = stock.filter(item => {
          return item.carTypeItem.carLevelId === this.carLevel['comfortCar'].carLevelId
        })
        this.allComfortCar = comfortCar
        if (comfortCar.length) {
          const comfortCarPriceSet = new Set()
          comfortCar.forEach(item => {
            comfortCarPriceSet.add(item.priceItemList[0].totalPrice)
          })
          this.comfortCarPriceSet = comfortCarPriceSet
          const topComfortCarPrice = Math.max(...comfortCarPriceSet)
          this.topComfortCarPrice = topComfortCarPrice
        }
        // 计算最高的精英车价格
        const betterCar = stock.filter(item => {
          return item.carTypeItem.carLevelId === this.carLevel['betterCar'].carLevelId
        })
        this.allBetterCar = betterCar
        if (betterCar.length) {
          const betterCarPriceSet = new Set()
          betterCar.forEach(item => {
            betterCarPriceSet.add(item.priceItemList[0].totalPrice)
          })
          this.betterCarPriceSet = betterCarPriceSet
          const topBetterCarPriceSet = Math.max(...betterCarPriceSet)
          this.topBetterCarPrice = topBetterCarPriceSet
        }

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
