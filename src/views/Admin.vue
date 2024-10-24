<template>
  <div class="admin-container">
    <h1>Admin Page</h1>
    <p v-if="currentUser">Logged in as: {{ currentUser.email }}</p>
    <button @click="logout" class="logout-button">Logout</button>
    
    <h2>Your Vending Machines</h2>

    <button @click="showAddForm = true" class="add-button">Add Vending Machine</button>
    <table border="1" class="vending-machines-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Location</th>
          <th>Items</th>
          <th>Status</th>
          <th>Type</th>
          <th>Payment Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="machine in userMachines" :key="machine.id">
          <td>{{ machine.machineName }}</td>
          <td>{{ machine.description }}</td>
          <td>{{ machine.locDes }}</td>
          <td> {{ machine.contents.join(', ') }}</td>
          <td>{{ machine.status }}</td>
          <td>{{ machine.type }}</td>
          <td>{{ machine.paymentType.join(', ') }}</td>
          <td>
            <button @click="editMachine(machine)">Edit</button>
            <button @click="showImage(machine)" v-if="machine.imageUrl">Show Image</button>
            <button @click="deleteMachine(machine.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    

    <div v-if="showAddForm" class="add-form">
      <h3>{{ isEditing ? 'Edit' : 'Add' }} Vending Machine</h3>
      <form @submit.prevent="addOrUpdateVendingMachine">
        <div class="form-group">
          <label for="machineName">Machine Name:</label>
          <input v-model="newMachine.machineName" id="machineName" required>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea v-model="newMachine.description" id="description" required></textarea>
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
            <label><input type="checkbox" v-model="newMachine.paymentType" value="Card"> Card</label>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="Coin"> Coin</label>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="Note"> Note</label>
            <label><input type="checkbox" v-model="newMachine.paymentType" value="Others"> Other</label>
          </div>
        </div>
        <div class="form-group">
          <label for="status">Status:</label>
          <select v-model="newMachine.status" id="status" required>
            <option value="Running">Running</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out Of Order">Out of Order</option>
          </select>
        </div>
        <div class="form-group">
          <label for="type">Type:</label>
          <select v-model="newMachine.type" id="type" required>
            <option value="Drinks">Drinks</option>
            <option value="Snacks">Snacks</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="latitude">Latitude:</label>
          <input v-model="newMachine.coordinates.latitude" id="latitude" type="number" step="any" required>
        </div>
        <div class="form-group">
          <label for="longitude">Longitude:</label>
          <input v-model="newMachine.coordinates.longitude" id="longitude" type="number" step="any" required>
        </div>
        <div class="form-group">
          <a href="https://www.latlong.net/convert-address-to-lat-long.html" target="_blank" rel="noopener noreferrer">
            Don't know your coordinates? Click here!
          </a>
        </div>
        <div>
          <label for="addItem">Add Item:</label>
          <input v-model="newContent" @keyup.enter="addContent" placeholder="Enter item name">
          <button type="button" @click="addContent">Add Item</button>
        </div>
        <label for="contents">Contents in this Machine:</label>
        <ol>
          <li v-for="(item, index) in newMachine.contents" :key="index">
            {{ item }}
            <button type="button" @click="removeContent(index)">Remove</button>
          </li>
        </ol>
        <button type="submit">{{ isEditing ? 'Update' : 'Add' }} Vending Machine</button>
        <button type="button" @click="cancelAddOrEdit">Cancel</button>
        <div class="form-group">
        
      </div>
      </form>
    </div>

    
  </div>
</template>

