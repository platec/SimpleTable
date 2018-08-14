<template>
  <div class="inputHolder" v-show="visible">
    <textarea :style="cellStyle" v-model="value" id="input"></textarea>
  </div>
</template>

<script>
  export default {
    name: 'TableCell',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      value: {
        default: ''
      },
      cellStyle: Object
    },
    data() {
      return {
      };
    }
  }
</script>

<style scoped>
  .inputHolder {
    position: absolute;
  }
  textarea {
    resize : none;
    overflow-y: hidden;
    border: 0;
    box-shadow: inset 0 0 0 2px #5292f7;
  }
  .modified {
    color: red;
  }
</style>
