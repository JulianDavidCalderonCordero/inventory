<script setup>
import NewProduct from '../components/NewProduct.vue'
import NewBatch from '../components/NewBatch.vue'
import InventoryGrid from '../components/InventoryGrid.vue'
</script>
<template>
  <b-container class="bv-example-row">
    <b-row>
      <b-col><NewProduct /></b-col>
      <b-col><NewBatch /></b-col>
    </b-row>
  </b-container>
  
  
  <InventoryGrid />
</template>