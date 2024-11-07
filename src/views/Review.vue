<template>
   <div class="container-fluid" style="background-color: #001f3f">
    <div class="row">
      <!-- Sidebar -->
      <nav id="sidebarMenu" class="col-md-3 col-lg-3 d-md-block bg-light sidebar" 
      :class="{ 'show': sidebarOpen || !isMobile, 'd-none': !sidebarOpen && isMobile }">
        <div class="position-sticky pt-3">
          <div class="d-flex justify-content-between align-items-center px-3 mb-3">
            <h3 class="sidebar-heading text-muted border-bottom">Vending Machines</h3>
            <button class="btn-close d-md-none" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-label="Close sidebar">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <ul class="nav flex-column">
            <li class="nav-item" v-for="machine in machines" :key="machine.id">
              <router-link 
                :to="{ name: 'Review', query: { machine: machine.id } }" 
                class="nav-link" 
                :class="{ 'active': machine.id === selectedMachineId }"
                @click="selectMachine(machine.id)"
              >
                <div class="machine-item">
                  <img :src="machine.imageUrl" alt="Machine Image" class="machine-image">
                  <div class="machine-info">
                    <span class="machine-machineName">{{ machine.machineName }}</span>
                    <div class="machine-rating">
                      <span class="stars-review">
                        <span v-for="n in 5" :key="n" :class="{ 'filled': n <= Math.round(machine.avgRating) }">★</span>
                      </span>
                      <span class="rating-value">{{ machine.avgRating ? machine.avgRating.toFixed(1) : 'N/A' }}</span>
                      <span class="review-count">({{ machine.numReviews || 0 }})</span>
                    </div>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main content -->
      <main class="col-md-9 ms-sm-auto col-lg-9 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="review-title">Reviews</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <button
              class="navbar-toggler d-md-none"
              type="button"
              @click="toggleSidebar"
              aria-label="Toggle sidebar"
            >
              <span class="navbar-toggler-icon">
                <img src="../assets/3-lines-icon.png" style="height:2rem; display:block; align-items:center" alt="menu icon">
              </span>
            </button>
          </div>
        </div>

  <!-- Updated Machine Card -->
  <div v-if="machine" class="machine-card mb-4">
    <div class="card">
      <div class="card-content">
        <div class="image-container">
          <img :src="machine.imageUrl" class="card-img" alt="Vending Machine">
        </div>
        <div class="info-container">
          <h2 class="machine-name">{{ machine.machineName }}</h2>
          <p class="machine-description">{{ machine.description }}</p>
          <p class="machine-location">
            <i class="fas fa-map-marker-alt"></i> {{ machine.locDes }}
          </p>
          <div class="machine-rating">
            <div class="stars-container">
              <div class="stars-empty">
                <span v-for="n in 5" :key="`empty-${n}`">☆</span>
              </div>
              <div class="stars-filled" :style="{ width: `${(machine.avgRating / 5) * 100}%` }">
                <span v-for="n in 5" :key="`filled-${n}`">★</span>
              </div>
            </div>
            <span class="rating-value">{{ machine.avgRating ? machine.avgRating.toFixed(1) : 'N/A' }}</span>
            <span class="review-count">({{ machine.numReviews || 0 }} reviews)</span>
          </div>
          <div class="owner-info">
            <h3 class="owner-title">Owner Information:</h3>
            <p class="owner-contact">
              <img class="letter-icon" src="../assets/letter-icon.png" alt="letter icon">
              <i class="fas fa-phone"></i> {{ ownerEmail }}
            </p>
            <p class="owner-email">
              <img class="phone-icon" src="../assets/phone-icon.png" alt="phone icon">
              <i class="fas fa-envelope"></i> {{ ownerContact }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

        <div class="review-container">

          <div class="collective-bar-graph">
            <h2 style="text-align: center;">Review Ratings</h2>
            <div v-for="star in 5" :key="star" class="collective-bar-container">
              <span class="collective-bar-label">{{ star }} ★</span>
              <div class="collective-bar" :style="{ width: calculateCollectiveBarWidth(star) }"></div>
              <span class="collective-bar-count">{{ countRatings(star) }}</span>
            </div>
          </div>

          <!-- Average Rating Display -->
          <div class="average-rating-container">
            <h2>Average Rating</h2>
            <div class="average-rating">
              <span :class="averageRatingClass" class="average-rating-number">
                {{ averageRating }}
              </span>
              <div class="stars-container">
                <div class="stars-filled" :style="{ width: `${(averageRating / 5) * 100}%` }">
                  <span v-for="i in 5" :key="i">★</span>
                </div>
                <div class="stars-empty">
                  <span v-for="i in 5" :key="i">★</span>
                </div>
              </div>
            </div>
            <span class="total-reviews">{{ totalReviews }} reviews</span>
          </div>

          <!-- Write a Review Button -->
          <div class="review-controls">
            <button v-if="!showForm" @click="showForm = true" class="write-review-btn">
              Write a Review
            </button>

            <!-- Sorting Dropdown -->
            <div class="sorting-dropdown">
              <label for="sortOptions">Sort By:</label>
              <select id="sortOptions" v-model="sortOption" @change="sortReviews">
                <option value="date_desc">Date (Newest to Oldest)</option>
                <option value="date_asc">Date (Oldest to Newest)</option>
                <option value="stars_desc">Stars (High to Low)</option>
                <option value="stars_asc">Stars (Low to High)</option>
              </select>
            </div>
          </div>

          <!-- Review Form, displayed when showForm is true -->
          <div v-if="showForm" class="review-form">
            <h2>Write a Review</h2>

            <!-- Username Input -->
            <div class="form-group">
              <label for="username">Username:</label>
              <input
                type="text"
                id="username"
                v-model="username"
                placeholder="Enter your username"
              />
            </div>

            <!-- Review Textarea -->
            <div class="form-group">
              <label for="review">Your Review:</label>
              <textarea
                id="review"
                v-model="reviewText"
                placeholder="Write your review here"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="rating">Rating:</label>
              <div class="stars">
                <span
                  v-for="star in 5"
                  :key="star"
                  @click="setRating(star)"
                  @mouseover="hoverRating(star)"
                  @mouseleave="clearHoverRating"
                  :class="{ filled: star <= hoverRatingValue || star <= rating }"
                >★</span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="submit-button-container">
              <button @click="submitReview" class="submit-review-btn">Submit Review</button>
            </div>
          </div>

          <!-- Display All Submitted Reviews -->
          <div v-for="(review, index) in reviews" :key="index" class="review-result">
            <div class="review-header">
              <div class="reviewer-info">
                <img class="reviewer-avatar" src="../assets/person-icon.png" alt="User Profile" />
                <div>
                  <h5>{{ review.username }}</h5>
                  <div class="stars-review">
                    <span
                      v-for="star in 5"
                      :key="star"
                      :class="{ filled: star <= review.rating }"
                    >★</span>
                    <span class="posted-time">{{ timeSince(review.timestamp) }} ago</span>
                  </div>
                </div>
              </div>
            </div>

            <p class="review-text">{{ review.text }}</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import firestore from '@/firestore';

export default {
data() {
  return {
    machine: null,
    showForm: false,   // Controls the visibility of the review form
    username: '',      // Stores the username
    reviewText: '',    // Stores the review content
    rating: 0,         // Stores the star rating (in half-stars)
    hoverRatingValue: 0, // Stores the value of hovered star
    reviews: [],       // Array to store multiple reviews
    machines: [],
    selectedMachineId: null,
    sidebarOpen: true,
    isMobile: false,
    ownerEmail: '',
    ownerContact: '',
  };
},
methods: {
  // Sets the star rating, allowing half-star increments
  setRating(star) {
    this.rating = star;
  },
  // Handles hover effect for selecting stars
  hoverRating(star) {
    this.hoverRatingValue = star;
  },
  // Clears hover effect when the user is no longer hovering over the stars
  clearHoverRating() {
    this.hoverRatingValue = 0;
  },
  // Handles review submission
  async submitReview() {
    if (this.username && this.reviewText && this.rating) {
      const newReview = {
        username: this.username,
        text: this.reviewText,
        rating: this.rating,
        timestamp: new Date(), 
        machineID: this.machineID, // Save the current time for the review
      };

      
      console.log('New review rating:', newReview.rating);
      await firestore.addReview(newReview);

      // this.reviews.push(newReview); // Add the new review to the list
      this.reviews = await firestore.getReviewsForMachine(this.machineID);
      await this.updateMachineRating(); // Update the machine's rating
      this.showForm = false; // Hide the form after submission
      this.resetForm(); // Reset form fields
      // Set sorting to "Newest to Oldest" after submission
      this.sortOption = "date_desc";
      this.sortReviews();
    } else {
      alert("Please fill out all fields and provide a rating.");
    }
  },

  async updateMachineRating() {
      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      const newAverageRating = this.reviews.length > 0 ? totalRating / this.reviews.length : 0;
      
      // Update the machine's rating in Firestore
      await firestore.updateMachineRating(this.machineID, newAverageRating);
      
      // Update the local machine object
      if (this.machine) {
        this.machine.rating = newAverageRating;
      }
    },

    sortReviews() {
      if (this.sortOption === 'date_desc') {
        this.reviews.sort((a, b) => b.timestamp - a.timestamp);
      } else if (this.sortOption === 'date_asc') {
        this.reviews.sort((a, b) => a.timestamp - b.timestamp);
      } else if (this.sortOption === 'stars_desc') {
        this.reviews.sort((a, b) => b.rating - a.rating);
      } else if (this.sortOption === 'stars_asc') {
        this.reviews.sort((a, b) => a.rating - b.rating);
      }
    },


  // Resets form fields after submission
  resetForm() {
    this.username = '';
    this.reviewText = '';
    this.rating = 0;
  },
  // Computes the time since a review was posted
  timeSince(date) {
const now = new Date();
const seconds = Math.floor((now - date.toDate()) / 1000); // Convert Firestore Timestamp to Date

const intervals = {
  year: 31536000,
  month: 2592000,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1
};

for (const [unit, secondsInUnit] of Object.entries(intervals)) {
  const interval = Math.floor(seconds / secondsInUnit);
  if (interval >= 1) {
    return `${interval} ${unit}${interval > 1 ? 's' : ''}`;
  }
}
return 'just now';
},
  countRatings(star) {
    return this.reviews.filter(review => review.rating === star).length;
  },
  calculateCollectiveBarWidth(star) {
    const maxCount = Math.max(...[1, 2, 3, 4, 5].map(this.countRatings));
    const count = this.countRatings(star);
    const maxWidth = 100; // Maximum width in percentage
    if(count===0){
      return '1%';
    }
    return maxCount ? `${(count / maxCount) * maxWidth}%` : '1%';
  },

  async selectMachine(machineId) {
  this.selectedMachineId = machineId;
  this.reviews = await firestore.getReviewsForMachine(machineId);
  this.machine = this.machines.find(m => m.id === machineId);
  await this.fetchOwnerDetails();

  // Update the URL when a machine is selected
  this.$router.push({ name: 'Review', query: { machine: machineId } });
  
  // Close the sidebar on mobile after selection
  if (window.innerWidth < 768) {
    setTimeout(() => {
      this.sidebarOpen = false;
    }, 200); // 200ms delay
    this.handleResize(); // Ensure sidebar visibility updates after selection
  }
},

    async fetchVendingMachines() {
      try {
        this.machines = await firestore.getAllVendingMachines();
        // Ensure avgRating and numReviews are set for each machine
        this.machines = this.machines.map(machine => ({
          ...machine,
          avgRating: machine.avgRating || 0,
          numReviews: machine.numReviews || 0
        }));
      } catch (error) {
        console.error("Error fetching vending machines:", error);
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    handleResize() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.sidebarOpen = true;
      }
    },

    async fetchOwnerDetails() {
      if (this.selectedMachineId) {
        try {
          // First, get the user ID of the machine owner
          const machineDoc = await firestore.getVendingMachineById(this.selectedMachineId);
          if (machineDoc && machineDoc.userId) {
            // Then, fetch the user details using the user ID
            const userDetails = await firestore.getUserDetails(machineDoc.userId);
            if (userDetails) {
              this.ownerEmail = userDetails.email || 'N/A';
              this.ownerContact = userDetails.contact || 'N/A';
            }
          }
        } catch (error) {
          console.error("Error fetching owner details:", error);
        }
      }
    },
},

watch: {
    // Watch the reviews array for changes and apply sorting when new reviews are added
    reviews() {
      this.sortReviews();
    },
    sidebarOpen(val) {
    // Apply handleResize to adjust sidebar visibility when sidebarOpen changes
    this.handleResize();
  }
  },

computed: {
  machineID() {
    return this.$route.query.machine;
  },

  averageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  },
  totalReviews() {
    return this.reviews.length;
  },

  // Computed property to return the rating class based on averageRating value
  averageRatingClass() {
    if (this.averageRating >= 4) {
      return 'average-rating-good';
    } else if (this.averageRating >= 2.5) {
      return 'average-rating-average';
    } else {
      return 'average-rating-poor';
    }
  }
},

async created() {
  // Fetch the machine details
  await this.fetchVendingMachines();
  this.reviews = await firestore.getReviewsForMachine(this.selectedMachineId);
  this.sortReviews();
  window.addEventListener('resize', this.handleResize); // Add resize listener
  this.handleResize(); // Initial check for screen width

  // Set the initial selected machine based on the URL
  const machineIdFromUrl = this.$route.query.machine;
  if (machineIdFromUrl) {
    this.selectMachine(machineIdFromUrl);
  } else if (this.machines.length > 0) {
    this.selectMachine(this.machines[0].id);
  }

  // Fetch the reviews for this machine
  if (this.selectedMachineId) {
    this.reviews = await firestore.getReviewsForMachine(this.selectedMachineId);
    console.log('Fetched reviews:', this.reviews);

    // Fetch owner details for the initially selected machine
    await this.fetchOwnerDetails();
  }
},

beforeDestroy() {
  // Remove the resize listener when the component is destroyed
  window.removeEventListener('resize', this.handleResize);
},
};
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

