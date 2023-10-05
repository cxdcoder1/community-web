

<template>
<div></div>
</template>

<script>
export default {
  created() {
    this.swagger();
  },
  methods:{
    swagger(){
      this.$http.get('http://localhost:8080');
    }
  }
}
</script>


<style scoped>

</style>