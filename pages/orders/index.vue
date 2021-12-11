<template>
  <div class="feature feature-order">
    <h2>Order Management</h2>
    <a-divider/>
    <a-table
      :columns="columns"
      :row-key="record => record.orderNumber"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="slot-order-number" slot-scope="index">
        <a-button type="link" :value="index" @click="handleClickRow">{{ index }}</a-button>
      </template>
      <template slot="slot-user" slot-scope="index, order">
        {{ order.firstName + order.familyName }}
      </template>
      <template slot="slot-order-time" slot-scope="index">
        {{ formatDate(index) }}
      </template>
      <template slot="slot-total-price" slot-scope="index">
        {{ formatNumber(index) }}
      </template>
      <template slot="slot-order-process" slot-scope="index">
        <a-tag :color="getColor(index)">
          {{ mst_status[index.toString()] }}
        </a-tag>
      </template>
    </a-table>
    <template v-if="order.orderNumber !== null">
      <a-drawer
        :title="order.orderNumber"
        :width="720"
        :closable="false"
        :visible="order.visible"
        @close="onClose"
        class="draw-wrap"
      >
        <template v-if="order.loading === true">
          <div class="loading-spin">
            <a-spin/>
          </div>
        </template>
        <template v-if="order.loading === false && order.data !== {}">
          <a-descriptions class="block-user" title="User Information" :column="24">
            <a-descriptions-item label="Name" :span="12">
              {{ order.user.firstName + order.user.familyName }}
            </a-descriptions-item>
            <a-descriptions-item label="Name Kana" :span="12">
              {{ order.user.firstNameKana + order.user.familyNameKana }}
            </a-descriptions-item>
            <a-descriptions-item label="Birthday" :span="12">
              {{ formatBirthday(order.user.birthYear, order.user.birthMonth, order.user.birthDay) }}
            </a-descriptions-item>
            <a-descriptions-item label="Gender" :span="12">
              {{ order.user.sex }}
            </a-descriptions-item>
            <a-descriptions-item label="City" :span="12">
              {{ order.user.city }}
            </a-descriptions-item>
            <a-descriptions-item label="Prefecture" :span="12">
              {{ order.user.prefecture }}
            </a-descriptions-item>
            <a-descriptions-item label="Email" :span="24">
              <a>{{ order.user.emailAddress }}</a>
            </a-descriptions-item>
          </a-descriptions>
          <a-divider/>
          <a-descriptions class="block-order" title="Order Detail" :column="24">
            <a-descriptions-item label="Order Number" :span="12">
              {{ order.orderNumber }}
            </a-descriptions-item>
            <a-descriptions-item label="Order Time" :span="12">
              {{ formatDate(order.data.orderDatetime) }}
            </a-descriptions-item>
            <a-descriptions-item label="Process" :span="12">
              <a-tag :color="getColor(order.data.orderProgress)">
                <template v-if="order.data.orderProgress !== undefined">
                  {{ mst_status[order.data.orderProgress.toString()] }}
                </template>
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Total Price" :span="12">
              {{ formatNumber(order.data.totalPrice) }}
            </a-descriptions-item>
            <a-descriptions-item label="Remarks" :span="24">
              {{ order.data.remarks }}
            </a-descriptions-item>
          </a-descriptions>
          <a-divider/>
          <a-descriptions class="block-product" title="Products" :column="24">
            <a-descriptions-item :span="4">
              Code
            </a-descriptions-item>
            <a-descriptions-item :span="14">
              Name
            </a-descriptions-item>
            <a-descriptions-item :span="4">
              Price
            </a-descriptions-item>
            <a-descriptions-item :span="2">
              Units
            </a-descriptions-item>
            <template v-for="product in order.products">
              <a-descriptions-item :span="4">
                <a-button type="link" :value="product.itemNumber" :data-name="product.itemName"
                          @click="handleDetailProduct">
                  {{ product.itemNumber }}
                </a-button>
              </a-descriptions-item>
              <a-descriptions-item :span="14">
                {{ product.itemName }}
              </a-descriptions-item>
              <a-descriptions-item :span="4">
                {{ formatNumber(product.price) }}
              </a-descriptions-item>
              <a-descriptions-item :span="2">
                {{ product.units }}
              </a-descriptions-item>
            </template>
          </a-descriptions>
          <template v-if="product.itemUrl !== null">
            <a-drawer
              :title="product.itemName"
              width="640"
              :closable="false"
              :visible="product.visible"
              @close="onCloseProduct"
              class="draw-wrap"
            >
              <template v-if="product.loading === true">
                <div class="loading-spin">
                  <a-spin/>
                </div>
              </template>
              <template v-if="product.loading !== true && product.data !== {}">
                <a-descriptions :column="24" class="text-center">
                  <a-descriptions-item :span="24">
                    <div class="draw-product-img text-center">
                      <template v-if="this.isEmpty(this.product.data.image)">
                        <a-empty :description="false" :image="this.no_image"/>
                      </template>
                      <template v-else>
                        <img slot="cover"
                             :src="product.data.image"
                        />
                      </template>
                    </div>
                  </a-descriptions-item>
                </a-descriptions>
                <a-divider/>
                <a-descriptions :column="24">
                  <a-descriptions-item label="Code" :span="24">
                    <a>{{ product.data.itemNumber }}</a>
                  </a-descriptions-item>
                  <a-descriptions-item label="Name" :span="24">
                    {{ product.data.itemName }}
                  </a-descriptions-item>
                  <a-descriptions-item label="Price" :span="24">
                    {{ formatNumber(product.data.itemPrice) }}
                  </a-descriptions-item>
                  <a-descriptions-item label="Taxable" :span="8">
                    <TagYesNo :value="product.data.isIncludedTax"/>
                  </a-descriptions-item>
                  <a-descriptions-item label="Free Ship" :span="8">
                    <TagYesNo :value="product.data.isIncludedPostage"/>
                  </a-descriptions-item>
                  <a-descriptions-item label="Hide" :span="8">
                    <TagYesNo :value="product.data.isDepot"/>
                  </a-descriptions-item>
                </a-descriptions>
              </template>
            </a-drawer>
          </template>
        </template>
      </a-drawer>
    </template>
  </div>
