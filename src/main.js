import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faRandom, faShoppingCart, faCompass, faMagnifyingGlass, faStar , faSort, faPlus, faPenToSquare, faRightFromBracket, faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faRandom, faShoppingCart, faCompass, faMagnifyingGlass, faStar, faSort, faPlus, faPenToSquare, faRightFromBracket, faTimes);

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

// Use the router in your Vue app
app.use(router);

// Mount the app to the DOM
app.mount('#app');