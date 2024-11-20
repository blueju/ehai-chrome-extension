<template>
  <div class="card" :class="{ 'card--hide': isHide }">
    <Header />
    <!-- <div class="app-container">
      <p>TemperMonkey UserScript</p>
      <p>使用Vue3.0 + Antd-Design-Vue开发油猴插件。</p>
      <p>Antd-Design-Vue需要按需引入以减少脚本打包体积，可在<a-tag>utils/antd.js</a-tag>引入需要的UI组件。</p>
      <a-button type="primary">从这里开始探索吧！</a-button>
    </div> -->

    <a-divider />

    <a-select v-model:value="storeId" show-search placeholder="Select a person" style="width: 100%;"
      :options="storeOptions" :filter-option="filterOption" @change="handleChange" @select="handleChange"></a-select>
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
        使用天数：<a-input-number v-model:value="usageDays" :min="1" :max="5" style="margin-right: 20px;" />
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
    <a-table :columns="newEnergyTableColumns" :data-source="allNewEnergyCar" :pagination="false"></a-table>

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
      storeList: [],
      // 车型列表
      carLevel: [],
      // 门店数据
      store: undefined,
      // 库存
      stock: [],
      // 门店ID
      storeId: 2596,
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
          title: '【新能源】',
          dataIndex: 'carType',
          key: 'carType',
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
        {
          title: '从舒适升级',
          dataIndex: 'upgradeFromComfort',
          key: 'upgradeFromComfort',
          customRender: ({ _, record }) => {
            if (this.allComfortCar.length === 0) {
              return '/'
            }
            const totalPrice = record.priceItemList[0].totalPrice
            const topSuitablePrice = this.findTopSuitablePrice(totalPrice, [...this.comfortCarPriceSet])
            // 差价
            const priceDifference = totalPrice - topSuitablePrice
            // 成本
            const cost = priceDifference + 127 * this.usageDays
            return `${cost}（+${priceDifference}）`
          }
        },
        {
          title: '从精英升级',
          key: 'upgradeFromBetter',
          dataIndex: 'upgradeFromBetter',
          customRender: ({ _, record }) => {
            if (this.allBetterCar.length === 0) {
              return '/'
            }
            const totalPrice = record.priceItemList[0].totalPrice
            const topSuitablePrice = this.findTopSuitablePrice(totalPrice, [...this.betterCarPriceSet])
            // 差价
            const priceDifference = totalPrice - topSuitablePrice
            const cost = priceDifference + 187 * this.usageDays
            return `${cost}（+${priceDifference}）`
          }
        },
      ]
    }
  },
  mounted() {
    this.queryStoreList()
    this.queryCarLevel()
  },
  computed: {
    // 门店选项
    storeOptions() {
      return this.storeList.map(item => {
        return {
          ...item,
          label: item.name,
          value: item.id,
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
    // 查找最高合适的价格
    // eg.如果海口新速腾比新能源还贵，总不能让一嗨倒贴钱吧，所以此时要跟第二贵的车价比，再补差价
    findTopSuitablePrice(totalPrice, prices) {
      // 先对价格数组进行排序
      const sortedPrices = [...prices].sort((x, y) => y - x); // 从大到小排序
      // 找到最大值
      const maxPrice = sortedPrices[0];
      // 如果价格 totalPrice 小于最大值
      if (totalPrice < maxPrice) {
        for (let i = 1; i < sortedPrices.length; i++) {
          // 找到第一个小于 totalPrice 的价格
          if (sortedPrices[i] < totalPrice) {
            return sortedPrices[i]; // 返回第一个比 totalPrice 小的价格
          }
        }
        // 如果没有找到比 totalPrice 小的价格，返回 null 或其他值
        return null;
      }
      // 如果 totalPrice 大于等于最大值，返回最大值
      return maxPrice;
    },
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
    pickupHourChange(e) {
      console.log(e);

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
    handleChange(storeId, option) {
      this.storeId = storeId
      this.store = option
    },
    confirm() {
      const params = {
        cityId: this.store.cityId,
        storeId: this.storeId,
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
.card {
  padding: 10px;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100%;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.5s;
  box-shadow: 2px 3px 3px 0 rgba(0, 0, 0, .1);
}

.card__btn {
  transition: all 0.5s;
  border-radius: 30px 0 0 30px;
  width: 30px;
  height: 60px;
  background-color: rgb(178, 94, 239);
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;

  svg {
    height: 20px;
    width: 20px;
    position: absolute;
    right: 5px;
    top: 20px;
    transition: all 0.5s;
  }
}

.card--hide {
  left: -420px;

  .card__btn {
    border-radius: 0 30px 30px 0;
    right: -30px;

    svg {
      transform: rotate(180deg);
    }
  }
}
</style>
