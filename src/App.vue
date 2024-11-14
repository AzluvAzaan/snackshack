<template>
  <div id="app">
    <!-- Navbar will be visible across all pages -->
    <Navbar />
    <router-view /> <!-- This is where the different pages will be rendered -->
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'; // Import the Navbar component

export default {
  components: {
    Navbar,
  },
};
</script>


