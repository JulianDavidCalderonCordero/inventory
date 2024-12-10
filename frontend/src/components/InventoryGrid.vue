<template>
  <div class="inventory-grid">
    <h2>Inventory Status</h2>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Valid</th>
          <th>Expiring Soon</th>
          <th>Expired</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in inventoryData" :key="index">
          <td>{{ item.product_name }}</td>
          <td>{{ item.valid_quantity || "0" }}</td>
          <td>{{ item.near_expiry_quantity || "0" }}</td>
          <td>{{ item.expired_quantity || "0" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import { reactive, ref, onMounted } from 'vue';

export default {
  name: 'InventoryGrid',
  setup() {
    const inventoryData = ref([]); // Datos del inventario

    // Función para obtener los datos de inventario
    const fetchInventoryData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/inventory'); // Endpoint de ejemplo
        inventoryData.value = response.data.inventory.map(item => {
            const batches = item.batches.reduce((r, c) => {
                return {
                    ...r,
                    [`${c.status}_quantity`]: parseInt(c.quantity) + parseInt(r[`${c.status}_quantity`] || 0)
                }
            }, {})
            return {
                product_name: item.product_name,
                ...batches
            }
        }); // Asumiendo que la respuesta es un array de productos con sus cantidades
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };

    // Cargar los datos cuando el componente se monta
    onMounted(fetchInventoryData);

    return {
      inventoryData,
    };
  },
};
</script>

<style scoped>
.inventory-grid {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>