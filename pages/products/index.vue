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
      <template slot="slot-taxable" slot-scope="isIncludedTax">
        <TagYesNo :value_bool="isIncludedTax"/>
      </template>
      <template slot="slot-is-ship-free" slot-scope="isIncludedTax">
        <TagYesNo :value="isIncludedTax"/>
      </template>
      <template slot="slot-is-hide" slot-scope="isDepot">
        <TagYesNo :value_bool="isDepot"/>
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
          <a-form-item label="Allow display">
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
        <a-button :loading="loading_update" :value="this.product.code" type="primary" @click="onUpdate">
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
      isEmpty        : isEmpty,
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    onClose() {
      this.visible = false;
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
      await this.$axios.$get('products/' + code).then((response) => {
        const data   = response.data;
        this.product = {...data}
        is_success   = true;
      }).catch(err => {
        if (err.response !== undefined) {
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
              errors: errors.taxable !== undefined ? [
                {
                  "message": errors.taxable,
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
      const item_url           = e.currentTarget.value

      if (isEmpty(item_url)){
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
    handleTableChange(pagination) {
      const pager     = {...this.pagination};
      pager.current   = pagination.current;
      this.pagination = pager;
      this.fetch({
        results: pagination.pageSize,
        page   : pagination.current,
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
        pagination.pageSize = 25;
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
    width      : '150px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-item-url',
    },
  },
  {
    title      : 'Image',
    dataIndex  : 'image',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-image',
    },
  },
  {
    title    : 'Name',
    dataIndex: 'itemName',
  },
  {
    title    : 'Price',
    dataIndex: 'itemPrice',
    align    : 'center',
    width    : '120px',
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
      customRender: 'slot-is-ship-free',
    },
  },
  {
    title      : 'Hide',
    dataIndex  : 'isDepot',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-is-hide',
    },
  },
];
</script>


