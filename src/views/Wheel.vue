<template>
  <body>
    <div id="app">
      <!-- Header Container -->
      <div class="header-container">
        <h1 class="header">Snack of Fortune</h1>
      </div>
      
      <!-- Conveyor Belt Container -->
      <div class="conveyor-container">
        <div class="conveyor">
          <div class="belt" ref="belt">
            <div 
              v-for="(snack, index) in conveyorItems" 
              :key="snack.id" 
              class="conveyor-snack-item"
              @click="turnIntoCard(snack)"
              :class="{ highlighted: index === selectedSnackIndex }"
            >
              <img :src="snack.img" :alt="snack.name" />
            </div>
          </div>
      </div>
      </div>
      
      <!-- Surprise Me Button -->
      <div class="button-container">
        <button @click="surpriseMe" class="btn rainbow-btn">
          <font-awesome-icon icon="random" /> Surprise Me!
        </button>
      </div>
      
      <!-- Snack Description Container -->
      <div class="snack-details-container dark-blue-background">
        <div class="snack-details-row">
          <!-- Snack Image -->
          <div class="description-snack-image">
            <img :src="snacks[selectedSnackIndex].img" :alt="snacks[selectedSnackIndex].name" id="description-snack-img">
          </div>
          
          <!-- Snack Description -->
          <transition name="fade">
            <div class="snack-description">
              <h2>{{ snacks[selectedSnackIndex].name }}</h2>
              <p>Snack Information:</p>
              <ul>
                <li>Calories: {{ snacks[selectedSnackIndex].calories }}</li>
                <li>Fat: {{ snacks[selectedSnackIndex].fat }}<span style="font-size: small;">g</span></li>
                <li>Sugar: {{ snacks[selectedSnackIndex].sugar }}<span style="font-size: small;">g</span></li>
                <li>Sodium: {{ snacks[selectedSnackIndex].sodium }}<span style="font-size: small;">mg</span></li>
              </ul>
              <button @click="navigateToMap(snacks[selectedSnackIndex].type)" class="btn directions-btn">
                <font-awesome-icon icon="compass" /> Get Me There
              </button>
              <button @click="openModal" class="btn menu-btn">What's on the Menu?</button>
            </div>
          </transition>
        </div>
      </div>
      
      <!-- Modal Structure -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h1>Menu</h1>
            <button @click="closeModal" class="fixed-close-btn">
              <font-awesome-icon icon="times" />
            </button>
          </div>
          <div class="modal-body">
            <ul style="padding: 0px">
              <li v-for="snack in snacks" :key="snack.id" @click="turnIntoCard(snack)" class="modal-snack-item">
                <img :src="snack.img" alt="Snack image" class="modal-snack-image" />
                <div class="modal-snack-details">
                  <h5>{{ snack.name }}</h5>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Detail Modal Structure -->
      <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
        <div class="card-modal-content" @click.stop>
          <h1>{{ selectedSnackDetail.name }}</h1>
          <img :src="selectedSnackDetail.img" alt="Snack image" class="card-snack-image" />
          <p>Calories: {{ selectedSnackDetail.calories }}</p>
          <p>Fat: {{ selectedSnackDetail.fat }}<span style="font-size: small;">g</span></p>
          <p>Sugar: {{ selectedSnackDetail.sugar }}<span style="font-size: small;">g</span></p>
          <p>Sodium: {{ selectedSnackDetail.sodium }}<span style="font-size: small;">mg</span></p>
          
          <div class="button-ctn">
            <button @click="showDetailModal = false; showModal = true" class="btn back-btn">Back to Menu</button>
            <button @click="closeDetailModal" class="btn close-btn">Close</button>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>
<script>
import pockyC from '../assets/pocky.png';
import pockyCC from '../assets/pockyC&C.png';
import DoritosNC from '../assets/DoritosNC.png';
import LaysB from '../assets/LaysB.png';
import LaysSC from '../assets/LaysSC.png';
import LaysC from '../assets/LaysC.png';
import TongSC from '../assets/TongSC.png';
import MandM from '../assets/m&ms.png';
import TwistiesC from '../assets/TwistiesC.png';
import Houten from '../assets/Houten.png';
import Super from '../assets/SuperRing.png';
import Milo from '../assets/Milo.png';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import Navbar from '@/components/Navbar.vue';

