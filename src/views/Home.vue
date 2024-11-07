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
        <div class="screen" :class="{ zoomed: isZoomed }">
          <div v-if="screenDisplay || errorFlash" class="screen-display" :class="{ error: errorFlash }">
            {{ errorFlash ? 'ERROR' : screenDisplay }}
          </div>
          <!-- Overlay for displaying details and back button (renders after zoom completes) -->
          <div
            v-if="showDetails"
            class="overlay"
            :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${selectedMachineDetails.imageUrl})` }"
          >
            <p class="zoomed-text"><strong>Machine Number:</strong> {{ selectedMachineNumber }}</p>
            <p class="zoomed-text"><strong>Machine Name:</strong> {{ selectedMachineDetails.machineName }}</p>
            <p class="zoomed-text"><strong>Description:</strong> {{ selectedMachineDetails.description }}</p>
            <p class="zoomed-text"><strong>Type:</strong> {{ selectedMachineDetails.type }}</p>
            <p class="zoomed-text"><strong>Payment Type:</strong> {{ selectedMachineDetails.paymentType.join(', ') }}</p>
            <button @click="zoomOut" class="back-button">Go Back</button>
            <button @click="viewOnMap" class="view-map-button">View on Map</button>
          </div>
        </div>
        <div class="keypad">
          <div
            v-for="key in keys"
            :key="key"
            class="keypad-button"
            @click="handleKeypadInput(key)"
            @mouseover="hoverKey = key"
            @mouseleave="hoverKey = null"
            :class="{ hover: hoverKey === key }"
          ></div>
          <div class="keypad-button red" @click="handleBackspace"></div>
          <div class="keypad-button" @click="handleKeypadInput(0)"></div>
          <div class="keypad-button green" @click="handleSubmit"></div>
        </div>
        <div class="cash-coin-container">
          <div class="cash-slot"></div>
          <div class="coin-return"></div>
        </div>
        <div class="coin-return-tray"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { machineData } from '@/data/machineData.js';
  import Navbar from '@/components/Navbar.vue';

  export default {
    components: {
      Navbar
    },

    created() {
      this.requestLocationAccess();
    },

    data() {
      return {
        selectedMachineNumber: null,
        selectedMachineDetails: null,
        isZoomed: false,
        showDetails: false,
        errorFlash: false,
        screenDisplay: '',
        hoverKey: null,
        keys: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      };
    },
    methods: {
      requestLocationAccess() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            this.handleLocationSuccess,
            this.handleLocationError
          );
        } else {
          console.log("Geolocation is not supported by this browser.");
        }
      },
      handleLocationSuccess(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        this.findClosestMachines(userLat, userLng);
      },
      handleLocationError(error) {
        console.log("Error getting location:", error);
      },
      findClosestMachines(userLat, userLng) {
        const vendingLocations = Object.values(machineData).map((machine) => ({
          lat: machine.coordinates.latitude,
          lng: machine.coordinates.longitude,
          machine,
        }));
        
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [{ lat: userLat, lng: userLng }],
            destinations: vendingLocations.map(loc => loc),
            travelMode: 'WALKING',
          },
          this.processDistances
        );
      },
      processDistances(response, status) {
        if (status === "OK") {
          const distances = response.rows[0].elements.map((element, index) => ({
            distance: element.distance.value,
            machine: Object.values(machineData)[index]
          }));
          
          distances.sort((a, b) => a.distance - b.distance);
          this.closestMachines = distances.slice(0, 16).map(d => d.machine);
        }
      },

      selectMachine(row, col) {
        const machineNumber = this.getMachineNumber(row, col);
        this.selectedMachineNumber = machineNumber;
        this.selectedMachineDetails = machineData[machineNumber];

        this.isZoomed = true;

        setTimeout(() => {
          this.showDetails = true;
        }, 1000);
      },
      getMachineNumber(row, col) {
        return (row - 1) * 4 + col + 1;
      },
      zoomOut() {
        this.isZoomed = false;
        this.showDetails = false;
        this.screenDisplay = ''; // Clear screen display on zoom out
      },
      viewOnMap() {
        this.$router.push({ name: 'Map' });
      },
      handleKeypadInput(key) {
        if (this.screenDisplay.length < 2) {
          this.screenDisplay += key;
        }
      },
      handleBackspace() {
        this.screenDisplay = this.screenDisplay.slice(0, -1);
      },
      handleSubmit() {
        const machineNumber = parseInt(this.screenDisplay, 10);
        if (machineNumber >= 1 && machineNumber <= 16) {
          const row = Math.ceil(machineNumber / 4);
          const col = (machineNumber - 1) % 4;
          this.selectMachine(row, col);
        } else {
          this.flashError();
        }
      },
      flashError() {
        this.errorFlash = true;
        this.screenDisplay = '';
        setTimeout(() => {
          this.errorFlash = false;
        }, 2000); // Flash error twice within 800ms
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
  background-color: #001f3f;
}

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
  transform: scale(1.3);
  transform-origin: center;
}

.vending-machine-logo {
  position: absolute;
  top: 20px;
  right: 0px;
  width: 140px;
  height: auto;
}

.snack-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.glass-container {
  background-color: rgba(173, 216, 230, 0.3);
  width: 280px;
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
  transition: transform 1s ease;
}

.screen-display.error {
  color: red;
  animation: flash 1.8s ease-in-out alternate 2;
}

@keyframes flash {
  0%, 100% { color: #00ff00; }
  50% { color: red; }
}

.screen.zoomed {
  transform: scale(6) translate(-22%, 15%);
  z-index: 999;
}

.overlay {
  position: fixed;
  border-radius: 4px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-blend-mode: darken;
  background-color: rgba(0, 0, 0, 0.5);
}

.screen-display {
  font-size: 24px;
  color: #00ff00;
}

.zoomed-text {
  font-size: 4px;
  color: white;
  margin: 2px 0;
}

.back-button,
.view-map-button {
  margin-top: 3px;
  padding: 3px 4px;
  font-size: 3px;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button {
  background-color: #444;
}

.view-map-button {
  background-color: #007bff;
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
  cursor: pointer;
  transition: transform 0.2s;
}

.keypad-button.hover {
  transform: scale(1.1);
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
