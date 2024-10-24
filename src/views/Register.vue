<template>
    <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div class="input-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="input-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>
    <div class="login-link">
      <p>Already have an account?</p>
      <button @click="goToLogin">Login</button>
    </div>
  </div>
  </template>
  
  <script>
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { auth } from '@/firebase';
  
  export default {
    name: 'Register',
    data() {
      return {
        email: "",
        password: "",
        confirmPassword: "",
        error: "",
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
          console.log("Registered as:", userCredential.user.email);
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