export default {
  name: 'Wheel',
  components: {
    Navbar,
  },
  data() {
    return {
      snacks: [
        { id: 1, name: 'Pocky Chocolate Flavour', type: 'Pocky', img: pockyC, calories: 160, fat: 8, sugar: 11, sodium: 70 },
        { id: 2, name: 'Pocky Cookies & Cream Flavour', type: 'Pocky', img: pockyCC, calories: 150, fat: 6, sugar: 12, sodium: 50 },
        { id: 3, name: "Lay's Barbecue Chips", type: 'Lays', img: LaysB, calories: 150, fat: 9, sugar: 2, sodium: 200 },
        { id: 4, name: 'Lay\'s Sour Cream & Onion', type: 'Lays', img: LaysSC, calories: 160, fat: 10, sugar: 1, sodium: 170 },
        { id: 5, name: 'Doritos Nacho Cheese', type: 'Doritos', img: DoritosNC, calories: 145, fat: 7.7, sugar: 0.7, sodium: 193.5 },
        { id: 6, name: 'Lay\'s Classic', type: 'Lays', img: LaysC, calories: 160, fat: 10, sugar: 1, sodium: 170 },
        { id: 7, name: 'M&Ms', type: 'M&Ms', img: MandM, calories: 190, fat: 8, sugar: 26, sodium: 30 },
        { id: 8, name: 'Tong Garden Salted Cashew Nuts', type: 'Mixed Nuts', img: TongSC, calories: 250, fat: 19, sugar: 2, sodium: 85 },
        { id: 9, name: 'Twisties Chicken', type: 'Twisties', img: TwistiesC, calories: 80, fat: 4.4, sugar: 2, sodium: 93 },
        { id: 10, name: 'Houten Chilli Tapioca', type: 'Potato Chips', img: Houten, calories: 160, fat: 8, sugar: 8, sodium: 150 },
        { id: 11, name: 'Super Ring', type: 'Super Rings', img: Super, calories: 80, fat: 5.5, sugar: 1.5, sodium: 100 },
        { id: 12, name: 'Milo', type: 'Milo', img: Milo, calories: 150, fat: 3.6, sugar: 16.6, sodium: 0.2 },
      ],
      selectedSnackIndex: 0,
      beltWidth: 0,
      isAnimating: false,
      showModal: false,
      selectedSnackDetail: {},
      showDetailModal: false,
    };
  },
  computed: {
    conveyorItems() {
      const filledSnacks = [...this.snacks];
      const minItems = 30;

      // Populate with placeholders using existing snacks if there are not enough items
      while (filledSnacks.length < minItems) {
        const randomSnack = this.snacks[Math.floor(Math.random() * this.snacks.length)];
        filledSnacks.push({ ...randomSnack, id: filledSnacks.length + 1 });
      }
      return filledSnacks;
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.belt) {
        this.beltWidth = this.$refs.belt.scrollWidth;
      }
    });
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    turnIntoCard(snack) {
      this.selectedSnackDetail = snack;
      this.showModal = false;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.showDetailModal = false;
    },
    surpriseMe() {
      if (!this.$refs.belt) {
        console.error('Belt reference is not available.');
        return;
      }
      if (this.isAnimating) return;
      this.isAnimating = true;

      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * this.snacks.length);
      } while (randomIndex === this.selectedSnackIndex);

      this.selectedSnackIndex = randomIndex;
      const snackWidth = 150;
      const targetPosition = randomIndex * snackWidth;

      gsap.to(this.$refs.belt, {
        x: `-${targetPosition}px`,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          this.checkResetPosition();
          this.triggerConfetti();
        },
      });
    },
    checkResetPosition() {
      const currentPosition = gsap.getProperty(this.$refs.belt, 'x');
      if (currentPosition < -(this.snacks.length * 150)) {
        gsap.set(this.$refs.belt, { x: 0 });
      }
      this.isAnimating = false;
    },
    triggerConfetti() {
      confetti({
        particleCount: 350,
        spread: 100,
        origin: { x: 0.5, y: 0.8 },
        zIndex: 9999,
      });
    },
    navigateToMap(snackType) {
      this.$router.push({
        name: 'Map',
        query: { snack: snackType }
      });
    },
  },
};
</script>
<style scoped>

@import 'bootstrap/dist/css/bootstrap.css';

.placeholder {
  width: 125px;
  height: 125px;
  background-color: #eee;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container {
  display: flex;
  justify-content: center; /* Center the button horizontally */
  align-items: center; /* Center the button vertically if needed */
  margin: 20px 0; /* Add space between the conveyor and snack details */
}

