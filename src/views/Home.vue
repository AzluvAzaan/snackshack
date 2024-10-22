<template>
  <div class="page-container">
    <div class="vending-machine">
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

<style scoped>

/* Center the vending machine and apply dark blue background to the entire page */

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #001f3f; /* Dark blue background */
  margin: 0;
  padding: 0;
}

/* Main vending machine box */
.vending-machine {
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
}

/* Snack section containing both the glass container and snack output tray */
.snack-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Glass effect container around the snack compartments */
.glass-container {
  background-color: rgba(173, 216, 230, 0.3); /* Light blue glass effect */
  width: 280px;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid rgba(173, 216, 230, 0.6); /* Semi-transparent border */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);   /* Subtle shadow for realism */
  backdrop-filter: blur(4px);
}

/* Snack container inside the glass container */
.snack-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Row of clickable elements */
.row {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 50px;
}

/* Each "machine" or "snack compartment" */
.machine {
  background-color: #e0e0e0;
  border: 2px solid #999;
  border-radius: 5px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

/* Hover effect for the compartments */
.machine:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Container that encases the number to look like a shelf */
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

/* Number displayed inside the shelf */
.machine-number {
  font-size: 12px;
  color: #ffffff;
  opacity: 0.9;
}

/* Snack output tray positioned below the glass container */
.snack-output {
  width: 290px;
  height: 80px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-top: 20px;
  align-self: center;
}

/* Right side: Controls (keypad, screen, etc.) */
.controls-container {
  width: 120px;
  padding-top: 150px;
  padding-bottom: 150px;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

/* Zoom effect for the screen */
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
  transform: scale(6); /* Enlarges the screen */
  z-index: 999;
}

/* Overlay for displaying text and button (only renders after zoom completes) */
.overlay {
  position: fixed;
  top: 0;
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

/* Text inside the overlay */
.zoomed-text {
  font-size: 24px;
  color: white;
  margin: 10px 0; /* Add some spacing between the texts */
  margin-left: 300px;
}

/* Go back button */
.back-button {
  margin-top: 100px;
  margin-left: 300px;
  margin-bottom: 200px;
  padding: 10px;
  font-size: 16px;
  background-color: #444;
  color: white;
  border: none;
  cursor: pointer;
}

/* Keypad grid */
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

/* Red button in the fourth row */
.keypad-button.red {
  background-color: red;
}

/* Green button in the fourth row */
.keypad-button.green {
  background-color: green;
}

/* Align cash slot and coin return button next to each other */
.cash-coin-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
}

/* Cash slot */
.cash-slot {
  width: 50px;
  height: 3px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-bottom: 5px;
}

/* Coin return button */
.coin-return {
  width: 20px;
  height: 20px;
  background-color: #777;
  border-radius: 50%;
  border: 2px solid #999;
}

/* Coin return tray below coin slot and button */
.coin-return-tray {
  width: 50px;
  height: 30px;
  background-color: #444;
  border-radius: 4px;
  border: 2px solid #666;
  margin-top: 5px;
}

</style>
