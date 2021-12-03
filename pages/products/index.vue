<template>
  <div class="feature feature-product">
    <h2>Product Management</h2>
    <a-table
      :columns="columns"
      :row-key="record => record.code"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="slot-code" slot-scope="code">
        <a-button type="link" :value="code" @click="handleClickRow">{{ code }}</a-button>
      </template>
      <template slot="slot-image" slot-scope="image_url, product">
        <a-button type="link" :value="product.code" @click="handleClickRow">
          <div class="product-img"><img :alt="product.name" :src="image_url"/></div>
        </a-button>
      </template>
      <template slot="slot-taxable" slot-scope="taxable">
        <TagYesNo :value_bool="taxable"/>
      </template>
      <template slot="slot-is-ship-free" slot-scope="is_ship_free">
        <TagYesNo :value="is_ship_free"/>
      </template>
      <template slot="slot-is-ship-now" slot-scope="is_ship_now">
        <TagYesNo :value_bool="is_ship_now"/>
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
                <img slot="cover"
                     :alt="this.product.name"
                     :src="this.product.image_url"
                />
              </div>
            </a-col>
          </a-row>
          <a-form-item
            label="Code"
          >
            <a-input
              :value="this.product.code"
              placeholder="Product code"
            />
          </a-form-item>
          <a-form-item
            label="Name"
          >
            <a-input
              v-decorator="['name']"
              placeholder="Product name"
            />
          </a-form-item>
          <a-form-item
            label="Price"
          >
            <a-input-number
              v-decorator="['price']"
              :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/\￥\s?|(,*)/g, '')"
              style="width: 100%"
              placeholder="Product price"
            />
          </a-form-item>
          <a-form-item label="Taxable">
            <a-radio-group
              v-decorator="['taxable']">
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
              v-decorator="['is_ship_free']">
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
              v-decorator="['is_ship_now']">
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

export default {
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
      const code          = e.currentTarget.value
      this.loading_update = true;
      let is_success      = false;
      const name          = this.form.getFieldValue('name');
      const price         = this.form.getFieldValue('price');
      const taxable       = this.form.getFieldValue('taxable');
      const is_ship_free  = this.form.getFieldValue('is_ship_free');
      const is_ship_now   = this.form.getFieldValue('is_ship_now');
      await this.$axios.$get('products/' + code).then((response) => {
        const data   = response.data;
        this.product = {...data}
        is_success   = true;
      }).catch(err => {
        if (err.response !== undefined) {
          const errors = err.response.data.errors;
          this.form.setFields({
            'name'        : {
              value : name,
              errors: errors.name !== undefined ? [
                {
                  "message": errors.name,
                }
              ] : null
            },
            'price'       : {
              value : price,
              errors: errors.price !== undefined ? [
                {
                  "message": errors.price,
                }
              ] : null
            },
            'taxable'     : {
              value : taxable,
              errors: errors.taxable !== undefined ? [
                {
                  "message": errors.taxable,
                }
              ] : null
            },
            'is_ship_free': {
              value : is_ship_free,
              errors: errors.is_ship_free !== undefined ? [
                {
                  "message": errors.is_ship_free,
                }
              ] : null
            },
            'is_ship_now' : {
              value : is_ship_now,
              errors: errors.is_ship_now !== undefined ? [
                {
                  "message": errors.is_ship_now,
                }
              ] : null
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
      this.visible         = true;
      this.loading_product = true;
      this.product         = {};
      const code           = e.currentTarget.value
      await this.$axios.$get('products/' + code).then((response) => {
        const data   = response.data;
        this.product = {...data}

        this.form.setFields({
          'name'        : {
            value : data.name,
            errors: null
          },
          'price'       : {
            value : data.price,
            errors: null
          },
          'taxable'     : {
            value : data.taxable,
            errors: null
          },
          'is_ship_free': {
            value : data.is_ship_free,
            errors: null
          },
          'is_ship_now' : {
            value : data.is_ship_now,
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
    title      : 'Product Code',
    dataIndex  : 'code',
    width      : '150px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-code',
    },
  },
  {
    title      : 'Image',
    dataIndex  : 'image_url',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-image',
    },
  },
  {
    title    : 'Product Name',
    dataIndex: 'name',
  },
  {
    title    : 'Product Price',
    dataIndex: 'price',
    align    : 'center',
    width    : '120px',
  },
  {
    title      : 'Taxable',
    dataIndex  : 'taxable',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-taxable',
    },
  },
  {
    title      : 'Free Ship',
    dataIndex  : 'is_ship_free',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-is-ship-free',
    },
  },
  {
    title      : 'Now Ship',
    dataIndex  : 'is_ship_now',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-is-ship-now',
    },
  },
];
</script>


