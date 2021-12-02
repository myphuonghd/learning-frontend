<template>
  <div class="feature">
    <h2>Order List</h2>
    <a-table
      :columns="columns"
      :row-key="record => record.order_id"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="slot-order-id" slot-scope="order_id">
        <nuxt-link :to="'/orders/' + order_id">
          <a-tag color="red">
            {{ order_id }}
          </a-tag>
        </nuxt-link>
      </template>
      <template slot="slot-status" slot-scope="status">
        <a-select :default-value="status.toString()" style="width: 180px" @change="handleChange" >
          <template v-for="(status_name, status_id) in mst_status">
            <a-select-option :value="status_id">
              {{ status_name }}
            </a-select-option>
          </template>
        </a-select>
      </template>
      <template slot="slot-action" slot-scope="order_id">
        <a-button type="primary" icon="edit" :disabled="status_origin[order_id] === status_change[order_id]">
          Save
        </a-button>
        <a-button type="default" icon="undo">
          Undo
        </a-button>
      </template>
    </a-table>
  </div>
</template>
<script>
export default {
  middleware: ['auth'],
  data() {
    return {
      data      : [],
      pagination: {},
      loading   : false,
      mst_status: [],
      columns,
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    handleChange(value) {
      console.log(`selected ${value}`);
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
  },
}

const columns = [
  {
    title      : 'Order ID',
    dataIndex  : 'order_id',
    scopedSlots: {
      customRender: 'slot-order-id',
    },
  },
  {
    title    : 'Order Time',
    dataIndex: 'order_time',
  },
  {
    title    : 'Email',
    dataIndex: 'email',
  },
  {
    title    : 'Ship Address',
    dataIndex: 'ship_address',
  },
  {
    title    : 'Total Price',
    dataIndex: 'total_price',
  },
];
</script>
