import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import the router

import { library } from '@fortawesome/fontawesome-svg-core';
import { faRandom, faShoppingCart, faCompass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Add icons to the library
library.add(faRandom, faShoppingCart, faCompass);

// Create the Vue app instance
const app = createApp(App);

// Register the FontAwesomeIcon component globally
app.component('font-awesome-icon', FontAwesomeIcon);

// Use the router in your Vue app
app.use(router);

// Mount the app to the DOM
app.mount('#app');