.conveyor-container {
  margin-bottom: 20px;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #003061, #001f3f, black);
  margin: 0;
  padding: 0;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.snack-details-container {
  margin-bottom: 0;
  flex: 1;
}


.header-container {
  padding-top: 20px;
  padding-bottom: 20px;
  position: relative;
  text-align: center;
}

.header {
  font-size: 3em;
  color: white;
  margin-bottom: 30px;
  font-weight: bold;
  margin-top: 20px;
}
.conveyor-container {
  position: relative;
  margin-bottom: 30px;
  overflow: hidden;
}
.conveyor {
  position: relative;
  margin: 20px 0;
  overflow: hidden;
  height: 150px;
  padding-bottom: 20px ;
}
.belt {
  display: flex;
  flex-direction: row;
  transition: transform 0.5s ease-out;
  will-change: transform;
  transform: translateX(0);
  position: relative;
  z-index: 1;
}
.conveyor-snack-item {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}

.conveyor-snack-item:hover {
  transform: translateY(-15px);
}

.conveyor-snack-item img {
  width: 125px;
  height: 125px;
  object-fit: cover;
  border-radius: 10px;
}
.conveyor-snack-item.highlighted {
  border: 1px solid yellow;
  box-shadow: 0 0 35px rgba(255, 204, 0, 0.7);
  transition: all 0.3s ease;
  border-radius: 10px;
}
.snack-details-container {
  background-color: none;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 10px;
  margin-bottom: 10px;
}
.snack-details-row {
  display: flex;
  flex-wrap: wrap;
}
.description-snack-image {
  background-color: white;
  flex: 1;
  max-width: 100%;
  padding: 10px;
  border: 5px solid #db8030;
  border-radius: 8px;
}

#description-snack-img {
  width:300px;
  height:300px;
  display: block;
  margin-left: auto;
  margin-right: auto; 
}
.snack-description {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #e9f7ff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: #333333;
  margin-left: 5px
}

.rainbow-btn {
  background: linear-gradient(90deg, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9);
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  text-transform: uppercase;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-size 0.5s ease-in-out, box-shadow 0.3s ease;
  cursor: pointer;
  background-size: 400%;
}

.rainbow-btn:hover {
  color: white;
  background-position: 100% 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.directions-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  font-weight: bold;
  margin-bottom: 5px;
  border-radius: 10px;
  background-color: white;
  border: 2px black solid
}
.directions-btn:hover {
  color: white;
  background: linear-gradient(90deg, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.menu-btn {
  margin-bottom: 2px;
  border-radius: 10px;
  padding: 10px 20px;
  background-color: white;
  border: 2px black solid
}
.menu-btn:hover {
  color: white;
  background: linear-gradient(90deg, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.close-btn {
  margin-top: 10px;
  background-color: #453B32; /* Change this color as needed */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.close-btn:hover {
  background-color: #6A5C53; /* Change this color as needed */
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
/* First Modal */
.modal-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 5px;
}

.modal-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1002;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-snack-item {
  display: flex;
  align-items: center; /* Center items vertically */
  margin: 10px 0;
  padding: 10px;
  border-bottom: 1px solid #ddd; /* Add a separator between items */
  cursor: pointer; /* Change cursor to indicate clickability */
}
.modal-snack-item:hover {
  background-color: #FFFDD0; /* Change background color when hovering */
}

.modal-snack-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
}
.modal-snack-details {
  display: flex;
  flex-direction: column; /* Stack text vertically */
}
/* Second Modal */
.card-modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  margin: 20px auto;
  text-align: center;
}
.card-snack-image {
  width: 150px;
  height: auto;
  margin: 10px 0;
}
/* Back Button on the Detailed Modal */
.back-btn {
  margin-top: 10px;
  background-color: #453B32; /* Change this color as needed */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.back-btn:hover {
  background-color: #6A5C53; /* Change this color as needed */
}
/* Button Container */
.button-ctn {
  display: flex; /* Use flexbox for layout */
  justify-content: space-between; /* Space buttons evenly */
  margin-top: 20px; /* Optional: Adds space above the buttons */
}

.button-ctn .btn {
  flex: 1; /* Makes buttons take equal width */
  margin: 0 5px; /* Adds some margin between buttons */
}

/* For Fixed Close button on modal */

.fixed-close-btn-div {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1001;
}

.fixed-close-btn {
  background-color: transparent;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #333;
}

.fixed-close-btn:hover {
  color: #ff0000;
}


@media (max-width: 382px) {
  .header {
    font-size: 2em;
    color: white;
    margin-bottom: 20px;
    font-weight: bold;
    margin-top: 5px;
  }

  .rainbow-btn {
    background: linear-gradient(90deg, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9, #ff5f6d, #ffc371, #47e495, #6A82FB, #8E54E9, #8E54E9);
    color: black;
    border: none;
    padding: 5px 10px;
    border-radius: 50px;
    text-transform: uppercase;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background-size 0.5s ease-in-out, box-shadow 0.3s ease;
    background-size: 400%;
    position: static;
    margin: 10px auto;
    width: 80%;
    max-width: 200px;
  }

  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }

  #description-snack-img {
    width: 320px;
    height: auto;
    max-width: 200px;
    max-height: 200px;
  }
  
}

@media (max-width: 548px) { 
    .snack-description {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #FFFDD0;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: #333333;
    margin-left: 0px
  }

  .description-snack-image {
    flex: 1;
    max-width: 100%;
    padding: 10px;
    border: 3px solid #453B32;
    border-radius: 8px;
    margin-bottom: 5px;
  }
}


</style>
