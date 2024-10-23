<template>
  <div class="admin-container">
    <h1>Admin Page</h1>
    <p v-if="currentUser">Connected as: {{ currentUser.email }}</p>
    
    <h2>Your Vending Machines</h2>
    <table class="vending-machines-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Location</th>
          <th>Status</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="machine in userMachines" :key="machine.id">
          <td>{{ machine.machineName }}</td>
          <td>{{ machine.locDes }}</td>
          <td>{{ machine.status }}</td>
          <td>{{ machine.type }}</td>
          <td>
            <button @click="editMachine(machine)">Edit</button>
            <button @click="deleteMachine(machine.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="showAddForm = true" class="add-button">Add Vending Machine</button>

    <div v-if="showAddForm" class="add-form">
      <h3>{{ isEditing ? 'Edit' : 'Add' }} Vending Machine</h3>
      <form @submit.prevent="addOrUpdateVendingMachine">
        <div class="form-group">
          <label for="machineName">Machine Name:</label>
          <input v-model="newMachine.machineName" id="machineName" required>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea v-model="newMachine.description" id="description"></textarea>
        </div>
        <div class="form-group">
          <label for="locDes">Location:</label>
          <input v-model="newMachine.locDes" id="locDes" required>
        </div>
        <div class="form-group">
        <label for="image">Machine Image:</label>
        <input type="file" @change="onFileSelected" accept="image/*" id="image">
      </div>
        <div class="form-group">
          <label>Payment Types:</label>
          <div>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="card"> card</label>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="coin"> coin</label>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="note"> note</label>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="others"> other</label>
          </div>
        </div>
        <div class="form-group">
          <label for="status">Status:</label>
          <select v-model="newMachine.status" id="status">
            <option value="running">Running</option>
            <option value="maintenance">Maintenance</option>
            <option value="outOfOrder">Out of Order</option>
          </select>
        </div>
        <div class="form-group">
          <label for="type">Type:</label>
          <select v-model="newMachine.type" id="type">
            <option value="drinks">Drinks</option>
            <option value="snacks">Snacks</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div class="form-group">
          <label for="latitude">Latitude:</label>
          <input v-model="newMachine.coordinates.latitude" id="latitude" type="number" step="any">
        </div>
        <div class="form-group">
          <label for="longitude">Longitude:</label>
          <input v-model="newMachine.coordinates.longitude" id="longitude" type="number" step="any">
        </div>
        <button type="submit">{{ isEditing ? 'Update' : 'Add' }} Vending Machine</button>
        <button type="button" @click="cancelAddOrEdit">Cancel</button>
      </form>
    </div>

    <button @click="logout" class="logout-button">Logout</button>
  </div>
</template>

<script>
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from '@/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'Admin',
  data() {
    return {
      currentUser: null,
      newMachine: {
        machineName: '',
        description: '',
        locDes: '',
        paymentType: [],
        status: 'running',
        type: 'drinks',
        coordinates: {
          latitude: null,
          longitude: null
        }
      },
      userMachines: [],
      showAddForm: false,
      isEditing: false,
      editingMachineId: null,
      selectedFile: null
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.fetchUserMachines();
      } else {
        this.currentUser = null;
        this.userMachines = [];
      }
    });
  },
  methods: {
    async logout() {
      try {
        await signOut(auth);
        console.log("User signed out successfully");
        this.$router.push('/');
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    },
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },

    async uploadImage() {
      if (!this.selectedFile) return null;

      const storageRef = ref(storage, `machine-images/${Date.now()}_${this.selectedFile.name}`);
      await uploadBytes(storageRef, this.selectedFile);
      return await getDownloadURL(storageRef);
    },

    async addOrUpdateVendingMachine() {
      try {
        let imageUrl = null;
        if (this.selectedFile) {
          imageUrl = await this.uploadImage();
        }

        const machineData = {
          ...this.newMachine,
          imageUrl: imageUrl || this.newMachine.imageUrl, // Use existing URL if no new image
        };

        if (this.isEditing) {
          await updateDoc(doc(db, "vendingMachines", this.editingMachineId), {
            ...machineData,
            updatedAt: new Date()
          });
          alert('Vending machine updated successfully!');
        } else {
          await addDoc(collection(db, "vendingMachines"), {
            ...machineData,
            createdAt: new Date(),
            userId: this.currentUser.uid
          });
          alert('Vending machine added successfully!');
        }
        this.clearForm();
        this.fetchUserMachines();
        this.showAddForm = false;
      } catch (e) {
        console.error("Error adding/updating document: ", e);
        alert('Error adding/updating vending machine. Please try again.');
      }
    },

    clearForm() {
      this.newMachine = {
        machineName: '',
        description: '',
        locDes: '',
        paymentType: [],
        status: 'running',
        type: 'drinks',
        coordinates: {
          latitude: null,
          longitude: null
        },
        imageUrl: null // Add this line
      };
      this.isEditing = false;
      this.editingMachineId = null;
      this.selectedFile = null; // Reset selected file
    },
    async fetchUserMachines() {
      try {
        const q = query(collection(db, "vendingMachines"), where("userId", "==", this.currentUser.uid));
        const querySnapshot = await getDocs(q);
        this.userMachines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching user machines: ", error);
      }
    },
    async deleteMachine(machineId) {
      if (confirm("Are you sure you want to delete this vending machine?")) {
        try {
          await deleteDoc(doc(db, "vendingMachines", machineId));
          alert("Vending machine deleted successfully!");
          this.fetchUserMachines();
        } catch (error) {
          console.error("Error deleting vending machine: ", error);
          alert("Error deleting vending machine. Please try again.");
        }
      }
    },
    editMachine(machine) {
      this.newMachine = { ...machine };
      this.isEditing = true;
      this.editingMachineId = machine.id;
      this.showAddForm = true;
    },
    cancelAddOrEdit() {
      this.clearForm();
      this.showAddForm = false;
    }
  }
};
</script>