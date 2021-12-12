<template>
  <div class="feature feature-product">
    <h2>Product Management</h2>
    <a-divider/>
    <div class="search-product">
      <a-row :gutter="24">
        <a-col :lg="{ span: 24, offset: 0 }" :xl="{ span: 16, offset: 4 }">
          <div class="search-keyword">
            <div class="search-bar">
              <a-input-search
                placeholder="Enter product code or product name"
                :loading="loading"
                @search="onSearch"
              />
            </div>
          </div>
          <div class="search-condition">
            <a-tree
              :selectable="false"
              :checkable="true"
              @check="onCheck"
              @expand="onExpand"
            >
              <a-icon slot="switcherIcon" type="filter"/>
              <a-tree-node
                key="0"
                title="Search condition"
                :checkable="false"
                class="chk-search"
              >
                <a-tree-node class="chk-item" key="isIncludedTax" title="Taxable" :checkable="true" isLeaf/>
                <a-tree-node class="chk-item" key="isIncludedPostage" title="Free Ship" :checkable="true" isLeaf/>
                <a-tree-node class="chk-item" key="asurakuDeliveryId" title="Now Ship" :checkable="true" isLeaf/>
                <a-tree-node class="chk-item" key="isDepot" title="Hide" :checkable="true" isLeaf/>
              </a-tree-node>
            </a-tree>
          </div>
          <div class="group-action">
            <!--            <a-button
                          type="default"
                          icon="reload"
                          :disabled="!this.is_active"
                          @click="onReload"
                        >
                          Clear filter
                        </a-button>-->
            <a-button
              type="primary"
              icon="plus"
              @click="handleBtnAdd"
            >
              Post product
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>
    <a-table
      :scroll="{ x: 1366 }"
      :columns="columns"
      :row-key="record => record.itemUrl"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="slot-item-url" slot-scope="itemUrl, product">
        <a-button type="link" :value="itemUrl" @click="handleClickRow" :data-name="product.itemName">
          {{ itemUrl }}
        </a-button>
      </template>
      <template slot="slot-image" slot-scope="image, product">
        <div class="product-img">
          <template v-if="isEmpty(image)">
            <a-empty :description="false" :image="no_image"/>
          </template>
          <template v-else>
            <img :alt="product.itemName" :src="image"/>
          </template>
        </div>
      </template>
      <template slot="slot-review" slot-scope="index, product">
        <a target="_blank" :href="renderRakutenUrl(product.itemUrl)">
          <a-icon class="icon-review" type="eye"/>
        </a>
      </template>
      <template slot="slot-price" slot-scope="index">
        {{ formatNumber(index) }}
      </template>
      <template slot="slot-taxable" slot-scope="index">
        <TagYesNo :value="index"/>
      </template>
      <template slot="slot-free-ship" slot-scope="index">
        <TagYesNo :value="index"/>
      </template>
      <template slot="slot-now-ship" slot-scope="index">
        <TagYesNo :value="index"/>
      </template>
      <template slot="slot-hide" slot-scope="index">
        <TagYesNo :value="index"/>
      </template>
      <template slot="slot-reg-date" slot-scope="registDate">
        {{ formatDate(registDate) }}
      </template>
      <template slot="slot-action" slot-scope="index, product">
        <a-button
          icon="edit"
          type="primary"
          @click="handleClickRow"
          :data-name="product.itemName"
          :value="product.itemUrl"
        />
        <a-button
          icon="delete"
          type="danger"
          @click="showDeleteConfirm"
          :data-name="product.itemName"
          :value="product.itemUrl"
        />
      </template>
    </a-table>
    <a-drawer
      class="draw-wrap"
      :title="product.title"
      :width="720"
      :visible="product.visible"
      @close="onClose"
    >
      <template v-if="product.loading === true">
        <div class="loading-spin">
          <a-spin/>
        </div>
      </template>
      <template>
        <a-form :hidden="product.loading === true || product.data === {}" :form="form" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="24">
              <div class="draw-product-img text-center">
                <template v-if="this.isEmpty(product.data.image)">
                  <a-empty :description="false" :image="this.no_image"/>
                </template>
                <template v-else>
                  <img slot="cover" :src="product.data.image"
                  />
                </template>
              </div>
            </a-col>
          </a-row>
          <a-divider/>
          <a-form-item
            label="Code"
          >
            <a-input-number
              v-decorator="['itemUrl']"
              placeholder="Product code"
              :disabled="product.is_update"
              style="width: 100%"
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
          <a-divider/>
        </a-form>
      </template>
      <div class="drawer-footer">
        <template v-if="product.is_update">
          <a-button :loading="product.loading_submit" :value="product.itemUrl" type="primary" @click="onUpdate">
            Update
          </a-button>
        </template>
        <template v-else>
          <a-button :loading="product.loading_submit" type="primary" @click="onStore">
            Post
          </a-button>
        </template>
        <a-button class="btn-close" @click="onClose">
          Cancel
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import TagYesNo from '@/components/TagYesNo'
import {Empty} from 'ant-design-vue';

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
      data:       [],
      pagination: {},
      loading:    true,
      columns,
      form:       this.$form.createForm(this),
      product:    {
        data:           {},
        loading:        false,
        image:          null,
        itemName:       '',
        visible:        false,
        is_update:      false,
        loading_submit: false,
      },
      is_active:  false,
      params:     {
        isIncludedTax:     null,
        isIncludedPostage: null,
        asurakuDeliveryId: null,
        isDepot:           null,
      },

      isEmpty,
      formatNumber,
      formatDate,
      renderRakutenUrl,
    };
  },
  mounted() {
    this.fetch({});
  },
  methods: {
    onCheck(checkedKeys) {
      let isIncludedTax     = checkedKeys.indexOf('isIncludedTax') !== -1;
      let isIncludedPostage = checkedKeys.indexOf('isIncludedPostage') !== -1;
      let asurakuDeliveryId = checkedKeys.indexOf('asurakuDeliveryId') !== -1;
      let isDepot           = checkedKeys.indexOf('isDepot') !== -1;

      this.params = {
        ...this.params,
        isIncludedTax:     isIncludedTax,
        isIncludedPostage: isIncludedPostage,
        asurakuDeliveryId: asurakuDeliveryId,
        isDepot:           isDepot,
      }
    },
    onExpand(expandedKeys, {expanded}) {
      if (expanded === false) {
        this.params = {
          ...this.params,
          isIncludedTax:     null,
          isIncludedPostage: null,
          asurakuDeliveryId: null,
          isDepot:           null,
        }
      }
      this.is_active = expanded;
    },

    /* onReload() {
       this.is_active = false;
       this.params    = {
         ...this.params,
         isIncludedTax    : null,
         isIncludedPostage: null,
         asurakuDeliveryId: null,
         isDepot          : null,
       }
       this.fetch({
         page: 1,
       });
     },*/
    onClose() {
      if (this.product.loading_submit !== true) {
        this.product.visible = false;
      } else {
        this.$message.warn('Please waiting upload product.')
      }
    },
    onSearch(value) {
      let params = this.is_active ? {...this.params} : {};
      params     = {
        ...params,
        keyword: value,
        page:    1,
      }
      this.fetch(params);
    },
    async onUpdate(e) {
      const code                  = e.currentTarget.value
      this.product.loading_submit = true;
      let is_success              = false;

      let data = {
        itemName:          this.form.getFieldValue('itemName'),
        itemPrice:         this.form.getFieldValue('itemPrice'),
        isIncludedTax:     this.form.getFieldValue('isIncludedTax'),
        isIncludedPostage: this.form.getFieldValue('isIncludedPostage'),
        asurakuDeliveryId: this.form.getFieldValue('asurakuDeliveryId'),
        isDepot:           this.form.getFieldValue('isDepot'),
      }

      await this.$axios.$put('products/' + code, data).then((response) => {
        is_success        = true;
        const data        = response.data;
        this.product.data = {...data}
        this.setFormData(this.product.data)
      }).catch(err => {
        if (err.response !== undefined && err.response.status === 422) {
          const errors = err.response.data.errors;
          this.setFormData(data, errors)
        }
      });

      this.product.loading_submit = false;
      if (is_success) {
        this.$message.success('Update product success.')
        await this.fetch({
          page: this.pagination.current,
        });
      }
    },

    async onStore() {
      this.product.loading_submit = true;
      let is_success              = false;

      let data = {
        itemUrl:           this.form.getFieldValue('itemUrl'),
        itemName:          this.form.getFieldValue('itemName'),
        itemPrice:         this.form.getFieldValue('itemPrice'),
        isIncludedTax:     this.form.getFieldValue('isIncludedTax'),
        isIncludedPostage: this.form.getFieldValue('isIncludedPostage'),
        asurakuDeliveryId: this.form.getFieldValue('asurakuDeliveryId'),
        isDepot:           this.form.getFieldValue('isDepot'),
      }

      await this.$axios.$post('products', data).then(() => {
        is_success = true;
        this.setFormData(data)
      }).catch(err => {
        if (err.response !== undefined && err.response.status === 422) {
          const errors = err.response.data.errors;
          this.setFormData(data, errors)
        }
      });

      this.product.loading_submit = false;
      if (is_success) {
        this.product.visible   = false;
        this.product.is_update = true;
        this.$message.success('Post product success.')
        await this.fetch({
          page: this.pagination.current,
        });
      }
    },

    async showDeleteConfirm(e) {
      const item_url = e.currentTarget.value

      if (isEmpty(item_url)) {
        return;
      }
      const itemName = e.currentTarget.getAttribute('data-name');
      this.$confirm({
        title:      'Are you sure delete ' + item_url + ' ?',
        content:    itemName,
        okText:     'Yes',
        okType:     'danger',
        cancelText: 'No',
        onOk:       async () => {
          let is_success = false;
          await this.$axios.$delete('products/' + item_url).then(() => {
            is_success = true;
          }).finally(() => {
            this.product.loading = false;
          });

          if (is_success) {
            await this.fetch({
              page: this.pagination.current,
            });
            this.$message.success('Delete success.')
          }

        },
      });
    },

    handleBtnAdd() {
      this.setFormData({})
      this.product.title     = 'Post product';
      this.product.is_update = false;
      this.product.visible   = true;
      this.product.loading   = false;
    },

    async handleClickRow(e) {
      const item_url = e.currentTarget.value

      if (isEmpty(item_url)) {
        return;
      }
      this.product.itemUrl   = item_url;
      this.product.title     = e.currentTarget.getAttribute('data-name');
      this.product.data      = {};
      this.product.is_update = true;
      this.product.loading   = true;
      this.product.visible   = true;

      await this.$axios.$get('products/' + item_url).then((response) => {
        const data        = response.data;
        this.product.data = {...data}
        this.setFormData(this.product.data)
      }).finally(() => {
        this.product.loading = false;
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
        page:    pagination.current,
        sort:    order,
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
        this.data           = data.data
        this.pagination     = pagination;
      }).finally(() => {
        this.loading = false;
      })
    },

    setFormData(data = {}, errors = {}) {
      this.form.setFields({
        'itemUrl':           {
          value:  data.itemUrl,
          errors: errors.itemUrl !== undefined ? [
            {
              "message": errors.itemUrl,
            }
          ] : null
        },
        'itemName':          {
          value:  data.itemName,
          errors: errors.itemName !== undefined ? [
            {
              "message": errors.itemName,
            }
          ] : null
        },
        'itemPrice':         {
          value:  data.itemPrice,
          errors: errors.itemPrice !== undefined ? [
            {
              "message": errors.itemPrice,
            }
          ] : null
        },
        'isIncludedTax':     {
          value:  data.isIncludedTax,
          errors: errors.isIncludedTax !== undefined ? [
            {
              "message": errors.isIncludedTax,
            }
          ] : null
        },
        'isIncludedPostage': {
          value:  data.isIncludedPostage,
          errors: errors.isIncludedPostage !== undefined ? [
            {
              "message": errors.isIncludedPostage,
            }
          ] : null
        },
        'asurakuDeliveryId': {
          value:  data.asurakuDeliveryId,
          errors: errors.asurakuDeliveryId !== undefined ? [
            {
              "message": errors.asurakuDeliveryId,
            }
          ] : null
        },
        'isDepot':           {
          value:  data.isDepot,
          errors: errors.isDepot !== undefined ? [
            {
              "message": errors.isDepot,
            }
          ] : null
        },
      });
    }
  },
}

