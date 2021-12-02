<template>
  <div class="feature">
    <h2>Product List</h2>
    <a-table
      :columns="columns"
      :row-key="record => record.code"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template class="text-center" slot="slot-code" slot-scope="code">
        <a-button type="link" :value="code" @click="handleClickRow">{{ code }}</a-button>
      </template>
      <template class="text-center" slot="slot-taxable" slot-scope="taxable">
        <TagYesNo :value_bool="taxable"/>
      </template>
      <template class="text-center" slot="slot-is-ship-free" slot-scope="is_ship_free">
        <TagYesNo :value_bool="is_ship_free"/>
      </template>
      <template class="text-center" slot="slot-is-ship-now" slot-scope="is_ship_now">
        <TagYesNo :value_bool="is_ship_now"/>
      </template>
    </a-table>
    <div class="draw-wrap">
      <a-drawer
        title="Product detail"
        :width="720"
        :visible="visible"
        :body-style="{ paddingBottom: '80px' }"
        @close="onClose"
      >
        <template v-if="this.loading_product === true">
          <div class="loading-spin">
            <a-spin/>
          </div>
        </template>
        <template v-else>
          <a-form :form="form" layout="vertical" hide-required-mark>
            <a-row :gutter="16">
              <a-col :span="24">
                <div class="draw-product-img text-center">
                  <img slot="cover"
                       alt="example"
                       src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                  />
                </div>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="Name">
                  <a-input
                    v-decorator="[
                  'name',
                ]"
                    placeholder="Product name"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="Product price">
                  <a-input
                    v-decorator="[
                  'price',
                ]"
                    style="width: 100%"
                    placeholder="Please enter price"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="Description">
                  <a-textarea
                    v-decorator="[
                  'description',
                  {
                    rules: [{ required: true, message: 'Please enter url description' }],
                  },
                ]"
                    :rows="4"
                    placeholder="please enter url description"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </template>
        <div
          :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
        >
          <a-button :style="{ marginRight: '8px' }" @click="onClose">
            Cancel
          </a-button>
          <a-button type="primary" @click="onClose">
            Submit
          </a-button>
        </div>
      </a-drawer>
    </div>
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
      current_product: {
        code: null,
        data: {}
      }
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    onClose() {
      this.visible = false;
    },
    async handleClickRow(e) {
      this.visible         = true;
      this.loading_product = true;
      const code           = e.currentTarget.value
      await this.$axios.$get('products/' + code).then((data) => {
        console.log(data)
      });
      this.loading_product = false;
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
      this.$axios.$get('products', {params: query}).then((data) => {
        const pagination    = {...this.pagination};
        // Read total count from server
        pagination.total    = data.meta.total;
        pagination.pageSize = data.meta.results;
        this.loading        = false;
        this.data           = data.data;
        this.pagination     = pagination;
      });
    },
  },
}

const columns = [
  {
    title      : 'Product Code',
    dataIndex  : 'code',
    width      : '20%',
    align      : 'center',
    scopedSlots: {
      customRender: 'slot-code',
    },
    sorter     : true,
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


