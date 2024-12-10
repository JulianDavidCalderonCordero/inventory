<template>
  <div class="new-product-form">
    <h2>Create New Product</h2>
    <form @submit.prevent="submitForm">
      <!-- Product Name -->
      <div class="form-group">
        <label for="name">Product Name</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          placeholder="Enter product name"
          required
        />
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter product description"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button type="submit">Create Product</button>
    </form>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { reactive, ref } from 'vue';

export default {
  name: 'NewProductForm',
  setup() {
    const form = reactive({
      name: '',
      description: '',
    });

    const errors = reactive({});
    const successMessage = ref('');

    const validateForm = () => {
      errors.name = !form.name ? 'Product name is required.' : '';
      return !errors.name;
    };

    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/products', form);
        successMessage.value = 'Product created successfully!';
        console.log('Response:', response.data);

        // Reset form
        form.name = '';
        form.description = '';
      } catch (error) {
        console.error('Error creating product:', error);
        if (error.response && error.response.data) {
          errors.name = error.response.data.errors?.name || '';
        }
      }
    };

    return {
      form,
      errors,
      successMessage,
      submitForm,
    };
  },
};
</script>

<style scoped>
.new-product-form {
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
textarea {
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