const columns = [
  {
    title:       'Code',
    dataIndex:   'itemUrl',
    width:       '100px',
    align:       'center',
    scopedSlots: {
      customRender: 'slot-item-url',
    },
  },
  {
    title:       'Image',
    dataIndex:   'image',
    align:       'center',
    width:       '80px',
    scopedSlots: {
      customRender: 'slot-image',
    },
  },
  {
    title:     'Name',
    dataIndex: 'itemName',
  },
  {
    title:       'Price',
    dataIndex:   'itemPrice',
    align:       'center',
    width:       '100px',
    scopedSlots: {
      customRender: 'slot-price',
    },
  },
  {
    title:       'Taxable',
    dataIndex:   'isIncludedTax',
    width:       '100px',
    align:       'center',
    scopedSlots: {
      customRender: 'slot-taxable',
    },
  },
  {
    title:       'Free Ship',
    dataIndex:   'isIncludedPostage',
    width:       '100px',
    align:       'center',
    scopedSlots: {
      customRender: 'slot-free-ship',
    },
  },
  {
    title:       'Now Ship',
    dataIndex:   'asurakuDeliveryId',
    width:       '100px',
    align:       'center',
    scopedSlots: {
      customRender: 'slot-now-ship',
    },
  },
  {
    title:       'Hide',
    dataIndex:   'isDepot',
    width:       '100px',
    align:       'center',
    scopedSlots: {
      customRender: 'slot-hide',
    },
  },
  {
    title:       'Action',
    dataIndex:   'action',
    width:       100,
    align:       'center',
    scopedSlots: {
      customRender: 'slot-action',
    },
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

function renderRakutenUrl(item_url) {
  return "https://item.rakuten.co.jp/_shop_53618/" + item_url;
}
</script>


