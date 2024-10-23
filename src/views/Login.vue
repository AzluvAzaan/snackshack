

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div class="input-group">
        <label for="email">Email</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
    <div class="register-link">
      <p>Don't have an account?</p>
      <button @click="goToRegister">Register</button>
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/firebase'; // Make sure the path is correct

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
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log("Logged in as:", userCredential.user.email);
        this.$router.push("/admin"); // Redirect to dashboard or any protected route
      } catch (err) {
        this.error = err.message; // Display error if login fails
      }
    },
    goToRegister() {
      this.$router.push('/register'); // Redirect to the register page
    }
  },
};
</script>