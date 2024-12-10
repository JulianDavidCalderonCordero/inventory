<template>
  <div class="inventory-form">
    <h2>Create Inventory Entry/Exit</h2>
    <form @submit.prevent="submitForm">
      <!-- Product ID (Dropdown) -->
      <div class="form-group">
        <label for="product_id">Product</label>
        <select
          id="product_id"
          v-model="form.product_id"
          required
        >
          <option value="" disabled>Select product</option>
          <option v-for="product in products" :key="product.product_id" :value="product.product_id">
            {{ product.name }}
          </option>
        </select>
        <span v-if="errors.product_id" class="error">{{ errors.product_id }}</span>
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label for="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          v-model="form.quantity"
          placeholder="Enter quantity"
          required
        />
        <span v-if="errors.quantity" class="error">{{ errors.quantity }}</span>
      </div>

      <!-- Type (Entry or Exit) -->
      <div class="form-group">
        <label for="type">Type</label>
        <select id="type" v-model="form.type" required>
          <option value="" disabled>Select type</option>
          <option value="entry">Entry</option>
          <option value="exit">Exit</option>
        </select>
        <span v-if="errors.type" class="error">{{ errors.type }}</span>
      </div>

      <!-- Expiration Date -->
      <div v-if="form.type === 'entry'" class="form-group">
        <label for="expiration_date">Expiration Date</label>
        <input
          type="date"
          id="expiration_date"
          v-model="form.expiration_date"
        />
      </div>

      <!-- Submit Button -->
      <button type="submit">Submit</button>
    </form>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { reactive, ref, onMounted } from 'vue';

export default {
  name: 'InventoryForm',
  setup() {
    const form = reactive({
      product_id: '',
      quantity: '',
      type: '',
      expiration_date: '', // New expiration_date field
    });

    const products = ref([]); // To store the product list
    const errors = reactive({});
    const successMessage = ref('');

    // Fetch products from the inventory endpoint
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products');
        products.value = response.data; // Assume response contains a list of products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    // Validate form data
    const validateForm = () => {
      errors.product_id = !form.product_id ? 'Product ID is required.' : '';
      errors.quantity = !form.quantity || form.quantity <= 0 ? 'Valid quantity is required.' : '';
      errors.type = !form.type ? 'Type (entry or exit) is required.' : '';
      return !errors.product_id && !errors.quantity && !errors.type;
    };

    // Submit the form
    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        const response = await axios.post(`http://localhost:3000/batches/${form.type}`, form);
        successMessage.value = 'Inventory entry/exit recorded successfully!';
        console.log('Response:', response.data);

        // Reset form
        form.product_id = '';
        form.quantity = '';
        form.type = '';
        form.expiration_date = ''; // Reset expiration_date
      } catch (error) {
        console.error('Error submitting inventory:', error);
        if (error.response && error.response.data) {
          // Handle server-side errors, if provided
          errors.product_id = error.response.data.errors?.product_id || '';
          errors.quantity = error.response.data.errors?.quantity || '';
          errors.type = error.response.data.errors?.type || '';
        }
      }
    };

    // Fetch products when the component is mounted
    onMounted(fetchProducts);

    return {
      form,
      products,
      errors,
      successMessage,
      submitForm,
    };
  },
};
</script>

<style scoped>
.inventory-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  font-size: 0.875rem;
}

.success {
  color: green;
  font-size: 0.875rem;
  margin-top: 16px;
}
</style>