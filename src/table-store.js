const TableStore = function(table) {
  this.table = table;
  this.states = {
    data: null,
    columns: null
  };
  return this;
};

export default TableStore;
// TableStore.prototype = {

// };