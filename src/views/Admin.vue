<template>
<div id="admin-page">
    <div class="admin-container container py-4 min-vh-100">
      <!-- Alert for add/edit/delete/cancel vending machine functions messages -->
      <div v-if="alert.show" :class="`alert alert-${alert.type} alert-dismissible fade show`" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="closeAlert" aria-label="Close"></button>
      </div>


      <div class="row mb-4 align-items-center">
        <div class="col-12 col-md-8">
          <h1 class="mb-0">Admin Page</h1>
        </div>
        <div class="col-12 col-md-4 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
          <p v-if="currentUser" class="mb-0 me-3">Logged in as: {{ currentUser.email }}</p>
          <!-- Logout button to log out user-->
          <button @click="logout" class="btn btn-danger">Logout</button>
        </div>
      </div>

      <!-- Vending Machine + Add Machine Button-->
      <div class="row mb-4">
        <div class="col-12">
          <h2>Your Vending Machines</h2>
          <button @click="showAddForm = true" class="btn btn-primary mb-3">Add a new Vending Machine</button>
        </div>
      </div>
    
      <!-- Add/Edit Vending Machine Form -->
      <div v-if="showAddForm" class="add-form card mb-4">
        <div class="card-body">
          <h3 class="card-title mb-4">{{ isEditing ? 'Edit' : 'Add' }} Vending Machine</h3>
          <form @submit.prevent="addOrUpdateVendingMachine">
            <!-- Form Fields for Machine Details -->
            <div class="row">
              <div class="col-12 col-sm-4 mb-3">
                <label for="machineName" class="form-label">Machine Name:</label>
                <input v-model="newMachine.machineName" id="machineName" class="form-control" required>
              </div>

              <!-- Select Status of Current Machine-->
              <div class="col-6 col-sm-4 mb-3">
                <div class="mb-3">
                  <label for="status" class="form-label">Status:</label>
                  <select v-model="newMachine.status" id="status" class="form-select" required>
                    <option value="Running">Running</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out Of Order">Out of Order</option>
                  </select>
                </div>
              </div>
              <!-- Select Machine Type Field-->
              <div class="col-6 col-sm-4 mb-3">
                <label for="type" class="form-label">Type:</label>
                <select v-model="newMachine.type" id="type" class="form-select" required>
                  <option value="Drinks">Drinks</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <!-- Description and Location Field -->
            <div class="row">
              <div class="col-md-6 col-lg-4 mb-3">
                <label for="description" class="form-label">Description:</label>
                <textarea v-model="newMachine.description" id="description" class="form-control" required></textarea>
              </div>
              <div class="col-md-6 col-lg-4 mb-3">
                <label for="image" class="form-label">Machine Image:</label>
                <input type="file" @change="onFileSelected" accept="image/*" id="image" class="form-control">
              </div>
              <!-- Payment Type Field-->
              <div class="col-4 mb-3">
                <label class="form-label">Payment Types:</label>
                <div class="form-check">
                  <input type="checkbox" v-model="newMachine.paymentType" value="Card" class="form-check-input" id="cardPayment">
                  <label class="form-check-label" for="cardPayment">Card</label>
                </div>
                <div class="form-check">
                  <input type="checkbox" v-model="newMachine.paymentType" value="Coin" class="form-check-input" id="coinPayment">
                  <label class="form-check-label" for="coinPayment">Coin</label>
                </div>
                <div class="form-check">
                  <input type="checkbox" v-model="newMachine.paymentType" value="Note" class="form-check-input" id="notePayment">
                  <label class="form-check-label" for="notePayment">Note</label>
                </div>
                <div class="form-check">
                  <input type="checkbox" v-model="newMachine.paymentType" value="Others" class="form-check-input" id="otherPayment">
                  <label class="form-check-label" for="otherPayment">Other</label>
                </div>
            </div>
            </div>
            <!-- Location, Lat, Long input field and Link for people who needs help-->
            <div class="row">
              <div class="col-12 col-lg-4 mb-3">
                <label for="locDes" class="form-label">Location:</label>
                <textarea v-model="newMachine.locDes" id="locDes" class="form-control" required></textarea>
              </div>
              <div class="col-12 col-lg-4 col-md-6 mb-3">
                <label for="latitude" class="form-label">Latitude:</label>
                <input v-model="newMachine.coordinates.latitude" id="latitude" type="number" step="any" class="form-control" required>
              </div>
              <div class="col-12 col-lg-4 col-md-6 mb-3">
                <label for="longitude" class="form-label">Longitude:</label>
                <input v-model="newMachine.coordinates.longitude" id="longitude" type="number" step="any" class="form-control" required>
              </div>
              <div class="mb-3">
              <a href="https://support.google.com/maps/answer/18539?hl=en&co=GENIE.Platform%3chaDDesktop&oco=1" target="_blank" rel="noopener noreferrer" class="btn btn-link">
                Don't know your coordinates? Click here!
              </a>
            </div>
            </div>
            
          <div class="row">
            <!-- Add Items to this vending machine-->
            <div class="col-12 col-md-6 col-lg-4 mb-3">
              <label for="addItem" class="form-label">Add Item:</label>
              <div class="input-group">
                <input v-model="newContent" @keyup.enter="addContent" placeholder="Enter item name" class="form-control">
                <button type="button" @click="addContent" class="btn btn-outline-secondary">Add Item</button>
              </div>
            </div>
          </div>
          <!-- Display items currently in this vending machine + remove button-->
          <div class="mb-3">
            <label class="form-label">Contents in this Machine:</label>
              <ol class="list-group list-group-numbered">
                <li v-for="(item, index) in newMachine.contents" :key="index" class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="ms-2 me-auto">{{ item }}</div>
                  <button type="button" @click="removeContent(index)" class="btn btn-sm btn-danger">Remove</button>
                </li>
              </ol>
          </div>
          <!-- Submit form and cancel button  -->
          <div class="d-flex justify-content-start gap-2">
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update' : 'Add' }} Vending Machine</button>
            <button type="button" @click="cancelAddOrEdit" class="btn btn-danger">Cancel</button>
          </div>
          </form>
        </div>
      </div>
      <!-- Search input -->
      <div class="mb-3">
        <input 
          type="text" 
          v-model="searchQuery" 
          class="form-control" 
          placeholder="Search vending machines...">
      </div>
        
      <!-- Vending Machines in Bootstrap Card -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3  row-cols-xl-4 g-4 justify-content-start">
        <div v-for="machine in filteredMachines" :key="machine.id" class="col">
          <!-- Details of each vending machine in bootstrap Card-->
          <div class="card h-100">
            <img :src="machine.imageUrl" class="card-img-top" alt="No Machine Image Uploaded" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ machine.machineName }}</h5>
              <p class="card-text">{{ machine.description }}</p>
              <p class="card-text"><strong>Location:</strong> {{ machine.locDes }}</p>
              <p class="card-text"><strong>Status:</strong> {{ machine.status }}</p>
              <p class="card-text"><strong>Type:</strong> {{ machine.type }}</p>
              <p class="card-text"><strong>Payment:</strong> {{ machine.paymentType.join(', ') }}</p>
              <p class="card-text"><strong>Items:</strong> {{ machine.contents.join(', ') }}</p>
            </div>
            <div class="card-footer">
              <!-- Edit, See Image, Delete buttons for vending machines-->
              <button @click="editMachine(machine)" class="btn btn-sm btn-secondary me-1">Edit</button>
              <button @click="showImage(machine)" v-if="machine.imageUrl" class="btn btn-sm btn-dark me-1">See Image</button>
              <button @click="deleteMachine(machine.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from '@/firebase';
