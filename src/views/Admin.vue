<template>
<div id="admin-page">
    <div class="admin-container container py-4 min-vh-100">
      <!-- Alert for add/edit/delete/cancel vending machine functions messages -->
      <div v-if="alert.show" :class="`alert alert-${alert.type} alert-dismissible`" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="closeAlert" aria-label="Close"></button>
      </div>
      <!-- Admin Page Header --> 
      <div class="row mb-4">
        <div class="col-12 col-md-8">
          <h1 class="mb-0">Admin Page</h1>
        </div>
        <div class="col-12 col-md-4 d-flex justify-content-md-end ">
          <!-- Logout button to log out user-->
          <button @click="logout" class="btn btn-danger"><font-awesome-icon icon="fa-solid fa-right-from-bracket" /> Logout</button>
        </div>
      </div>
      <div class="row">
       <!-- <p v-if="currentUser" class="mb-0 me-3">Logged in as: {{ currentUser.email }}</p> -->
       <div v-if="currentUser && userDetails" class="user-info">
            <p><strong>Logged in as: </strong> {{ currentUser.email }}</p>
            <p>
              <strong>Contact Number: </strong> 
              <span v-if="!editingContact">{{ userDetails.contact }}</span>
              <input v-else v-model="newContactNumber" type="tel" class="form-control d-inline-block w-auto mx-2">
              <button v-if="!editingContact" @click="startEditContact" class="btn btn-sm btn-primary ms-2"> 
                <font-awesome-icon icon="fa-solid fa-pen-to-square" />  Edit</button>
              <button v-else @click="updateContact" class="btn btn-sm btn-success mx-2">Save</button>
              <button v-if="editingContact" @click="cancelEditContact" class="btn btn-sm btn-secondary">Cancel</button>
            </p>
      </div>
      <!-- Vending Machine + Add Machine Button-->
      <div class="row mb-3">
      <div class="col">
        <h2>Your Vending Machines</h2>
      </div>
      <div class="col-auto">
        <button @click="showAddForm = true" class="btn btn-primary">
          <font-awesome-icon icon="fa-solid fa-plus" /> Add Vending Machine
        </button>
      </div>
    </div>
    
      <!-- Add/Edit Vending Machine Form -->
      <div v-if="showAddForm" class="add-form card  mb-4">
        <div class="card-body">
          <h3 class="card-title mb-4">{{ isEditing ? 'Edit' : 'Add' }} Vending Machine</h3>
          <form @submit.prevent="addOrUpdateVendingMachine">
            <!-- Form Fields for Machine Details -->
            <div class="row">
              <div class="col-12 col-sm-4 mb-3">
                <label for="machineName" class="form-label">Machine Name:</label>
                <input v-model="newMachine.machineName" id="machineName" class="form-control " required>
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
              <a href="https://support.google.com/maps/answer/18539?hl=en&co=GENIE.Platform%3chaDDesktop&oco=1" target="_blank" rel="noopener noreferrer" class="btn btn-link coordinate-link ">
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
                <button type="button" @click="addContent" class="btn btn-info">Add Item</button>
              </div>
            </div>
          </div>
          <!-- Display items currently in this vending machine + remove button-->
          <div class="mb-3">
            <label class="form-label">Contents in this Machine:</label>
              <ol class="list-group list-group-numbered">
                <li v-for="(item, index) in newMachine.contents" :key="index" class="list-group-item d-flex justify-content-between align-items-start border border-secondary mb-2 p-2 item-outline">
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
      <!-- Search input and Sort select -->
      <div class="mb-3">
        <div class="row g-2">
          <div class="col-10 col-md-8">
            <div class="input-group">
              <span class="input-group-text">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
              </span>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control darker-placeholder" 
                placeholder="Search vending machines by Name, Location, Description, Type and Status of Machine">
            </div>
          </div>
      <!-- Sort By Rating -->
          <div class="col-10 col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <font-awesome-icon icon="fa-solid fa-sort" />
              </span>
              <select v-model="sortOption" class="form-select">
                <option value="">Sort by (Default)</option>
                <option value="Asc">Rating: Low to High</option>
                <option value="Desc">Rating: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <!-- Vending Machines in Bootstrap Card -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3  row-cols-xl-4 g-4 justify-content-start">
        <div v-for="machine in filteredAndSortedMachines" :key="machine.id" class="col">
          <!-- Details of each vending machine in bootstrap Card-->
          <div class="card h-100" :class="getRatingColorClass(machine.avgRating)">
            <img :src="machine.imageUrl" class="card-img-top" alt="No Machine Image Uploaded" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ machine.machineName }}</h5>
              <p class="card-text">{{ machine.description }}</p>
              <p class="card-text"><strong>Location:</strong> {{ machine.locDes }}</p>
              <p class="card-text"><strong>Status:</strong> {{ machine.status }}</p>
              <p class="card-text"><strong>Type:</strong> {{ machine.type }}</p>
              <p class="card-text"><strong>Payment:</strong> {{ machine.paymentType.join(', ') }}</p>
              <p class="card-text"><strong>Items:</strong> {{ machine.contents.join(', ') }}</p>
              <p class="card-text"><strong>Average Rating:</strong> {{ machine.avgRating }} <font-awesome-icon icon="fa-solid fa-star" /> ({{machine.numReviews}})</p>
            </div>
            <div class="card-footer d-flex flex-wrap justify-content-start">
              <!-- Edit, See Image, Delete, Recent Reviews, All Reviews buttons, View on Map for vending machines-->
               <div class="mb-2">
              <button @click="editMachine(machine)" class="btn btn-sm btn-secondary me-1">Edit</button>
              <button @click="showImage(machine)" v-if="machine.imageUrl" class="btn btn-sm btn-dark me-1">See Image</button>
              <button @click="deleteMachine(machine.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
              <div>
                <button @click="showReviews(machine)" class="btn btn-warning btn-sm me-1">Recent Reviews</button>
                <router-link :to="{ path: '/review', query: { machine: machine.id } }"  target="_blank">
                  <button class="btn btn-info btn-sm me-1"> All Reviews</button>
                </router-link>
                </div>
                <div class="mt-2">
                  <button @click="getDirections(machine)" class="btn btn-success btn-sm">
                  View on Map
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        <!-- Single Modal for Reviews -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2 class="modal-header">Recent 3 Reviews</h2>
          <div v-if="selectedMachine && selectedMachine.recentReviews && selectedMachine.recentReviews.length > 0">
            <div v-for="review in selectedMachine.recentReviews" :key="review.id" class="review-item">
              <p>By user, <strong> {{ review.username }}</strong> on {{ formatDate(review.timestamp) }}</p>
              <p>Rating: {{ review.rating }} / 5</p>
              <p>Comments: {{ review.text }}</p>
            </div>
          </div>
          <div v-else>
            <p>No reviews available for this machine.</p>
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
      userDetails: null,
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
      showAddForm: false, // Boolean to display form for add/edit machine
      isEditing: false,
      editingMachineId: null,
      selectedFile: null,
      newContent: '', 
      //Alert 
      alert: {
        show: false,
        message: '',
        type: 'success'
      },
      searchQuery: '', // Search query
      editingContact: false, // Check if editing contact
      newContactNumber: '', 
      sortOption: '', // Sorting option
      showModal: false,
      selectedMachine: null, // Check if showing machine details
      }
    },
    computed: {

      // Search Bar Function
      filteredAndSortedMachines() {
      let result = this.userMachines;
      
      // Apply search to find machine by name, location, description, type, and status
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(machine => 
          machine.machineName.toLowerCase().includes(query) ||
          machine.description.toLowerCase().includes(query) ||
          machine.locDes.toLowerCase().includes(query) ||
          machine.type.toLowerCase().includes(query) ||
          machine.status.toLowerCase().includes(query)
        );
      }
      
      // Apply sorting by Ascending or Descending based on rating
      if (this.sortOption) {
        result.sort((a, b) => {
          if (this.sortOption === 'Asc') {
            return (a.avgRating || 0) - (b.avgRating || 0);
          } else if (this.sortOption === 'Desc') {
            return (b.avgRating || 0) - (a.avgRating || 0);
          }
        });
      }
      
      return result;
    },

    // Assign glowing class to vending machine card based on rating
    getRatingColorClass() {
    return (rating) => {
      if (!rating) return ''; // No glow for 0 or undefined rating
      if (rating < 1.5) return 'glow-red';
      if (rating < 2.5) return 'glow-orange';
      if (rating < 3.5) return 'glow-yellow';
      if (rating < 4.5) return 'glow-light-green';
      return 'glow-green';
      };
    },
  },

  mounted() {
    // Checks if user is logged in and fetches user's machines if they are
    // Firebase authentication method
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.fetchUserMachines();
        this.fetchUserData(user.uid);
      } else {
    // Return them back to login page
        this.currentUser = null;
        this.userDetails = null;
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

    async fetchUserData(userId) {
      try {
        const userData = await firestore.getUserData(userId);
        if (userData) {
          this.userDetails = userData;
          //console.log("User data fetched:", this.userDetails);
        } else {
          //console.log("No user data found");
          this.userDetails = null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },

    // For users to edit contact number
    startEditContact() {
      this.editingContact = true;
      this.newContactNumber = this.userDetails.contact;
    },
  
    // Update contact number in Firestore
    async updateContact() {
      try {
        await firestore.updateUserData(this.currentUser.uid, {
          contact: this.newContactNumber
        });
        this.userDetails.contact = this.newContactNumber;
        this.editingContact = false;
        this.showAlert('Contact number updated successfully', 'success');
      } catch (error) {
        // console.error('Error updating contact number:', error);
        this.showAlert('Failed to update contact number', 'danger');
      }
    },

    // Cancels editing contact number
    cancelEditContact() {
      this.editingContact = false;
      this.newContactNumber = '';
      this.showAlert('Cancelled update contact number', 'info');
    },

    //stores uploaded file as selectedFile
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },

    // Uploads image to Firebase Storage and returns the download URL
    async uploadImage() {
      //return null if no file is selected
      if (!this.selectedFile) return null;
      //stores image in firebase storage, rename it to current timestamp+file name to prevent duplicate names
      const storageRef = ref(storage, `machine-images/${Date.now()}_${this.selectedFile.name}`);
      await uploadBytes(storageRef, this.selectedFile);
      //return url of image
      return await getDownloadURL(storageRef);
    },

    // Add item to vending machine
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

        // Upload image if one is selected, if not keep the same image url
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

        if (!this.isEditing) {
          // Only set these values when adding a new machine
          machineData.avgRating = 0;
          machineData.numReviews = 0;
        }

        // Editing an existing machine
        if (this.isEditing) {
          await firestore.updateVendingMachine(this.editingMachineId, machineData);
          //alert('Vending machine updated successfully!');
          this.showAlert('Vending machine updated successfully!', 'success');
        } else {
        // Add a new machine
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
        imageUrl: null,
        avgRating: 0,  
        numReviews: 0  
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
          // Delete all reviews associated with the machine
          await firestore.deleteAllReviewsForMachine(machineId);
          //alert("Vending machine deleted successfully!");
          this.showAlert("Vending machine deleted successfully!", 'success');
          this.fetchUserMachines();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          }); 
        } catch (error) {
          //console.error("Error deleting vending machine: ", error);
          this.showAlert("Error deleting vending machine. Please try again.", 'danger');
        }
      }
    },

    // Show image of vending machine in new tab
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
      this.showAlert('Adding/Editing vending machine cancelled', 'info');
      window.scrollTo({
            top: 0,
            behavior: 'smooth'
    });
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
      },

    // Fetch machine's recent reviews
    async fetchRecentReviews(machineId) {
        try {
          const reviews = await firestore.getRecentReviewsForMachine(machineId);
          // Find the machine and update its recentReviews
          //console.log(reviews);
          if (this.selectedMachine) {
          this.selectedMachine = { ...this.selectedMachine, recentReviews: reviews };
          }
          
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      },

    async showReviews(machine) {
      this.selectedMachine = machine;
      await this.fetchRecentReviews(machine.id);
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedMachine = null;
    },

    // Format timestamp from Firestore
    formatDate(timestamp) {
      if (!timestamp || !timestamp.toDate || typeof timestamp.toDate !== 'function') {
         return 'Unknown Date';
      }

      const date = timestamp.toDate();
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const getOrdinalSuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      };

      return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    },

    getDirections(machine) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${machine.coordinates.latitude},${machine.coordinates.longitude}`);
    },

  },
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
  background-color: #001f3f; 
}

/* Button hover and animation */
.btn {
  transition: transform 0.3s ease-in-out;
  border-radius: 15px;
}

.btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Had to do below because importing bootstrap.css caused issues with other pages */

body, #admin-page {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}


.card {
  transition: all 0.3s ease-in-out;
  border: none;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
  color: black;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  font-weight: bold;
  margin-bottom: 1rem;
}

.card-text {
  margin-bottom: 0.5rem;
}

.card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.btn {
  transition: all 0.3s ease-in-out;
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-dark {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}


.alert {
  border-radius: 15px;
  margin-bottom: 2rem;
}

.form-control {
  border-radius: 50px;
  padding: 0.75rem 1.25rem;
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control, .form-select {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

.form-check-input {
  width: 1em;
  height: 1em;
  margin-top: 0.25em;
  vertical-align: top;
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: 1px solid rgba(0, 0, 0, 0.25);
  appearance: none;
  transition: background-color 0.15s ease-in-out, background-position 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-check-input[type="checkbox"] {
  border-radius: 0.25em;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-input:checked[type="checkbox"] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e");
}

.form-check-label {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: inline-block;
  margin-bottom: 0.5rem;
}

/* Add some spacing between form elements */
.mb-3 {
  margin-bottom: 1rem !important;
}

.form-label {
  color: #212529;
  font-weight: bold;
}

.coordinate-link {
  color: #007bff; 
  text-decoration: none;
}

.coordinate-link:hover {
  text-decoration: underline;
  color: #0056b3; 
}

.item-outline {
  box-shadow: 0 0 0 2px #ced4da;
  
}

.alert {
  border-radius: 10px;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 5px solid #28a745;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 5px solid #dc3545;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 5px solid #17a2b8;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 5px solid #ffc107;
}

.alert-dismissible {
  padding-right: 4rem;
}

.alert-dismissible .close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.75rem 1.25rem;
  color: inherit;
}

/* Glow effect for different average Rating */
.glow-red {
  box-shadow: 0 0 20px 8px rgba(255, 0, 0, 0.5);
}
.glow-orange {
  box-shadow: 0 0 20px 8px rgba(255, 165, 0, 0.5);
}
.glow-yellow {
  box-shadow: 0 0 20px 8px rgba(255, 255, 0, 0.5);
}
.glow-light-green {
  box-shadow: 0 0 20px 8px rgba(144, 238, 144, 0.5);
}
.glow-green {
  box-shadow: 0 0 20px 8px rgba(0, 255, 0, 0.5);
}

/* Placeholder styling */
.darker-placeholder::placeholder {
  color: #555 !important;
  opacity: 1 !important;
} 

/* Review styling */
.review-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.review-item:last-child {
  border-bottom: none;
}

/* Modal Styling */

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  background-color: rgba(0, 0, 0, 0.5); 
}

.modal-header {
  text-align: center;
  display: block;
  padding-bottom: 1.5em;
}
.modal-content {
  background-color: #fff;
  padding: 2rem;
  border: none;
  width: 90%;
  max-width: 500px;
  border-radius: 15px;
  color: #212529;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}
 
.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #6c757d;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>


