<template>
  <div class="feature feature-product">
    <h2>Product Management</h2>
    <a-table
      :columns="columns"
      :row-key="record => record.itemUrl"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="slot-item-url" slot-scope="itemUrl">
        <a-button type="link" :value="itemUrl" @click="handleClickRow">{{ itemUrl }}</a-button>
      </template>
      <template slot="slot-image" slot-scope="image, product">
        <div class="product-img">
          <template v-if="isEmpty(image)">
            <a-empty :description="false" :image="no_image"/>
          </template>
          <template v-else>
            <img :alt="product.name" :src="image"/>
          </template>
        </div>
      </template>
      <template slot="slot-price" slot-scope="itemPrice">
        {{ '￥' + formatNumber(itemPrice) }}
      </template>
      <template slot="slot-taxable" slot-scope="isIncludedTax">
        <TagYesNo :value="isIncludedTax"/>
      </template>
      <template slot="slot-ship-free" slot-scope="isIncludedPostage">
        <TagYesNo :value="isIncludedPostage"/>
      </template>
      <template slot="slot-hide" slot-scope="isDepot">
        <TagYesNo :value="isDepot"/>
      </template>
      <template slot="slot-reg-date" slot-scope="registDate">
        {{ formatDate(registDate) }}
      </template>
    </a-table>
    <a-drawer
      class="draw-wrap"
      :title="this.product.name"
      :width="720"
      :visible="visible"
      @close="onClose"
    >
      <template v-if="this.loading_product === true">
        <div class="loading-spin">
          <a-spin/>
        </div>
      </template>
      <template>
        <a-form :hidden="this.loading_product" :form="form" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="24">
              <div class="draw-product-img text-center">
                <template v-if="this.isEmpty(this.product.image)">
                  <a-empty :description="false" :image="this.no_image"/>
                </template>
                <template v-else>
                  <img slot="cover"
                       :alt="this.product.image.imageAlt"
                       :src="this.product.image.imageUrl"
                  />
                </template>
              </div>
            </a-col>
          </a-row>
          <a-form-item
            label="Code"
          >
            <a-input
              :value="this.product.itemUrl"
              placeholder="Product code"
            />
          </a-form-item>
          <a-form-item
            label="Name"
          >
            <a-input
              v-decorator="['itemName']"
              placeholder="Product name"
            />
          </a-form-item>
          <a-form-item
            label="Price"
          >
            <a-input-number
              v-decorator="['itemPrice']"
              :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/\￥\s?|(,*)/g, '')"
              style="width: 100%"
              placeholder="Product price"
            />
          </a-form-item>
          <a-form-item label="Taxable">
            <a-radio-group
              v-decorator="['isIncludedTax']">
              <a-radio :value="true">
                <TagYesNo :value="true"/>
              </a-radio>
              <a-radio :value="false">
                <TagYesNo :value="false"/>
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="Free Ship">
            <a-radio-group
              v-decorator="['isIncludedPostage']">
              <a-radio :value="true">
                <TagYesNo :value="true"/>
              </a-radio>
              <a-radio :value="false">
                <TagYesNo :value="false"/>
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="Now Ship">
            <a-radio-group
              v-decorator="['asurakuDeliveryId']">
              <a-radio :value="true">
                <TagYesNo :value="true"/>
              </a-radio>
              <a-radio :value="false">
                <TagYesNo :value="false"/>
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="Hide">
            <a-radio-group
              v-decorator="['isDepot']">
              <a-radio :value="true">
                <TagYesNo :value="true"/>
              </a-radio>
              <a-radio :value="false">
                <TagYesNo :value="false"/>
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </template>
      <div class="drawer-footer">
        <a-button class="btn-close" @click="onClose">
          Cancel
        </a-button>
        <a-button :loading="loading_update" :value="this.product.itemUrl" type="primary" @click="onUpdate">
          Update
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import TagYesNo from '@/components/TagYesNo'
import {Empty} from 'ant-design-vue';

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
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
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

