<template>
<div id="vending-machine-page">
  <div class="vending-machine">
    <!-- Logo positioned at the top right corner -->
    <img src="@/assets/snackshack.png" alt="SnackShack Logo" class="vending-machine-logo">

    <!-- Left side: Glass container + Snack output -->
    <div class="snack-section">
      <div class="glass-container">
        <div class="snack-container">
          <div class="row" v-for="rowIndex in 4" :key="rowIndex">
            <div
              v-for="(machine, index) in 4"
              :key="index"
              class="machine"
              @click="selectMachine(rowIndex, index)"
            >
              <div class="number-shelf">
                <span class="machine-number">{{ getMachineNumber(rowIndex, index) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Snack output tray -->
      <div class="snack-output"></div>
    </div>

    <!-- Right side with controls -->
    <div class="controls-container">
      <div class="screen" :class="{ zoomed: isZoomed }"></div>
      <div class="keypad">
        <div v-for="key in 9" :key="key" class="keypad-button"></div>
        <div class="keypad-button red"></div>
        <div class="keypad-button"></div>
        <div class="keypad-button green"></div>
      </div>
      <div class="cash-coin-container">
        <div class="cash-slot"></div>
        <div class="coin-return"></div>
      </div>
      <div class="coin-return-tray"></div>
    </div>
  </div>

  <!-- Overlay for displaying details and back button (renders after zoom completes) -->
  <div v-if="showDetails" class="overlay">
    <p class="zoomed-text"><strong>Machine Number:</strong> {{ selectedMachineNumber }}</p>
    <p class="zoomed-text"><strong>Location:</strong> {{ selectedMachineDetails.location }}</p>
    <p class="zoomed-text"><strong>Type:</strong> {{ selectedMachineDetails.type }}</p>
    <p class="zoomed-text"><strong>Payment Methods:</strong> {{ selectedMachineDetails.paymentMethods.join(', ') }}</p>
    <p class="zoomed-text"><strong>Rating:</strong> {{ selectedMachineDetails.rating }} stars</p>
    <button @click="zoomOut" class="back-button">Go Back</button>
  </div>
</div>
</template>

<script>
import { machineData } from '@/data/machineData.js'; // Import the placeholder data
import Navbar from '@/components/Navbar.vue';

export default {

  components: {
     Navbar 
  },

  data() {
    return {
      selectedMachineNumber: null,
      selectedMachineDetails: null, // Store machine details here
      isZoomed: false, // Toggle zoom effect
      showDetails: false, // Toggle to show text and button after zoom
    };
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
      return (row - 1) * 4 + col + 1; // Calculate unique number for each machine
    },
    zoomOut() {
      this.isZoomed = false; // Reset zoom and return to main view
      this.showDetails = false; // Hide details when zooming out
    }
  }
};
</script>

<style>

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
  background-color: #001f3f; /* Dark blue background specific to this page */
}

/* Main vending machine box */
.vending-machine {
  position: relative;
  background-color: #333;
  border-radius: 20px;
  width: 450px;
  height: 600px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 3px solid #555;
  transform: scale(1.3); /* Adjust the scale factor as needed */
  transform-origin: center;
}

/* Logo styling */
.vending-machine-logo {
  position: absolute;
  top: 20px;
  right: 0px;
  width: 140px; /* Adjust size as needed */
  height: auto;
}

/* Other styles remain unchanged */
.snack-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.glass-container {
  background-color: rgba(173, 216, 230, 0.3); /* Light blue glass effect */
  width: 280px;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid rgba(173, 216, 230, 0.6); /* Semi-transparent border */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);   /* Subtle shadow for realism */
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
  background-image: url('@/assets/vending-machine.png'); /* Use the vending machine image */
  background-size: cover; /* Ensure the image covers the entire element */
  background-position: center; /* Center the image */
  border: 2px solid #999;
  border-radius: 5px;
  width: 45px;
  height: 60px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.machine:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.number-shelf {
  background-color: rgba(100, 100, 100, 0.7); /* Darker semi-transparent background */
  border: 1px solid rgba(255, 255, 255, 0.5); /* Light border for the shelf */
  border-radius: 4px; /* Rounded corners */
  padding: 2px 5px; /* Some padding around the number */
  position: absolute;
  bottom: -20px; /* Position the shelf below the machine */
  left: 50%;
  transform: translateX(-50%);
}

.machine-number {
  font-size: 12px;
  color: #ffffff;
  opacity: 0.9;
}

.snack-output {
  width: 290px;
  height: 80px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-top: 20px;
  align-self: center;
}

.controls-container {
  width: 120px;
  padding-top: 180px;
  padding-bottom: 120px;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.screen {
  width: 110px;
  height: 100px;
  background-color: #222;
  border-radius: 4px;
  border: 2px solid #444;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transform-origin: center;
  transition: transform 1s ease; /* Smooth zoom transition */
}

.screen.zoomed {
  transform: scale(6) translate(-22%, 15%); /* Enlarges the screen */
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
  z-index: 1000; /* Make sure it's above the screen */
}

.zoomed-text {
  font-size: 40px;
  color: white;
  margin: 10px 0; /* Add some spacing between the texts */
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