<template>
  <div class="vending-machine-container">
    <!-- Main vending machine layout -->
    <div class="vending-machine">
      <!-- Left side: Glass container + Snack output -->
      <div class="snack-section">
        <!-- Glass container around snack compartments -->
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

        <!-- Snack output tray below the glass container -->
        <div class="snack-output"></div>
      </div>

      <!-- Right side with controls -->
      <div class="controls-container">
        <!-- Screen -->
        <div class="screen"></div>

        <!-- Keypad -->
        <div class="keypad">
          <div v-for="key in 9" :key="key" class="keypad-button"></div>
          <!-- Fourth row of buttons -->
          <div class="keypad-button red"></div>
          <div class="keypad-button"></div> <!-- Keep this one grey like the rest -->
          <div class="keypad-button green"></div>
        </div>

        <!-- Cash slot and coin return button aligned next to each other -->
        <div class="cash-coin-container">
          <div class="cash-slot"></div>
          <div class="coin-return"></div>
        </div>

        <!-- Coin return tray -->
        <div class="coin-return-tray"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    selectMachine(row, col) {
      const machineNumber = this.getMachineNumber(row, col);
      alert(`You clicked on machine number ${machineNumber}`);
    },
    getMachineNumber(row, col) {
      return (row-1)*4 + col + 1; // Calculate a unique number for each machine
    }
  }
};
</script>

<style scoped>
/* Container for the whole vending machine page */
.vending-machine-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: grey;
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

/* Hover effect for the compartments */
.machine:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

/* Screen */
.screen {
  width: 110px;
  height: 100px;
  background-color: #222;
  border-radius: 4px;
  border: 2px solid #444;
  margin-bottom: 5px;
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