export default {
  beforeCreate() {
    this.no_image = Empty.PRESENTED_IMAGE_SIMPLE;
  },
  middleware: ['auth'],
  components: {
    TagYesNo
  },
  data() {
    return {
      data           : [],
      pagination     : {},
      loading        : true,
      columns,
      form           : this.$form.createForm(this),
      visible        : false,
      loading_product: false,
      product        : {},
      loading_update : false,
      isEmpty,
      formatNumber,
      formatDate,
    };
  },
  mounted() {
    this.fetch({});
  },
  methods: {
    onClose() {
      if (this.loading_update !== true) {
        this.visible = false;
      } else {
        this.$message.warn('Please waiting upload product.')
      }
    },
    async onUpdate(e) {
      const code              = e.currentTarget.value
      this.loading_update     = true;
      let is_success          = false;
      const itemName          = this.form.getFieldValue('itemName');
      const itemPrice         = this.form.getFieldValue('itemPrice');
      const isIncludedTax     = this.form.getFieldValue('isIncludedTax');
      const isIncludedPostage = this.form.getFieldValue('isIncludedPostage');
      const asurakuDeliveryId = this.form.getFieldValue('asurakuDeliveryId');
      const isDepot           = this.form.getFieldValue('isDepot');

      await this.$axios.$post('products/update/' + code, {
        itemName         : itemName,
        itemPrice        : itemPrice,
        isIncludedTax    : isIncludedTax,
        isIncludedPostage: isIncludedPostage,
        asurakuDeliveryId: asurakuDeliveryId,
        isDepot          : isDepot,
      }).then(() => {
        is_success = true;
      }).catch(err => {
        if (err.response !== undefined && err.response.status === 422) {
          const errors = err.response.data.errors;
          this.form.setFields({
            'itemName'         : {
              value : itemName,
              errors: errors.itemName !== undefined ? [
                {
                  "message": errors.itemName,
                }
              ] : null
            },
            'itemPrice'        : {
              value : itemPrice,
              errors: errors.itemPrice !== undefined ? [
                {
                  "message": errors.itemPrice,
                }
              ] : null
            },
            'isIncludedTax'    : {
              value : isIncludedTax,
              errors: errors.isIncludedTax !== undefined ? [
                {
                  "message": errors.isIncludedTax,
                }
              ] : null
            },
            'isIncludedPostage': {
              value : isIncludedPostage,
              errors: errors.isIncludedPostage !== undefined ? [
                {
                  "message": errors.isIncludedPostage,
                }
              ] : null
            },
            'asurakuDeliveryId': {
              value : asurakuDeliveryId,
              errors: errors.asurakuDeliveryId !== undefined ? [
                {
                  "message": errors.asurakuDeliveryId,
                }
              ] : null
            },
            'isDepot'          : {
              value : isDepot,
              errors: null
            },
          });
        }
      });

      this.loading_update = false;
      if (is_success)
        this.$message.success('Update product success.')
      await this.fetch({
        results: this.pagination.pageSize,
        page   : this.pagination.current,
      });
    },
    async handleClickRow(e) {
      const item_url = e.currentTarget.value

      if (isEmpty(item_url)) {
        return;
      }
      this.visible         = true;
      this.loading_product = true;
      this.product         = {};
      await this.$axios.$get('products/' + item_url).then((response) => {
        const data   = response.data;
        this.product = {...data}

        this.form.setFields({
          'itemName'         : {
            value : data.itemName,
            errors: null
          },
          'itemPrice'        : {
            value : data.itemPrice,
            errors: null
          },
          'isIncludedTax'    : {
            value : data.isIncludedTax,
            errors: null
          },
          'isIncludedPostage': {
            value : data.isIncludedPostage,
            errors: null
          },
          'asurakuDeliveryId': {
            value : data.asurakuDeliveryId,
            errors: null
          },
          'isDepot'          : {
            value : data.isDepot,
            errors: null
          },
        });
      }).finally(() => {
        this.loading_product = false;
      });
    },
    handleTableChange(pagination, filters, sorter) {
      const pager     = {...this.pagination};
      pager.current   = pagination.current;
      this.pagination = pager;

      let order;
      if (sorter.order === "ascend") {
        order = 'asc'
      } else if (sorter.order === "descend") {
        order = 'desc'
      } else {
        order = null
      }

      this.fetch({
        results: pagination.pageSize,
        page   : pagination.current,
        sort  : order,
      });
    },
    async fetch(params = {}) {
      this.loading = true;
      let query    = {
        results: 25,
        ...params,
      };
      await this.$axios.$get('products', {params: query}).then((data) => {
        const pagination    = {...this.pagination};
        // Read total count from server
        pagination.total    = data.meta.total;
        pagination.pageSize = data.meta.results;
        this.data           = data.data;
        this.pagination     = pagination;
      }).finally(() => {
        this.loading = false;
      })
    },
  },
}

const columns = [
  {
    title      : 'Code',
    dataIndex  : 'itemUrl',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-item-url',
    },
  },
  {
    title      : 'Image',
    dataIndex  : 'image',
    align      : 'center',
    width      : '100px',
    scopedSlots: {
      customRender: 'slot-image',
    },
  },
  {
    title    : 'Name',
    dataIndex: 'itemName',
  },
  {
    title      : 'Price',
    dataIndex  : 'itemPrice',
    align      : 'center',
    width      : '100px',
    scopedSlots: {
      customRender: 'slot-price',
    },
  },
  {
    title      : 'Taxable',
    dataIndex  : 'isIncludedTax',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-taxable',
    },
  },
  {
    title      : 'Free Ship',
    dataIndex  : 'isIncludedPostage',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-ship-free',
    },
  },
  {
    title      : 'Hide',
    dataIndex  : 'isDepot',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-hide',
    },
  },
  {
    title      : 'Reg Date',
    dataIndex  : 'registDate',
    width      : '120px',
    align      : 'center',
    sorter     : true,
    scopedSlots: {
      customRender: 'slot-reg-date',
    },
  },
];
</script>


