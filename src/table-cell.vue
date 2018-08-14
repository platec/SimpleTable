<template>
  <div class="inputHolder" v-show="cellVisible" v-clickoutside="hideInputHolder">
    <textarea :style="cellStyle" :value="value" @input="handleInput" id="input"></textarea>
  </div>
</template>

<script>
  import clickoutside from './clickoutside';

  export default {
    name: 'TableCell',
    directives: {
      clickoutside
    },
    created() {
      this.store.$on('cellVisible', (visible, position) => {
        this.position = position;
        this.cellVisible = visible;
      });
    },
    props: {
      store: {
        required: true
      },
      cellStyle: Object,
      value: null
    },
    data() {
      return {
        cellVisible: false,
      };
    },
    methods: {
      hideInputHolder() {
        if (this.position) {
          var prop = this.store.states.columns[this.position.col].prop;

          this.store.states.data[this.position.row][prop] = this.value;
          this.store.$emit('data', this.store.states.data);
          this.store.$emit('cellModify', this.position, this.value);
        }
        this.cellVisible = false;
      },
      handleInput(e) {
        this.$emit('input', e.target.value);
      }
    }
  }
</script>

<style scoped>
.inputHolder {
  position: absolute;
}
textarea {
  resize: none;
  overflow-y: hidden;
  border: 0;
  box-shadow: inset 0 0 0 2px #5292f7;
}
</style>