import firestore from '@/firestore';


export default {
  name: 'Admin',
  data() {
    return {
      currentUser: null, 
      // New Vending Machine Object
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
      userMachines: [], // Array to store user's machines
      showAddForm: false, 
      isEditing: false,
      editingMachineId: null,
      selectedFile: null,
      newContent: '',
      alert: {
        show: false,
        message: '',
        type: 'success'
      },
      searchQuery: '',
      }
    },
    computed: {
    filteredMachines() {
      if (!this.searchQuery) {
        return this.userMachines;
      }
      const query = this.searchQuery.toLowerCase();
      return this.userMachines.filter(machine => 
        machine.machineName.toLowerCase().includes(query) ||
        machine.description.toLowerCase().includes(query) ||
        machine.locDes.toLowerCase().includes(query) ||
        machine.type.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    // Checks if user is logged in and fetches user's machines if they are
    // Firebase authentication metho
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.fetchUserMachines();
      } else {
    // Return them back to login page
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

    // Removes item from vending machine
    removeContent(index) {
      this.newMachine.contents.splice(index, 1);
    },

    // Add or update user selected vending machine
    async addOrUpdateVendingMachine() {
      try {
        let imageUrl = null;
        let oldImageUrl = this.isEditing ? this.newMachine.imageUrl : null;

        if (this.selectedFile) {
          imageUrl = await firestore.uploadImage(this.selectedFile);
          if (oldImageUrl) {
            await firestore.deleteImage(oldImageUrl);
          }
        } else {
          imageUrl = oldImageUrl;
        }

        const machineData = {
          ...this.newMachine,
          imageUrl: imageUrl,
          contents: this.newMachine.contents,
        };

        if (this.isEditing) {
          await firestore.updateVendingMachine(this.editingMachineId, machineData);
          //alert('Vending machine updated successfully!');
          this.showAlert('Vending machine updated successfully!', 'success');
        } else {
          await firestore.addVendingMachine(machineData, this.currentUser.uid);
          //alert('Vending machine added successfully!');
          this.showAlert('Vending machine added successfully!', 'success');
        }

        this.clearForm();
        this.fetchUserMachines();
        this.showAddForm = false;
      } catch (e) {
        //console.error("Error adding/updating document: ", e);
        //alert('Error adding/updating vending machine. Please try again.');
        this.showAlert('Error adding/updating vending machine. Please try again.', 'danger');
        
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
      if (this.currentUser) {
        this.userMachines = await firestore.fetchUserMachines(this.currentUser.uid);
        console.log(this.userMachines);
      }
    },

    // Delete vending machine from firestore  
    async deleteMachine(machineId) {
      if (confirm("Are you sure you want to delete this vending machine?")) {
        try {
          // Fetch the machine data to get the image URL
          const machine = this.userMachines.find(m => m.id === machineId);
          if (machine && machine.imageUrl) {
            // Delete the image from storage
            await firestore.deleteImage(machine.imageUrl);
          }
          
          // Delete the machine document from Firestore
          await firestore.deleteVendingMachine(machineId);
          //alert("Vending machine deleted successfully!");
          this.showAlert("Vending machine deleted successfully!", 'success');
          this.fetchUserMachines();
        } catch (error) {
          //console.error("Error deleting vending machine: ", error);
          this.showAlert("Error deleting vending machine. Please try again.", 'danger');
          //alert("Error deleting vending machine. Please try again.");
        }
      }
    },

    // Show image of vending machine
    showImage(machine) {
      if (machine.imageUrl) {
        window.open(machine.imageUrl, '_blank');
      } 
    },

    //Edit vending machine
    editMachine(machine) {
      this.newMachine = { 
        ...machine,
        contents: [...(machine.contents || [])], //If machine has no contents, set contents to empty array
      };
      this.isEditing = true;
      this.editingMachineId = machine.id;
      this.showAddForm = true;

      window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    },
    //Cancel adding or editing vending machine
    cancelAddOrEdit() {
      this.clearForm();
      this.showAddForm = false;
      this.showAlert('Operation cancelled', 'info');
    },

    //Shows alert message at top of page 
    showAlert(message, type = 'success') {
    this.alert.show = true;
    this.alert.message = message;
    this.alert.type = type;

    // Automatically hide the alert after 5 seconds
    setTimeout(() => {
      this.closeAlert();
      }, 5000);
    },

    closeAlert() {
      this.alert.show = false;
      this.alert.message = '';
      }
    }
  };

</script>

<style scoped>

@import 'bootstrap/dist/css/bootstrap.css';

#admin-page {
  color: white;
  margin: 0;
  padding: 0;
  padding-top: 3em;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #001f3f; /* Dark blue background specific to this page */
}
.btn {
  transition: transform 0.3s ease-in-out;
}

.btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>