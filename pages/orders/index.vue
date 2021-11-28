<template>
  <div class="feature">
    <h2>Order List</h2>
    <a-table
      :columns="columns"
      :row-key="record => record.login.uuid"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="name" slot-scope="name"> {{ name.first }} {{ name.last }}</template>
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
      columns,
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination);
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
        results: 10,
        ...params,
      };
      this.$axios.$get('https://randomuser.me/api', {params: query}).then((data) => {
        const pagination = {...this.pagination};
        // Read total count from server
        // pagination.total = data.totalCount;
        pagination.total = 200;
        this.loading     = false;
        this.data        = data.results;
        this.pagination  = pagination;
      });
    },
  },
}

const columns = [
  {
    title      : 'Name',
    dataIndex  : 'name',
    sorter     : true,
    width      : '20%',
    scopedSlots: {customRender: 'name'},
  },
  {
    title    : 'Gender',
    dataIndex: 'gender',
    filters  : [
      {text: 'Male', value: 'male'},
      {text: 'Female', value: 'female'},
    ],
    width    : '20%',
  },
  {
    title    : 'Email',
    dataIndex: 'email',
  },
];
</script>
