<template>
  <div class="feature feature-product">
    <h2>Product Management</h2>
    <a-divider/>
    <div class="search-product">
      <a-row :gutter="24">
        <a-col :lg="{ span: 24, offset: 0 }" :xl="{ span: 16, offset: 4 }">
          <div class="search-group search-keyword">
            <div class="search-bar">
              <a-input-search
                placeholder="Enter product code or product name"
                :loading="loading"
                @search="onSearchKeyword"
              />
            </div>
          </div>
          <div class="search-group group-action">
            <a-button
              type="dashed"
              icon="filter"
              @click="onClickSearchFilter"
            >
              {{ search.title }}
            </a-button>
            <a-button
              type="default"
              icon="plus"
              @click="handleBtnAdd"
            >
              Post product
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>
    <div class="overview">
      <span>From <span class="overview-value">{{ this.from }}</span> to <span class="overview-value">{{
          this.to
        }}</span> of <span class="overview-value">{{ this.total }}</span> rows.</span>
    </div>
    <a-table
      :scroll="{ x: 1200 }"
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
            <img alt="" :src="image"/>
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
            <a-col :span="12">
              <div class="draw-product-img text-center">
                <template v-if="this.isEmpty(product.data.image)">
                  <a-empty :description="false" :image="this.no_image"/>
                </template>
                <template v-else>
                  <img slot="cover" :src="product.data.image" alt=""/>
                </template>
              </div>
            </a-col>
            <a-col :span="12">
              <a-upload
                name="image"
                list-type="picture-card"
                class="draw-product-img text-center"
                :show-upload-list="false"
                :before-upload="beforeUpload"
                @change="handleChange"
              >
                <img v-if="imageUrl" :src="imageUrl" alt="avatar"/>
                <div v-else>
                  <a-icon :type="loading_image ? 'loading' : 'plus'"/>
                  <div class="ant-upload-text">
                    Upload
                  </div>
                </div>
              </a-upload>
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
        </a-form>
      </template>
      <div class="drawer-footer">
        <template v-if="product.is_update">
          <a-button
            :loading="product.loading_submit"
            :value="product.itemUrl"
            type="primary"
            icon="edit"
            @click="onUpdate"
          >
            Update
          </a-button>
        </template>
        <template v-else>
          <a-button
            :loading="product.loading_submit"
            type="primary"
            @click="onStore"
            icon="form"
          >
            Post
          </a-button>
        </template>
        <a-button
          icon="close"
          @click="onClose"
        >
          Cancel
        </a-button>
      </div>
    </a-drawer>
    <a-drawer
      class="draw-wrap"
      :title="search.title"
      :width="440"
      :visible="search.visible"
      @close="onCloseSearchFilter"
    >
      <a-form layout="vertical">
        <a-form-item label="Is Taxable ?">
          <a-radio-group v-model="search.params.isIncludedTax">
            <a-radio :value="null">
              <TagYesNo :value="null"/>
            </a-radio>
            <a-radio :value="true">
              <TagYesNo :value="true"/>
            </a-radio>
            <a-radio :value="false">
              <TagYesNo :value="false"/>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Is Free Ship ?">
          <a-radio-group v-model="search.params.isIncludedPostage">
            <a-radio :value="null">
              <TagYesNo :value="null"/>
            </a-radio>
            <a-radio :value="true">
              <TagYesNo :value="true"/>
            </a-radio>
            <a-radio :value="false">
              <TagYesNo :value="false"/>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Is Now Ship ?">
          <a-radio-group v-model="search.params.asurakuDeliveryId">
            <a-radio :value="null">
              <TagYesNo :value="null"/>
            </a-radio>
            <a-radio :value="true">
              <TagYesNo :value="true"/>
            </a-radio>
            <a-radio :value="false">
              <TagYesNo :value="false"/>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Is Hide ?">
          <a-radio-group v-model="search.params.isDepot">
            <a-radio :value="null">
              <TagYesNo :value="null"/>
            </a-radio>
            <a-radio :value="true">
              <TagYesNo :value="true"/>
            </a-radio>
            <a-radio :value="false">
              <TagYesNo :value="false"/>
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <div class="drawer-footer">
        <a-button
          :loading="loading"
          type="primary"
          icon="check"
          @click="onApplyFilter"
        >
          Apply
        </a-button>
        <a-button :loading="loading"
                  type="danger"
                  icon="undo"
                  @click="onClearFilter"
        >
          Clear
        </a-button>
        <a-button
          icon="close"
          @click="onCloseSearchFilter"
        >
          Cancel
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import TagYesNo from '@/components/TagYesNo'
import {Empty} from 'ant-design-vue';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
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
      data      : [],
      pagination: {},
      from      : '-',
      to        : '-',
      total     : '-',
      loading   : true,
      columns,
      form      : this.$form.createForm(this),
      product   : {
        data          : {},
        loading       : false,
        image         : null,
        itemName      : '',
        visible       : false,
        is_update     : false,
        loading_submit: false,
      },

      search: {
        title  : 'Search Filter',
        visible: false,
        params : {
          keyword          : '',
          isIncludedTax    : null,
          isIncludedPostage: null,
          asurakuDeliveryId: null,
          isDepot          : null,
        },
      },

      isEmpty,
      formatNumber,
      formatDate,
      renderRakutenUrl,

      imageUrl     : '',
      imageFile    : null,
      loading_image: false,
    };
  },
  mounted() {
    this.fetch({});
  },
  methods: {
    handleChange(info) {
      this.imageFile = null;
      if (info.file.status === 'uploading') {
        this.loading_image = true;
        return;
      }
      if (info.file.status === 'done') {
        // Get this url from response in real world.
        getBase64(info.file.originFileObj, imageUrl => {
          this.imageUrl      = imageUrl;
          this.loading_image = false;
        });

        this.imageFile = info.file.originFileObj;
      }
    },
    beforeUpload(file) {
      const allow_files = [
        'image/webp',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]

      const rule_file = allow_files.indexOf(file.type) !== -1;
      if (!rule_file) {
        this.$message.error('You can only upload JPG, PNG, WEBP, JPEG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('Image must smaller than 2MB!');
      }
      return rule_file && isLt2M;
    },

    onClickSearchFilter() {
      this.search.visible = true
    },
    onCloseSearchFilter() {
      this.search.visible = false;
    },
    onApplyFilter() {
      this.search.visible = false;
      this.fetchWithFilter();
    },
    onClearFilter() {
      this.search.params  = {
        ...this.search.params,
        isIncludedTax    : null,
        isIncludedPostage: null,
        asurakuDeliveryId: null,
        isDepot          : null,
      }
      this.search.visible = false;
      this.fetchWithFilter();
    },
    onSearchKeyword(value) {
      this.search.params = {
        ...this.search.params,
        keyword: value,
      }
      this.fetchWithFilter();
    },
    fetchWithFilter() {
      let params = {...this.search.params};
      params     = {
        ...params,
        page: 1,
      }
      this.fetch(params);
    },

    onClose() {
      if (this.product.loading_submit !== true) {
        this.product.visible = false;
        this.resetForm();
      } else {
        this.$message.warn('Please waiting upload product.')
      }
    },

    resetForm() {
      this.product.data  = {};
      this.product.image = null;
      this.imageFile     = null;
      this.imageUrl      = null;
      this.setFormData();
    },
    async onUpdate(e) {
      const code                  = e.currentTarget.value
      this.product.loading_submit = true;
      let is_success              = false;

      let data = {
        itemName         : this.form.getFieldValue('itemName'),
        itemPrice        : this.form.getFieldValue('itemPrice'),
        isIncludedTax    : this.form.getFieldValue('isIncludedTax'),
        isIncludedPostage: this.form.getFieldValue('isIncludedPostage'),
        asurakuDeliveryId: this.form.getFieldValue('asurakuDeliveryId'),
        isDepot          : this.form.getFieldValue('isDepot'),
      }

      let formData = new FormData();
      formData.append('itemName', data.itemName !== undefined ? data.itemName : '');
      formData.append('itemPrice', data.itemPrice !== undefined ? data.itemPrice : '');
      formData.append('isIncludedTax', data.isIncludedTax === true ? '1' : '0');
      formData.append('isIncludedPostage', data.isIncludedPostage === true ? '1' : '0');
      formData.append('asurakuDeliveryId', data.asurakuDeliveryId === true ? '1' : '0');
      formData.append('isDepot', data.isDepot === true ? '1' : '0');
      if (this.imageFile !== null) {
        formData.append('image', this.imageFile);
      }

      await this.$axios.$post('products/' + code, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((response) => {
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
        itemUrl          : this.form.getFieldValue('itemUrl'),
        itemName         : this.form.getFieldValue('itemName'),
        itemPrice        : this.form.getFieldValue('itemPrice'),
        isIncludedTax    : this.form.getFieldValue('isIncludedTax'),
        isIncludedPostage: this.form.getFieldValue('isIncludedPostage'),
        asurakuDeliveryId: this.form.getFieldValue('asurakuDeliveryId'),
        isDepot          : this.form.getFieldValue('isDepot'),
      }

      let formData = new FormData();
      formData.append('itemUrl', data.itemUrl !== undefined ? data.itemUrl : '');
      formData.append('itemName', data.itemName !== undefined ? data.itemName : '');
      formData.append('itemPrice', data.itemPrice !== undefined ? data.itemPrice : '');
      formData.append('isIncludedTax', data.isIncludedTax === true ? '1' : '0');
      formData.append('isIncludedPostage', data.isIncludedPostage === true ? '1' : '0');
      formData.append('asurakuDeliveryId', data.asurakuDeliveryId === true ? '1' : '0');
      formData.append('isDepot', data.isDepot === true ? '1' : '0');
      if (this.imageFile !== null) {
        formData.append('image', this.imageFile);
      }

      await this.$axios.$post('products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
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
        this.product.visible = false;
        this.$message.success('Post product success.')
        await this.fetch({
          page: this.pagination.current,
        });
        this.resetForm();
      }
    },
    async showDeleteConfirm(e) {
      const item_url = e.currentTarget.value

      if (isEmpty(item_url)) {
        return;
      }
      const itemName = e.currentTarget.getAttribute('data-name');
      this.$confirm({
        title     : 'Are you sure delete ' + item_url + ' ?',
        content   : itemName,
        okText    : 'Yes',
        okType    : 'danger',
        cancelText: 'No',
        onOk      : async () => {
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
    async handleBtnAdd() {
      this.product.title     = 'Post product';
      this.product.is_update = false;
      this.product.loading   = false;
      this.product.visible   = true;

      let data = {
        itemUrl          : this.form.getFieldValue('itemUrl'),
        itemName         : this.form.getFieldValue('itemName'),
        itemPrice        : this.form.getFieldValue('itemPrice'),
        isIncludedTax    : this.form.getFieldValue('isIncludedTax'),
        isIncludedPostage: this.form.getFieldValue('isIncludedPostage'),
        asurakuDeliveryId: this.form.getFieldValue('asurakuDeliveryId'),
        isDepot          : this.form.getFieldValue('isDepot'),
      }
      await this.setFormData(data)
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
        page   : pagination.current,
        sort   : order,
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

      this.total = isEmpty(this.pagination.total) ? 0 : this.pagination.total;
      this.from  = '-';
      this.to    = '-';
      if (this.total > 0) {
        let current_page = isEmpty(this.pagination.current) ? 1 : this.pagination.current;
        let pageSize     = isEmpty(this.pagination.pageSize) ? 0 : this.pagination.pageSize;
        let size         = current_page * pageSize;
        this.from        = size - pageSize + 1;
        this.to          = size >= this.total ? this.total : size;
      }
    },
    setFormData(data = {}, errors = {}) {
      this.form.setFields({
        'itemUrl'          : {
          value : data.itemUrl,
          errors: errors.itemUrl !== undefined ? [
            {
              "message": errors.itemUrl,
            }
          ] : null
        },
        'itemName'         : {
          value : data.itemName,
          errors: errors.itemName !== undefined ? [
            {
              "message": errors.itemName,
            }
          ] : null
        },
        'itemPrice'        : {
          value : data.itemPrice,
          errors: errors.itemPrice !== undefined ? [
            {
              "message": errors.itemPrice,
            }
          ] : null
        },
        'isIncludedTax'    : {
          value : data.isIncludedTax === true,
          errors: errors.isIncludedTax !== undefined ? [
            {
              "message": errors.isIncludedTax,
            }
          ] : null
        },
        'isIncludedPostage': {
          value : data.isIncludedPostage === true,
          errors: errors.isIncludedPostage !== undefined ? [
            {
              "message": errors.isIncludedPostage,
            }
          ] : null
        },
        'asurakuDeliveryId': {
          value : data.asurakuDeliveryId === true,
          errors: errors.asurakuDeliveryId !== undefined ? [
            {
              "message": errors.asurakuDeliveryId,
            }
          ] : null
        },
        'isDepot'          : {
          value : data.isDepot === true,
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
    width      : '80px',
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
      customRender: 'slot-free-ship',
    },
  },
  {
    title      : 'Now Ship',
    dataIndex  : 'asurakuDeliveryId',
    width      : '100px',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-now-ship',
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
    title      : 'Action',
    dataIndex  : 'action',
    width      : 120,
    align      : 'center',
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