</template>
<script>
import {Empty} from "ant-design-vue";

export default {
  middleware: ['auth'],
  beforeCreate() {
    this.no_image = Empty.PRESENTED_IMAGE_SIMPLE;
  },
  data() {
    return {
      data      : [],
      pagination: {},
      loading   : true,
      mst_status: [],
      columns,
      isEmpty,
      formatNumber,
      formatDate,
      getColor,
      formatBirthday,
      renderRakutenUrl,

      order: {
        data       : {},
        loading    : false,
        orderNumber: null,
        visible    : false,
        user       : {},
        products   : [],
      },

      product: {
        data      : {},
        loading   : false,
        itemNumber: null,
        itemName  : '',
        visible   : false,
      },
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    onClose() {
      this.order.visible = false;
    },
    async handleDetailProduct(e) {
      const itemNumber = e.currentTarget.value;
      const itemName   = e.currentTarget.getAttribute('data-name');

      if (isEmpty(itemNumber)) {
        return;
      }

      this.product.visible  = true;
      this.product.loading  = true;
      this.product.data     = {};
      this.product.itemName = itemName;

      await this.$axios.$get('products/' + itemNumber).then((response) => {
        const data              = response.data;
        this.product.itemNumber = data.itemUrl;
        this.product.data       = {...data}
      }).finally(() => {
        this.product.loading = false;
      });
    },
    onCloseProduct() {
      this.product.visible = false;
    },

    handleTableChange(pagination, filters, sorter) {
      const pager     = {...this.pagination};
      pager.current   = pagination.current;
      this.pagination = pager;
      this.fetch({
        results  : pagination.pageSize,
        page     : pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...filters,
      });
    },
    fetch(params = {}) {
      this.loading = true;
      let query    = {
        results: 25,
        ...params,
      };
      this.$axios.$get('orders', {params: query}).then((data) => {
        const pagination    = {...this.pagination};
        // Read total count from server
        pagination.total    = data.meta.total;
        pagination.pageSize = data.meta.results;
        this.mst_status     = data.meta.mst_status;
        this.loading        = false;
        this.data           = data.data;
        this.pagination     = pagination;
      });
    },
    async handleClickRow(e) {
      const order_number = e.currentTarget.value;
      if (isEmpty(order_number)) {
        return;
      }
      this.order.visible     = true;
      this.order.loading     = true;
      this.order.data        = {};
      this.order.orderNumber = order_number;
      this.order.user        = {};
      this.order.products    = [];

      await this.$axios.$get('orders/' + order_number).then((response) => {
        const data           = response.data;
        this.order.data      = {...data}
        this.order.user      = {...data.OrdererModel}
        let packageModelList = data.PackageModelList;
        packageModelList     = packageModelList.length > 0 ? packageModelList[0] : null;
        this.order.products  = packageModelList === null ? [] : {...packageModelList.ItemModelList}
      }).finally(() => {
        this.order.loading = false;
      });
    },
  },
}

const columns = [
  {
    title      : 'Order Number',
    dataIndex  : 'orderNumber',
    width      : '250px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-order-number',
    },
  },
  {
    title      : 'User',
    dataIndex  : '',
    scopedSlots: {
      customRender: 'slot-user',
    },
  },
  {
    title      : 'Order Time',
    dataIndex  : 'orderDatetime',
    width      : '200px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-order-time',
    },
  },
  {
    title      : 'Total Price',
    dataIndex  : 'totalPrice',
    align      : 'center',
    width      : '100px',
    scopedSlots: {
      customRender: 'slot-total-price',
    },
  },
  {
    title      : 'Progress',
    dataIndex  : 'orderProgress',
    width      : '150px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-order-process',
    },
  },
  {
    title    : 'Prefecture',
    dataIndex: 'prefecture',
    width    : '150px',
    align    : 'center',
  },
];

function isEmpty(value) {
  return value === '' || value === undefined || value === [] || value === null;
}

function formatNumber(value) {
  value += '';
  const list   = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num      = prefix ? list[0].slice(1) : list[0];
  let result   = '';
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num    = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return '￥' + `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
}

function formatDate(value) {
  let date = new Date(value)
  return date.getFullYear() + "/" + ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
    ("00" + date.getDate()).slice(-2) +
    " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);
}

function getColor(status) {
  let color;
  switch (status) {
    case 100:
      color = 'green'
      break;
    case 200:
      color = 'cyan'
      break;
    case 300:
      color = 'blue'
      break;
    case 400:
      color = 'yellow'
      break;
    case 500:
      color = 'purple'
      break;
    case 600:
      color = 'pink'
      break;
    case 700:
      color = 'orange'
      break;
    case 800:
      color = 'red'
      break;
    case 900:
      color = 'black'
      break;
    default:
      color = ''
      break;
  }

  return color;
}

function formatBirthday(year, month, date) {
  year  = year === undefined ? '0000' : year;
  month = month === undefined ? '00' : month;
  date  = date === undefined ? '00' : date;

  month = month >= 10 ? month.toString() : '0' + month.toString();
  date  = date >= 10 ? date.toString() : '0' + date.toString();

  return year + '-' + month + '-' + date;
}

function renderRakutenUrl(item_url) {
  return "https://item.rakuten.co.jp/_shop_53618/" + item_url;
}
</script>
