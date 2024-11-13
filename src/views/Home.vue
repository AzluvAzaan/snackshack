<template>
  <div id="vending-machine-page">
    <!-- Left Text Container (for desktop view) -->
    <div v-if="!isMobile" class="typing-text-container left">
      <span
        class="typing-text"
        v-for="(line, index) in leftText"
        :key="'left-' + index"
        :style="{ animationDelay: `${index * 1}s` }"
      >
        {{ line }}
      </span>
    </div>

    <!-- Mobile Text Container -->
    <div v-if="isMobile" class="typing-text-container mobile-top">
      <span
        class="typing-text"
        v-for="(line, index) in leftTextMobile"
        :key="'mobile-top-' + index"
        :style="{ animationDelay: `${index * 1}s` }"
      >
        {{ line }}
      </span>
    </div>

    <!-- Vending Machine Section -->
    <div class="vending-machine">
      <img src="@/assets/snackshack-logo.png" alt="SnackShack Logo" class="vending-machine-logo">

      <div class="snack-section">
        <div class="glass-container">
          <div class="snack-container">
            <!-- Adjust layout based on screen size (3x3 for mobile, 4x4 for desktop) -->
            <div class="row" v-for="rowIndex in (isMobile ? 3 : 4)" :key="rowIndex">
              <div
                v-for="(machine, index) in (isMobile ? 3 : 4)"
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
        <div class="snack-output"></div>
      </div>

      <!-- Controls Section -->
      <div class="controls-container">
        <div class="screen" :class="{ zoomed: isZoomed }">
          <div v-if="screenDisplay || errorFlash" class="screen-display" :class="{ error: errorFlash }">
            {{ errorFlash ? 'ERROR' : screenDisplay }}
          </div>
          <div
            v-if="showDetails"
            class="overlay"
            :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${selectedMachineDetails.imageUrl})` }"
          >
            <p class="zoomed-text"><strong>Machine Name:</strong> {{ selectedMachineDetails.machineName }}</p>
            <p class="zoomed-text"><strong>Description:</strong> {{ selectedMachineDetails.description }}</p>
            <p class="zoomed-text"><strong>Type:</strong> {{ selectedMachineDetails.type }}</p>
            <p class="zoomed-text"><strong>Payment Type:</strong> {{ selectedMachineDetails.paymentType.join(', ') }}</p>
            <button @click="zoomOut" class="back-button">Go Back</button>
            <button @click="viewOnMap" class="view-map-button">View on Map</button>
          </div>
        </div>

        <!-- Keypad -->
        <div class="keypad">
          <div class="keypad-button" v-for="key in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="key" @click="handleKeypadInput(key)">
            {{ key }}
          </div>
          <div class="keypad-button red" @click="handleBackspace"></div>
          <div class="keypad-button" @click="handleKeypadInput(0)">0</div>
          <div class="keypad-button green" @click="handleSubmit"></div>
        </div>
      </div>
    </div>

    <!-- Right Text Container (for desktop view) -->
    <div v-if="!isMobile" class="typing-text-container right">
      <span
        class="typing-text"
        v-for="(line, index) in rightText"
        :key="'right-' + index"
        :style="{ animationDelay: `${leftText.length * 1 + index * 1}s` }"
      >
        {{ line }}
      </span>
    </div>

    <!-- Mobile Text Container -->
    <div v-if="isMobile" class="typing-text-container mobile-bottom">
      <span
        class="typing-text"
        v-for="(line, index) in rightTextMobile"
        :key="'mobile-bottom-' + index"
        :style="{ animationDelay: `${leftTextMobile.length * 1 + index * 1}s` }"
      >
        {{ line }}
      </span>
    </div>
  </div>
</template>

<script>
  import { machineData, loadMachineData } from '@/data/machineData';
  import firestore from '@/firestore';

  export default {
    data() {
      return {
        leftText: ["Find", "vending", "machines", "near", "you."],
        rightText: ["Satisfy", "your", "cravings."],
        leftTextMobile: ["Find vending", "machines near", "you."],
        rightTextMobile: ["Satisfy your", "cravings."],
        machines: [],
        closestMachines: [],
        selectedMachineNumber: null,
        selectedMachineDetails: null,
        isZoomed: false,
        showDetails: false,
        errorFlash: false,
        screenDisplay: '',
        hoverKey: null,
        keys: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        isMobile: window.innerWidth <= 768,
      };
    },
    
    // Firestore data fetching
    async created() {
      await loadMachineData();
      this.machines = machineData;
      this.requestLocationAccess();
    },

    computed: {
      closestMachines() {
        return this.machines.slice(0, this.isMobile ? 9 : 16); // Adjust number of machines shown based on screen size
      },
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

      async findClosestMachines(userLat, userLng) {
        const vendingLocations = this.machines.map(machine => ({
          ...machine,
          distance: this.calculateDistance(userLat, userLng, machine.coordinates.latitude, machine.coordinates.longitude)
        }));

        vendingLocations.sort((a, b) => a.distance - b.distance);
        this.closestMachines = vendingLocations.slice(0, this.isMobile ? 9 : 16);
      },

      calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * (Math.PI / 180);
        const φ2 = lat2 * (Math.PI / 180);
        const Δφ = (lat2 - lat1) * (Math.PI / 180);
        const Δλ = (lon2 - lon1) * (Math.PI / 180);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
      },

      selectMachine(row, col) {
        const machineIndex = (row - 1) * (this.isMobile ? 3 : 4) + col;
        const selectedMachine = this.closestMachines[machineIndex];
        if (selectedMachine) {
          this.selectedMachineNumber = selectedMachine.id;
          this.selectedMachineDetails = selectedMachine;
          this.isZoomed = true;

          setTimeout(() => {
            this.showDetails = true;
          }, 1000);
        }
      },

      getMachineNumber(row, col) {
        return (row - 1) * (this.isMobile ? 3 : 4) + col + 1;
      },

      zoomOut() {
        this.isZoomed = false;
        this.showDetails = false;
        this.screenDisplay = '';
      },

      viewOnMap() {
        this.$router.push({
          name: 'Map',
          query: {
            machineId: this.selectedMachineDetails.id,
            lat: this.selectedMachineDetails.coordinates.latitude,
            lng: this.selectedMachineDetails.coordinates.longitude,
          },
        });
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

        if (this.isMobile) {
          if (machineNumber >= 1 && machineNumber <= 9) {
            const row = Math.ceil(machineNumber / 3);
            const col = (machineNumber - 1) % 3;
            this.selectMachine(row, col);
          } else {
            this.flashError();
          }
        } else {
          if (machineNumber >= 1 && machineNumber <= 16) {
            const row = Math.ceil(machineNumber / 4);
            const col = (machineNumber - 1) % 4;
            this.selectMachine(row, col);
          } else {
            this.flashError();
          }
        }
      },

      flashError() {
        this.errorFlash = true;
        this.screenDisplay = '';
        setTimeout(() => {
          this.errorFlash = false;
        }, 2000);
      },

      checkScreenSize() {
        this.isMobile = window.innerWidth <= 768;
      }
    },

    mounted() {
      window.addEventListener("resize", this.checkScreenSize);
    },

    beforeDestroy() {
      window.removeEventListener("resize", this.checkScreenSize);
    },
  };
</script>

<style>

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(to bottom, #003061, #001f3f, black);
  }

  #vending-machine-page {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background: linear-gradient(to bottom, #003061, #001f3f, black);
    height: 90vh;
    padding: 0 20px;
    box-sizing: border-box;
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
    z-index: 1;
  }

  .vending-machine-logo {
    position: absolute;
    top: 25px;
    padding-left: 10px;
    right: 0px;
    width: 155px;
    height: 140px;
  }

  .snack-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .glass-container {
    background-color: rgba(173, 216, 230, 0.3);
    width: 280px;
    padding: 20px;
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
    padding-top: 170px;
    padding-bottom: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .screen {
    width: 120px;
    height: 120px;
    background-color: #222;
    border-radius: 4px;
    border: 2px solid #444;
    margin-bottom: 15px;
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
    transform: scale(7) translate(-22%, 8%);
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
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
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
    gap: 8px;
    margin-bottom: 5px;
  }

  .keypad-button {
    padding-left: 8px;
    color: white;
    width: 30px;
    height: 30px;
    background-color: #555;
    border-radius: 8px;
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

  .typing-text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    color: orange;
    font-family: "Courier New", monospace;
    font-size: 1.5rem;
    text-align: center;
  }

  .typing-text-container.left {
    top: 45%;
    left: 10%;
    transform: translateY(-50%);
  }

  .typing-text-container.right {
    top: 45%;
    right: 10%;
    transform: translateY(-50%);
  }

  .typing-text {
    font-size: 3rem;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    animation: typing 1s steps(20, end) forwards;
  }

  .typing-text:nth-child(1) { animation-delay: 0s; }
  .typing-text:nth-child(2) { animation-delay: 0.5s; }
  .typing-text:nth-child(3) { animation-delay: 1.5s; }
  .typing-text:nth-child(4) { animation-delay: 2s; }
  .typing-text:nth-child(5) { animation-delay: 2.5s; }

  /* Right text delays after left text finishes */
  .typing-text-container.right .typing-text:nth-child(1) { animation-delay: 3s; }
  .typing-text-container.right .typing-text:nth-child(2) { animation-delay: 3.5s; }
  .typing-text-container.right .typing-text:nth-child(3) { animation-delay: 4s; }

  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }

  .typing-text-container.mobile-top {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    margin-bottom: 10px;
    text-align: center;
    color: orange;
  }

  .typing-text-container.mobile-bottom {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    margin-top: 10px;
    text-align: center;
    color: orange;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .controls-container {
      width: 60px;
      padding-top: 90px;
      padding-bottom: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      }

    .typing-text-container.left,
    .typing-text-container.right {
      display: none;
    }

    .typing-text-container.mobile-top,
    .typing-text-container.mobile-bottom {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
      color: orange;
      text-align: center;
    }

    .typing-text-container.mobile-top {
      top: 0.7rem;
    }

    .typing-text-container.mobile-bottom {
      bottom: 3rem;
    }

    .typing-text {
      font-size: 2rem;
    }

    .screen {
      margin-top: 50px;
      width: 70px;
      height: 70px;
      margin-right: 7px;
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
      transform: scale(4.5) translate(-34%, 8%);
      z-index: 999;
      }

    .screen-display {
      font-size: 18px;
      color: #00ff00;
      }

    .zoomed-text {
      font-size: 2.2px;
      color: white;
      margin: 1px 0;
      }

    .back-button,
    .view-map-button {
      margin-top: 3px;
      padding: 2px 3px;
      font-size: 2px;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .vending-machine-logo {
      position: absolute;
      top: 40px;
      right: 0px;
      width: 92px;
      height: auto;
    }
    .vending-machine {
      width: 300px;
      height: auto;
    }
    
    .glass-container {
      width: 200px;
    }

    .controls-container {
      padding-left: 15px;
      width: 80px;
      padding-top: 100px;
      padding-bottom: 40px;
    }

    .keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 100px;
    margin-right: 8px;
    }

    .keypad-button {
      font-size: 8px;
      padding-left: 2px;
      border-radius: 5px;
      width: 15px;
      height: 15px;
    }

    .cash-coin-container {
    display: none;
    }

    .coin-return-tray {
    display: none;
    }
    .snack-output {
    width: 200px;
    height: 80px;
    background-color: #444;
    border-radius: 4px;
    border: 2px solid #666;
    margin-top: 20px;
    align-self: center;
    }
  }
</style>
