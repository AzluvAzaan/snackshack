<template>
  <div id="vending-machine-page" class="container-fluid vh-100 d-flex justify-content-center align-items-center">
    <!-- Animated text on the left (hidden on mobile) -->
    <div class="animated-text left-text d-none d-md-flex">
      <div>Find</div>
      <div>Vending</div>
      <div>Machines</div>
    </div>

    <div class="row w-100 d-flex justify-content-center align-items-center">
      <!-- Vending machine section -->
      <div class="col-12 col-md-8 col-lg-6 vending-machine-container d-flex justify-content-between align-items-center">
        <!-- Logo positioned at the top right corner -->
        <img src="@/assets/snackshack.png" alt="SnackShack Logo" class="vending-machine-logo">

        <!-- Left side: Glass container + Snack output -->
        <div class="snack-section">
          <div class="glass-container">
            <div class="snack-container">
              <div class="row" v-for="row in rowCount" :key="row">
                <div class="col-3 machine" v-for="(machine, index) in colCount" :key="index" @click="selectMachine(row, index)">
                  <div class="number-shelf">
                    <span class="machine-number">{{ getMachineNumber(row, index) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Snack output tray -->
          <div class="snack-output mt-3"></div>
        </div>

        <!-- Right side with controls -->
        <div class="controls-container">
          <div class="screen" :class="{ zoomed: isZoomed }"></div>
          <!-- Keypad -->
          <div class="keypad mt-3">
            <div v-for="key in 9" :key="key" class="keypad-button"></div>
            <div class="keypad-button red"></div>
            <div class="keypad-button"></div>
            <div class="keypad-button green"></div>
          </div>

          <!-- Coin and cash section -->
          <div class="cash-coin-container mt-3">
            <div class="cash-slot"></div>
            <div class="coin-return"></div>
          </div>
          <div class="coin-return-tray mt-3"></div>
        </div>
      </div>
    </div>

    <!-- Animated text on the right (hidden on mobile) -->
    <div class="animated-text right-text d-none d-md-flex">
      <div>Satisfy</div>
      <div>Your</div>
      <div>Cravings</div>
    </div>

    <!-- Overlay for displaying details and back button (renders after zoom completes) -->
    <div v-if="showDetails" class="overlay">
      <p class="zoomed-text"><strong>Machine Number:</strong> {{ selectedMachineNumber }}</p>
      <p class="zoomed-text"><strong>Location:</strong> {{ selectedMachineDetails.location }}</p>
      <p class="zoomed-text"><strong>Type:</strong> {{ selectedMachineDetails.type }}</p>
      <p class="zoomed-text"><strong>Payment Methods:</strong> {{ selectedMachineDetails.paymentMethods.join(', ') }}</p>
      <p class="zoomed-text"><strong>Rating:</strong> {{ selectedMachineDetails.rating }} stars</p>
      <button @click="zoomOut" class="btn btn-dark">Go Back</button>
    </div>
  </div>
</template>

<script>
import { machineData } from '@/data/machineData.js'; // Import the placeholder data

export default {
  data() {
    return {
      selectedMachineNumber: null,
      selectedMachineDetails: null, // Store machine details here
      isZoomed: false, // Toggle zoom effect
      showDetails: false, // Toggle to show text and button after zoom
    };
  },
  computed: {
    rowCount() {
      return window.innerWidth < 768 ? 3 : 4; // 3 rows for mobile, 4 for larger screens
    },
    colCount() {
      return 3; // 3 columns for both layouts
    }
  },
  methods: {
    selectMachine(row, col) {
      const machineNumber = this.getMachineNumber(row, col);
      this.selectedMachineNumber = machineNumber;
      this.selectedMachineDetails = machineData[machineNumber]; // Fetch machine details

      this.isZoomed = true; // Start zoom

      // After zoom completes (1 second delay), show details
      setTimeout(() => {
        this.showDetails = true;
      }, 1000); // Delay of 1 second (matching the zoom duration)
    },
    getMachineNumber(row, col) {
      return (row - 1) * this.colCount + col + 1; // Calculate unique number for each machine
    },
    zoomOut() {
      this.isZoomed = false; // Reset zoom and return to main view
      this.showDetails = false; // Hide details when zooming out
    }
  }
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#vending-machine-page {
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3f55;
  position: relative;
  overflow: hidden;
}

.vending-machine-container {
  position: relative;
  background-color: #333;
  border-radius: 20px;
  width: 30vw;
  max-width: 450px;
  height: 60vh;
  max-height: 600px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 3px solid #555;
  transform-origin: center;
  transition: width 0.3s ease, height 0.3s ease;
}

.vending-machine-logo {
  position: absolute;
  top: 20px;
  right: 0px;
  width: 8vw;
  max-width: 140px;
  height: auto;
}

.animated-text {
  position: absolute;
  font-size: 5vw;
  color: #fe7141;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.animated-text div {
  margin-bottom: 2vh;
}

.left-text {
  left: 5vw;
  top: 5vh;
  animation: cascade-down 2s forwards;
  animation-delay: 0.5s;
  text-shadow: 
    1px 1px 0 black,
    -1px 1px 0 black,
    1px -1px 0 black,
    -1px -1px 0 black;
}

.right-text {
  right: 5vw;
  bottom: 5vh;
  animation: cascade-up 2s forwards;
  animation-delay: 1.5s;
  text-shadow: 
    1px 1px 0 black,
    -1px 1px 0 black,
    1px -1px 0 black,
    -1px -1px 0 black;
}

@keyframes cascade-down {
  to {
    opacity: 1;
    transform: translateY(25vh);
  }
}

@keyframes cascade-up {
  to {
    opacity: 1;
    transform: translateY(-25vh);
  }
}

.snack-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.glass-container {
  background-color: rgba(173, 216, 230, 0.3);
  width: 18vw;
  max-width: 280px;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid rgba(173, 216, 230, 0.6);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

.snack-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.row {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 40px;
}

.machine {
  background-image: url('@/assets/vending-machine.png');
  background-size: cover;
  background-position: center;
  border: 2px solid #999;
  border-radius: 5px;
  width: 8vw;
  max-width: 45px;
  height: 10vh;
  max-height: 60px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.machine:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.number-shelf {
  background-color: rgba(100, 100, 100, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  padding: 2px 5px;
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.machine-number {
  font-size: 12px;
  color: #ffffff;
  opacity: 0.9;
}

.snack-output {
  width: 18vw;
  max-width: 290px;
  height: 8vh;
  max-height: 80px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-top: 20px;
  align-self: center;
}

.controls-container {
  width: 10vw;
  max-width: 120px;
  padding-top: 18vh;
  max-height: 300px;
  padding-bottom: 15vh;
  padding-left: 1vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.screen {
  width: 110px;
  height: 110px; /* Ensure the height matches the width to form a square */
  background-color: #222;
  border-radius: 4px;
  border: 2px solid #444;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transform-origin: center;
  transition: transform 1s ease;
}

.screen.zoomed {
  transform: scale(6) translate(-22%, 15%);
  z-index: 999;
}

.overlay {
  position: fixed;
  padding-top: 100px;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  color: white;
  z-index: 1000;
}

.zoomed-text {
  font-size: 40px;
  color: white;
  margin: 10px 0;
  margin-left: 30px;
}

.back-button {
  margin-top: 100px;
  margin-left: 30px;
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
  background-color: #444;
  color: white;
  border: none;
  cursor: pointer;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 5px;
}

.keypad-button {
  width: 10px;
  height: 10px;
  background-color: #555;
  border-radius: 4px;
  border: 2px solid #777;
}

.keypad-button.red {
  background-color: red;
}

.keypad-button.green {
  background-color: green;
}

.cash-coin-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
}

.cash-slot {
  width: 50px;
  height: 3px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-bottom: 5px;
}

.coin-return {
  width: 20px;
  height: 20px;
  background-color: #777;
  border-radius: 50%;
  border: 2px solid #999;
}

.coin-return-tray {
  width: 50px;
  height: 30px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-top: 5px;
}
</style>