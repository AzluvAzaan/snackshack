<template>
  <nav class="navbar">
    <!-- Logo section -->
    <div class="navbar-logo">
      <img src="@/assets/snackshack.png" alt="SnackShack logo" class="logo-image">
      <span class="logo-text">SnackShack</span>
    </div>

    <!-- Navigation links -->
    <ul class="navbar-links">
      <li class="navbar-item" :class="{ active: activeLink === 'home' }">
        <router-link to="/" @click.native="setActiveLink('home')">Home</router-link>
      </li>
      <li class="navbar-item" :class="{ active: activeLink === 'map' }">
        <router-link to="/map" @click.native="setActiveLink('map')">Map</router-link>
      </li>
      <li class="navbar-item" :class="{ active: activeLink === 'wheel' }">
        <router-link to="/wheel" @click.native="setActiveLink('wheel')">Wheel</router-link>
      </li>
      <li class="navbar-item" :class="{ active: activeLink === 'login' }">
        <router-link to="/login" @click.native="setActiveLink('login')">Add a Vending machine</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      activeLink: 'home', // Default active link
    };
  },
  methods: {
    setActiveLink(link) {
      this.activeLink = link;
    }
  }
};
</script>

<style scoped>
/* General navbar styling */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 2rem;
  background-color: #333;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 60px; /* Fixed height for navbar */
  box-sizing: border-box; /* Ensure padding is included in width */
  overflow: hidden;
}

/* Add padding to the page to avoid the navbar overlapping content */
.navbar + * {
  margin-top: 60px;
}

/* Logo styling */
.navbar-logo {
  display: flex;
  align-items: center;
}

.logo-image {
  width: 45px;
  height: 50px;
  margin-right: 10px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

/* Navigation links */
.navbar-links {
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
  list-style-type: none;
  padding-left: 0;
  margin-left: auto; /* Push the links to the right */
}

.navbar-item {
  font-size: 1rem;
  margin-left: 1.5rem; /* Adds space between links */
}

.navbar-item a {
  text-decoration: none;
  color: white;
  transition: color 0.3s ease;
}

.navbar-item.active a {
  font-weight: bold;
  color: #f0a500;
}

.navbar-item a:hover {
  color: #f0a500;
}
</style>
