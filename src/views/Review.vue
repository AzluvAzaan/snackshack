<template>

  <div class="review-container">
    <!-- Display machine details -->
  <div v-if="machine" class="machine-details">
    <img :src="machine.imageUrl" alt="Machine Image" class="machine-image">
    <p>{{ machine.description }}</p>
    <p>Location: {{ machine.locDes }}</p>
  </div>

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
      <span class="average-rating-number">{{ averageRating }}</span>
      <div class="stars-container">
        <div class="stars-filled" :style="{ width: `${(averageRating / 5) * 100}%` }">
          <span v-for="i in 5" :key="i">&#9733;</span>
        </div>
        <div class="stars-empty">
          <span v-for="i in 5" :key="i">&#9733;</span>
        </div>
      </div>
    </div>
    <span class="total-reviews">{{ totalReviews }} reviews</span>
  </div>

    <!-- Write a Review Button -->
    <button v-if="!showForm" @click="showForm = true" class="write-review-btn">
      Write a Review
    </button>

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
          >&#9733;</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button @click="submitReview">Submit Review</button>
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
  }
},

async created() {
  // Fetch the machine details
  const machines = await firestore.getAllVendingMachines();
  this.machine = machines.find(m => m.id === this.machineID);

  // Fetch the reviews for this machine
  this.reviews = await firestore.getReviewsForMachine(this.machineID);
  console.log('Fetched reviews:', this.reviews);
},
};
</script>

<style scoped>
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
display: block;
margin:auto;
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
/* font-size: 5px; */
/* color: pink; */
margin-left: 10px;
/* margin-bottom: 50px; */
}

/* Styles for the collective bar graph */
.collective-bar-graph {
display: block;
/* margin-top: 100px; */
/* max-width: 500px; */
/* margin: auto; */
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
font-size: 48px;
font-weight: bold;
color: #007bff;
margin-right: 15px;
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
</style>
