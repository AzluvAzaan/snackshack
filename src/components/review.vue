<template>
    <div class="review-container">
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
  
        <!-- Star Rating -->
        <div class="form-group">
          <label for="rating">Rating:</label>
          <div class="stars">
            <span
              v-for="star in 5"
              :key="star"
              @click="setRating(star)"
              :class="{ filled: star <= rating }"
            >&#9733;</span>
          </div>
        </div>
  
        <!-- Submit Button -->
        <button @click="submitReview">Submit Review</button>
      </div>
  
      <!-- Display Submitted Review -->
      <div v-if="submitted" class="review-result">
        <h3>Review Submitted:</h3>
        <p><strong>Username:</strong> {{ username }}</p>
        <p><strong>Review:</strong> {{ reviewText }}</p>
        <p><strong>Rating:</strong> {{ rating }} Stars</p>
      </div>
    </div>
</template>
  
<script>
  export default {
    data() {
      return {
        showForm: false,    // Controls the visibility of the review form
        username: '',       // Stores the username
        reviewText: '',     // Stores the review content
        rating: 0,          // Stores the star rating
        submitted: false,   // Tracks whether the review has been submitted
      };
    },
    methods: {
      // Sets the star rating
      setRating(star) {
        this.rating = star;
      },
      // Handles review submission
      submitReview() {
        if (this.username && this.reviewText && this.rating) {
          this.submitted = true;
          this.showForm = false; // Hide the form after submission
        } else {
          alert("Please fill out all fields and provide a rating.");
        }
      },
    },
  };
</script>
  
<style scoped>
  .review-container {
    max-width: 400px;
    margin: 20px auto;
  }
  
  .write-review-btn {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
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
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  textarea {
    height: 100px;
  }
  
  .stars {
    display: flex;
  }
  
  .stars span {
    cursor: pointer;
    font-size: 24px;
    color: #ccc;
  }
  
  .stars span.filled {
    color: gold;
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
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #007bff;
    border-radius: 5px;
    background-color: #e9f7ff;
  }
</style>
  