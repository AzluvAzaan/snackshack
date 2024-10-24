

<template>
  <div class="login-container">
    <h2>Login</h2>
    <!-- .prevent prevents default -->
    <form v-on:submit.prevent="login">
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
    <!-- Display error if unable to log in-->
    <p v-if="error" class="error-msg">{{ error }}</p>
    <div class="register-link">
      <p>Don't have an account?</p>
      <button @click="goToRegister">Register</button>
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth"; //Import function to login with email and password from firebase
import { auth } from '@/firebase'; //import auth from firebase.js

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
        // console.log("Logged in as:", userCredential.user.email);
        this.$router.push("/admin"); // Redirect to admin page to add/edit/delete vending machines
      } catch (err) {
        //console.log(err.message)
        this.error = "Login failed, try again!"; // Display error if login fails 
      }
    },
    goToRegister() {
      this.$router.push('/register'); // Redirect to the register page
    }
  },
};
</script>

<style scoped>
.error-msg {
  color: red;
  margin-top: 10px;
}
</style>