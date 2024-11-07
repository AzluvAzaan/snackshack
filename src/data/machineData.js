import firestore from '@/firestore';

let machineData = []; // Initial empty array for vending machines data

async function loadMachineData() {
  try {
    machineData = await firestore.getAllVendingMachines(); // Load data from Firestore
  } catch (error) {
    console.error("Error loading vending machines data:", error);
  }
}

loadMachineData(); // Immediately load data when this module is imported

export { machineData, loadMachineData };
