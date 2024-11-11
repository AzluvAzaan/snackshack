<template>
  <div class="register-container container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
    <div class="card shadow-lg w-100">
      <div class="card-body p-4 p-sm-5">
        <h2 class="card-title text-center mb-4">Register</h2>
        <form @submit.prevent="register">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required>
          </div>
          <div class="mb-3">
            <label for="contactNumber" class="form-label">Contact Number</label>
            <input type="tel" class="form-control" id="contactNumber" v-model="contactNumber" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required>
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required>
          </div>
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg">Register</button>
          </div>
        </form>
        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
        <div class="text-center mt-4">
          <p class="mb-0">Already have an account?</p>
          <button @click="goToLogin" class="btn btn-link">Login</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/firebase';
import firestore from '@/firestore';

export default {
  name: 'Register',
  data() {
    return {
      email: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
      error: ""
    };
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = "Passwords do not match";
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        await firestore.storeUserData(user.uid, {
          email: this.email,
          contactNumber: this.contactNumber
        });
        //console.log("Registered as:", userCredential.user.email);
        this.$router.push("/login"); // Redirect to login page after successful registration
      } catch (err) {
        this.error = err.message;
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  },
};
</script>

<style scoped>

@import 'bootstrap/dist/css/bootstrap.css';

body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.register-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #003061, #001f3f, black);
}

.card {
  border-color: #f0a500; /* Gold color for card border */
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.9); /* Slightly transparent white */
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-title {
  color: #001f3f; /* Dark blue for title */
  font-size: 1.8rem;
}

.btn-primary {
  background-color: #f0a500; /* Gold color for button */
  border-color: #f0a500;
  color: #001f3f; /* Dark text on gold button */
  border-radius: 15px;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #e09500; /* Slightly darker gold on hover */
  border-color: #e09500;
  color: #001f3f;
}

.btn-link {
  color: #f0a500; /* Gold color for link */
}

.form-control:focus {
  border-color: #f0a500; /* Gold color for focus */
  box-shadow: 0 0 0 0.2rem rgba(240, 165, 0, 0.25);
}

.text-danger {
  color: #ff6b6b !important; /* Lighter red for error messages on dark background */
}

body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.form-control {
  background-color: rgba(255, 255, 255, 0.9);
  color: #001f3f;
  font-size: 1rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
  border-radius: 15px;
}

.form-control:focus {
  background-color: #ffffff;
  border-color: #f0a500;
  box-shadow: 0 0 0 0.2rem rgba(240, 165, 0, 0.25);
}

.form-label {
  color: #001f3f;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

/* Increase contrast for placeholder text */
.form-control::placeholder {
  color: #6c757d;
  opacity: 0.7;
}

/* Add some spacing between form elements */
.mb-3 {
  margin-bottom: 1.5rem !important;
}

/* Ensure text is visible on the dark background */
.card-body {
  color: #001f3f;
}

</style>