<script>
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from '@/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';

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
        status: 'Running',
        type: 'Drinks',
        coordinates: {
          latitude: null,
          longitude: null
        },
        contents: [],
      },
      userMachines: [],
      showAddForm: false,
      isEditing: false,
      editingMachineId: null,
      selectedFile: null,
      newContent: '',
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
        this.$router.push('/login');
      }
    });
  },
  methods: {
    async logout() {
      try {
        //calls firebase auth signOut method to sign out user
        await signOut(auth);
        console.log("User signed out successfully");
        //redirects user to home page after sign out
        this.$router.push('/');
      } catch (error) {
        //console.error("Error signing out: ", error);
      }
    },
    //stores uploaded file as selectedFile
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },

    async uploadImage() {
      //return null if no file is selected
      if (!this.selectedFile) return null;
      //stores image in firebase storage, rename it to current timestamp+file name to prevent duplicate names
      const storageRef = ref(storage, `machine-images/${Date.now()}_${this.selectedFile.name}`);
      await uploadBytes(storageRef, this.selectedFile);
      //return url of image
      return await getDownloadURL(storageRef);
    },

    addContent() {
      if (this.newContent.trim()) {
        this.newMachine.contents.push(this.newContent.trim());
        this.newContent = '';
      }
    },

    removeContent(index) {
      this.newMachine.contents.splice(index, 1);
    },

    async addOrUpdateVendingMachine() {
    try {
      let imageUrl = null;
      let oldImageUrl = this.isEditing ? this.newMachine.imageUrl : null; //store image url of old image if editing

      // Check if a new image is uploaded
      if (this.selectedFile) {
        // Upload new image
        imageUrl = await this.uploadImage();

        // Delete old image if it exists
        if (oldImageUrl) {
          try {
            const oldImageRef = ref(storage, oldImageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Error deleting old image:", error);
            // Continue with the update even if deletion fails
          }
        }
      } else {
        // If no new image is uploaded, keep the existing image URL
        imageUrl = oldImageUrl;
      }

      const machineData = {
        //let newMachine = { machineName: "xxx", location: "xxx", ... };
        //let machineData = ...this.newMachine -> { machineName: "xxx", location: "xxx", ... }
        ...this.newMachine,
        imageUrl: imageUrl,
        contents: this.newMachine.contents,
      };

      // Check if editing
      if (this.isEditing) {
        //Calls updateDoc method to update document in firestore
        await updateDoc(doc(db, "vendingMachines", this.editingMachineId), {
          ...machineData,
        });
        alert('Vending machine updated successfully!'); // Can comment out or do other pop-up messages
      } else {
         //If not editing, calls addDoc method to add object to firestore
        await addDoc(collection(db, "vendingMachines"), {
          ...machineData,
          userId: this.currentUser.uid
        });
        alert('Vending machine added successfully!');
      }

      this.clearForm();
      this.fetchUserMachines();
      this.showAddForm = false;
    } catch (e) {
      console.error("Error adding/updating document: ", e);
      alert('Error adding/updating vending machine. Please try again.');// Can comment out or do other pop-up messages
    }
  },

    //Resets form to original state
    clearForm() {
      this.newMachine = {
        machineName: '',
        description: '',
        locDes: '',
        paymentType: [],
        status: 'Running',
        type: 'Drinks',
        coordinates: {
          latitude: null,
          longitude: null
        },
        contents: [],
        imageUrl: null 
      };
      this.newContent = '';
      this.isEditing = false;
      this.editingMachineId = null;
      this.selectedFile = null; 
    },
    // Fetches user's owned vending machines from firestore
    async fetchUserMachines() {
      try {
        //query vending machines under user's id
        const q = query(collection(db, "vendingMachines"), where("userId", "==", this.currentUser.uid));
        //getDocs method to execute query
        const querySnapshot = await getDocs(q);
        //store results under userMachines
        //map() transforms document to JS object
        // ...doc.data() extracts data from document and turn them into object
        this.userMachines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(this.userMachines);
      } catch (error) {
        console.error("Error fetching user machines: ", error);
      }
    },
    // Delete vending machine from firestore
    async deleteMachine(machineId) {
      if (confirm("Are you sure you want to delete this vending machine?")) {
        try {
          // call deleteDoc firebase method to delete vending machine via machineId
          await deleteDoc(doc(db, "vendingMachines", machineId));
          alert("Vending machine deleted successfully!");
          this.fetchUserMachines();
        } catch (error) {
          console.error("Error deleting vending machine: ", error);
          alert("Error deleting vending machine. Please try again.");
        }
      }
    },
    // Show image of vending machine
    showImage(machine) {
      if (machine.imageUrl) {
        window.open(machine.imageUrl, '_blank');
      } else {
        alert('No image available for this vending machine.');
      }
    },

    //Edit vending machine
    editMachine(machine) {
      this.newMachine = { 
        ...machine,
        contents: [...(machine.contents || [])], // Ensure contents is an array
      };
      this.isEditing = true;
      this.editingMachineId = machine.id;
      this.showAddForm = true;
    },
    //Cancel adding or editing vending machine
    cancelAddOrEdit() {
      this.clearForm();
      this.showAddForm = false;
    }
  }
};
</script>