*{
box-sizing: border-box;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
             Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
margin:0;
padding: 0;
}
.review-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px 15px; /* Equal padding on all sides */
  background-color: #e9f7ff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.review-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.write-review-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

.write-review-btn,
.sorting-dropdown select {
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.write-review-btn:hover,
.sorting-dropdown select:hover {
  transform: scale(1.05);
  /* background-color: #0056b3; */
}

.sorting-dropdown {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Allow the dropdown to wrap */
  gap: 5px; /* Adds space between the label and the select */
  max-width: 100%; /* Prevents it from exceeding screen width */
}

.sorting-dropdown label {
  margin-right: 5px;
  font-weight: bold;
}

.sorting-dropdown select {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%; /* Ensure dropdown takes full available width on small screens */
  box-sizing: border-box;
}

@media (max-width: 767.98px) {
  .sorting-dropdown label {
    font-size: 0.9rem; /* Smaller font for better fit */
    flex: 1 0 100%; /* Label takes full width */
  }
  
  .sorting-dropdown select {
    font-size: 0.9rem;
  }
}

.write-review-btn:hover {
background-color: #0056b3;
}

.review-form {
margin-top: 20px;
padding: 10px;
border: 1px solid #ccc;
border-radius: 5px;
background-color: #f9f9f9;
}

.form-group {
margin-bottom: 15px;
}

label {
display: block;
font-weight: bold;
margin-bottom: 5px;
}

input, textarea {
width: 100%;
padding: 5px;
border: 1px solid #ccc;
border-radius: 4px;
max-width: 550px;
}

textarea {
height: 100px;
}

.stars {
display: flex;
align-items: center;
}

.stars span {
cursor: pointer;
font-size: 24px;
color: #ccc;
}

.stars span:hover {
color: gold;
}

.stars span.filled {
color: gold;
}

.stars-review {
display: flex;
align-items: center;
}

.stars-review span {
font-size: 18px;
color: #ccc;
}

.stars-review span.filled {
color: gold;
}

/* Gradient effect for filled stars */
.stars-review .star.filled {
background: linear-gradient(to bottom right, #ffd700, #ffa500);
}

button {
padding: 10px 15px;
background-color: #007bff;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
background-color: #0056b3;
}

.review-result {
  margin: 20px 0px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px; 
}

.reviewer-info {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.reviewer-avatar {
width: 80px;
height: 80px;
border-radius: 50%;
margin-right: 10px;
}

.review-text {
  margin-top: 10px;
  font-size: 1rem;
  margin-left:20px;
}


.posted-time {
margin-left: 10px;
}

/* Styles for the collective bar graph */
.collective-bar-graph {
display: block;
}

.collective-bar-container {
  display: flex;
  align-items: center;
  padding: 5px 10px; /* Adjusted padding for alignment */
  width: 100%;
  margin: 8px 0;
}

.collective-bar-label {
width: 80px;
font-weight: bold;
}

.collective-bar {
height: 20px;
background-color: gold;
margin-right: 10px;
border-radius: 5px;
transition: width 0.3s ease;
max-width: 450px;
}

.collective-bar:hover{
cursor: pointer;
background-color: #ffa500;
}

.collective-bar-count {
font-weight: bold;
}

.average-rating-container {
text-align: center;
margin-bottom: 20px;
padding: 20px;
background-color: #f0f8ff;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.average-rating {
display: flex;
align-items: center;
justify-content: center;
margin-top: 10px;
}

.average-rating-number {
font-size: 3rem; /* Larger font */
font-weight: bold;
margin-right: 15px;
transition: color 0.3s ease;
}

.average-rating-good {
  color: #4caf50; /* Green for good ratings */
}

.average-rating-average {
  color: #FF7546; /* Orange/Yellow for average ratings */
}

.average-rating-poor {
  color: #F3727F; /* Red for poor ratings */
}

.stars-container {
position: relative;
display: inline-block;
}

.stars-empty, .stars-filled {
display: flex;
}

.stars-empty {
color: #ddd;
}

.stars-filled {
position: absolute;
top: 0;
left: 0;
white-space: nowrap;
overflow: hidden;
color: #ffd700;
}

.stars-empty span, .stars-filled span {
font-size: 24px;
margin-right: 2px;
}

.total-reviews {
display: block;
margin-top: 5px;
color: #666;
}

/* Updated sidebar styles */
.review-title{
  margin:auto;
  color:white;
  font-weight: bold;
}
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 48px 0 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
  border-right: 1px solid #ddd;
}

.sidebar.collapse:not(.show) {
  transform: translateX(-100%);
}

.nav-item {
  margin-bottom: 10px;
}

.nav-link {
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  background-color: #e9ecef;
}

.nav-link.active {
  background-color: #e6f6ff;
  box-shadow: 0 0px 4px #33b4ff;
  color: black;
}

.machine-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.machine-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.machine-info {
  flex-grow: 1;
}

.machine-machineName {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.machine-rating {
  display: flex;
  align-items: center;
  font-size: 0.8em;
}

.stars {
  color: #ccc;
  margin-right: 5px;
}

.stars .filled {
  color: gold;
}

.rating-value {
  font-weight: bold;
  margin-right: 5px;
}

.review-count {
  color: #666;
}

/* Updated close button styles */
.btn-close {
  font-size: 1.5rem;
  padding: 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
  background-color: transparent;
  border: 0;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.btn-close:hover {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #f8f9fa;
    transition: transform 0.3s ease-in-out;
  }

  .sidebar.collapse:not(.show) {
    transform: translateX(-100%);
  }

  .sidebar .btn-close {
    display: block;
  }

  .navbar-toggler {
    display: block;
    background-color: #e9f7ff;
  }
  .navbar-toggler:hover{
    background-color: #e9f3ff;
  }
}

@media (min-width: 768px) {
  .sidebar .btn-close {
    display: none;
  }

  .navbar-toggler {
    display: none;
  }
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .sidebar {
    position: static;
    height: auto;
    padding-top: 0;
  }

  main {
    margin-top: 20px;
  }

  .navbar-toggler {
    display: block;
  }
}

@media (min-width: 768px) {
  .navbar-toggler {
    display: none;
  }
}

/* Add these new styles for the close button */
.btn-close {
  padding: 0.25rem 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
}

@media (max-width: 767.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #f8f9fa;
    transition: 0.3s;
  }

  .sidebar.collapse:not(.show) {
    display: none;
  }

  .sidebar.collapsing {
    height: auto;
    transition: height 0.35s ease;
  }

  .sidebar .btn-close {
    display: block;
  }
}

@media (min-width: 768px) {
  .sidebar .btn-close {
    display: none;
  }
}

/* Updated Machine Card Styles */
.machine-card {
  margin-bottom: 2rem;
}

.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #e9f7ff;
  max-height: 500px;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  max-height: 500px;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-container {
  padding: 1rem;
}

.machine-name {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.machine-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.machine-location {
  font-size: 0.9rem;
  color: #007bff;
  margin-bottom: 0.5rem;
}

.machine-rating {
  display: flex;
  align-items: center;
}

.rating-value {
  font-weight: bold;
  margin-right: 0.5rem;
}

.review-count {
  font-size: 0.8rem;
  color: #666;
}

.owner-info {
  margin-top: 1rem;
  padding-bottom: 5rem;
}

.owner-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.owner-contact,
.owner-email {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #111;
  margin-bottom: 0.3rem;
}

.letter-icon,
 .phone-icon {
  height: 2rem;
}

.phone-icon{
  margin-left: 0.5rem;
  padding-right: 0.5rem;
}

.owner-info i {
  margin-right: 0.5rem;
  color: #007bff;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .card-content {
    flex-direction: row;
  }

  .image-container {
    width: 40%;
    height: auto;
  }

  .info-container {
    width: 60%;
    padding: 1.5rem;
  }

  .submit-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.submit-review-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.submit-review-btn:hover {
  background-color: #0056b3;
}
}
</style>
