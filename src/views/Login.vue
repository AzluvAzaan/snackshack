<template>
  <div class="login-container container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
    <div class="card shadow-lg w-100">
      <div class="card-body p-4 p-sm-5">
        <h2 class="card-title text-center mb-4">Login</h2>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required>
          </div>
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg">Login</button>
          </div>
        </form>
        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
        <div class="text-center mt-4">
          <p class="mb-0">Don't have an account?</p>
          <button @click="goToRegister" class="btn btn-link">Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/firebase';

export default {
  name: 'Login',
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push("/admin");
      } catch (err) {
        this.error = "Login failed, please try again!";
      }
    },
    goToRegister() {
      this.$router.push('/register');
    }
  },
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #001f3f; /* Dark blue background */
}

.card {
  border-color: #f0a500; /* Gold color for card border */
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.9); /* Slightly transparent white */
  width: 90%;
  max-width: 400px;
}

.card-title {
  color: #001f3f; /* Dark blue for title */
  font-size: 1.8rem;
}

.btn-primary {
  background-color: #f0a500; /* Gold color for button */
  border-color: #f0a500;
  color: #001f3f; /* Dark text on gold button */
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


</style>