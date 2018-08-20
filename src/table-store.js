const TableStore = function(table) {
  this.table = table;
  this._events = {};
  this.states = {
    _columns: null,
    data: null,
    columns: null,
    oldData: null
  };
  return this;
};

TableStore.prototype.mutations = {
  setData(states, data) {
    this.states.data = data;
  },
  setColumns(states, columns, _columns) {
    this.states.columns = columns;
    this.states._columns = _columns;
  },
  setOldData(states, oldData) {
    this.states.oldData = oldData;
  }
};

TableStore.prototype.on = function(event, handler) {
  this._events[event] = this._events[event] || [];
  if (this._events[event].indexOf(handler) === -1) {
    this._events[event].push(handler);
  }
};

TableStore.prototype.emit = function(event, ...args) {
  var handlers = this._events[event];
  if (handlers) {
    for (let handler of handlers) {
      handler.apply(this, args);
    }
  }
};

TableStore.prototype.commit = function(name, ...args) {
  var mutations = this.mutations;
  if (mutations[name]) {
    var mutationsArgs = [this.states];
    args.forEach(item => {
      mutationsArgs.push(item);
    });
    mutations[name].apply(this, mutationsArgs);
  }
};

export default new TableStore;