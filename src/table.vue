<template>
  <div class="simple-table">
    <div class="hidden-columns">
      <slot></slot>
    </div>
    <div class="simple-table-header">
      <table-header v-if="headerVisible" :store="store"></table-header>
    </div>
    <div class="simple-table-body">
      <table-body :store="store">
      </table-body>
    </div>
      <table-cell store={ this.store } value={ this.inputValue }
      style={ this.inputHolderStyle } cellStyle={ this.tableCellStyle }></table-cell>
  </div>
</template>

<script>
  import { nodeOffset } from './util';
  import TableHeader from './table-header';
  import store from './table-store';
  import TableBody from './table-body';
  import TableColumn from './table-column';
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
      TableBody,
      TableColumn
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
      this.store.commit('setOldData', JSON.parse(JSON.stringify(this.data)));
      var columns = [];
      var _columns = [];
      this.$slots.default.forEach(item => {
        if (item.componentOptions) {
          columns.push(item.componentOptions.propsData);
          _columns.push(item.context);
        }
      });
      this.store.commit('setColumns', columns, _columns);
      this.store.commit('setData', this.data);
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
