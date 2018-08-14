<template>
  <div class="simple-table">
    <div class="simple-table-header">
      <table-header v-if="headerVisible" :store="store"></table-header>
    </div>
    <div class="simple-table-body">
      <table-body :store="store"></table-body>
    </div>
  </div>
</template>

<script>
  import { nodeOffset } from './util';
  import TableHeader from './table-header';
  import store from './table-store';
  import TableColumn from './table-column';
  import TableBody from './table-body.vue';
  import Vue from 'vue';

  Vue.prototype._l = (list, cb) => {
    var loop = list || [];
    var rendered = loop.map(cb);
    return rendered;
  }

  export default {
    name: 'SimpleTable',
    components: {
      TableHeader,
      TableColumn,
      TableBody
    },
    props: {
      headerVisible: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: []
      }
    },
    mounted() {
      document.addEventListener('click', this.editCompleted);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.editCompleted);
    },
    data() {
      var table = document.querySelector('table');
      return {
        store
      }
    },
    created() {
      this.store.states.oldData = JSON.parse(JSON.stringify(this.data));
      var columns = [];
      this.$slots.default.forEach(item => {
        if (item.componentOptions) {
          columns.push(item.componentOptions.propsData);
        }
      });
      this.store.states.columns = columns;
      this.store.states.data = this.data;
    },
    methods: {
    }
  }
</script>

<style>
  table,
  table tr th,
  table tr td {
    border: 1px solid #cfcfcc;
  }
  table tr th {
    padding: 0px 14px;
  }
  table {
    min-height: 25px;
    line-height: 25px;
    text-align: center;
    border-collapse: collapse;
    padding: 2px;
  }
</style>
