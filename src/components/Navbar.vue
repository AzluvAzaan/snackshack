<template>
  <nav class="navbar">
    <div class="navbar-logo">
      <img src="@/assets/snackshack-logo.png" alt="SnackShack logo" class="logo-image" />
      <span class="logo-text">SnackShack</span>
    </div>

    <!-- Toggle button for mobile -->
    <button class="navbar-toggle" @click="toggleMenu">
      &#9776;
    </button>

    <!-- Navigation links -->
    <ul class="navbar-links" :class="{ 'navbar-links-mobile': isMobileMenuOpen }">
      <li class="navbar-item">
        <router-link to="/" exact-active-class="active-link" exact>Home</router-link>
      </li>
      <li class="navbar-item">
        <router-link to="/map" active-class="active-link">Map</router-link>
      </li>
      <li class="navbar-item">
        <router-link to="/wheel" active-class="active-link">Wheel</router-link>
      </li>
      <li class="navbar-item">
        <router-link to="/login" active-class="active-link">Add a Vending Machine</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isMobileMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
  },
};
</script>

<style scoped>

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 2rem;
  background-color: #003061;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 60px;
  box-sizing: border-box;
}

.navbar + * {
  margin-top: 60px;
}

.navbar-logo {
  display: flex;
  align-items: center;
}

.logo-image {
  width: 55px;
  height: 50px;
  margin-right: 10px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.navbar-links {
  padding-top: 12px;
  display: flex;
  list-style-type: none;
  padding-left: 0;
  margin-left: auto;
}

.navbar-item {
  font-size: 1rem;
  margin-left: 1.5rem;
}

.navbar-item a {
  text-decoration: none;
  color: white;
  transition: color 0.3s ease;
}

.navbar-item .active-link {
  font-weight: bold;
  color: #f0a500 !important; /* Ensures active color overrides other styles */
}

.navbar-item a:hover {
  color: #f0a500;
}

.navbar-toggle {
  display: none;
  font-size: 1.5rem;
  background: none;
  color: white;
  cursor: pointer;
}

/* Mobile menu styles */
@media (max-width: 768px) {
  .navbar-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 60px;
    right: 0;
    background-color: #333;
    width: 100%;
    padding: 1rem 2rem;
  }

  .navbar-links.navbar-links-mobile {
    display: flex;
  }

  .navbar-toggle {
    display: block;
  }
}
</style>
