import Vue from 'vue';

// const TableStore = function(table) {
//   this.table = table;
//   this.states = {
//     data: null,
//     columns: null
//   };
//   return this;
// };

// export default TableStore;

var store = new Vue({
  created() {
    this.states = {};
  }
});
export default store;