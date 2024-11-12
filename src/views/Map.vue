<template>
  <div class="app d-flex">
    <nav id="sidebarMenu" class="col-md-3 sidebar" :class="{'sidebar-hidden': !sidebarVisible }">
      <h1>Vending Machines Near You</h1>

      <!-- Search Bar -->
      <input
        type="text"
        class="search-bar"
        placeholder="Find Your Favourite Food/Machine!"
        v-model="searchQuery"
      />

      <!-- Filter By Section -->
      <div class="filter-container">
        <span>Filter By:</span>
        <select class="filter-type" v-model="filterType">
          <option value="">Select Type</option>
          <option value="Drinks">Drinks</option>
          <option value="Snacks">Snacks</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <!-- Results Message -->
      <p v-if="searchQuery && filteredMachines.length === 0">No search results  for "{{ lowerCaseQuery }}".</p>
      <p v-else-if="searchQuery && filteredMachines.length === 1">{{ filteredMachines.length }} result for "{{ lowerCaseQuery }}".</p>
      <p v-else-if="searchQuery"> {{ filteredMachines.length }} result(s) for "{{ lowerCaseQuery }}".</p>    

      <!-- Loop through vending machines to create cards -->
      <div
        class="vending-card"
        v-for="(machine, index) in filteredMachines"
        :key="index"
        @click="selectMachine(machine)"
        @mouseover="bounceMarker(machine.id)"
        @mouseleave="stopBounce(machine.id)"
        :style="{ backgroundImage: `url(${machine.imageUrl})` }"
      >
        <h2>{{ machine.machineName }}</h2>
        <img :src="machine.imageUrl" alt="Vending Machine Image" class="vending-thumbnail">
        <p>{{ machine.type }}</p>
        <div :class="getStatusClass(machine.status)">
          <p>{{ machine.status }}</p>
        </div>
        <div class="rating" @click="writeReview(selectedMachine.id)">
          <span v-if = "machine.numReviews==0">★ No reviews yet... </span>
          <span v-else-if = "machine.numReviews==1">★ {{ machine.avgRating }}/5, 1 review </span>
          <span v-else>★ {{ machine.avgRating }}/5, {{ machine.numReviews }} reviews </span>
        </div>
        <p>{{ machine.description }}</p>
        <p v-if = "this.userLocation">
          <span v-if = "calculateDistance(machine.coordinates) > 0.1">{{ calculateDistance(machine.coordinates) }}km away</span>
          <span v-else>{{ calculateDistance(machine.coordinates) * 1000 }}m away</span>
        </p>
        <div class="actions">
          <button class="action-btn" @click="getDirections(machine.coordinates)">Directions</button>
          <button class="action-btn" @click="writeReview(machine.id)">Review</button>
        </div>
      </div>
    </nav>

    <!-- Toggle Button for Small Screens -->
    <button v-if="isSmallScreen" @click="toggleMap" class="map-toggle-btn">
      {{ mapVisible ? 'View Machines' : 'View Map' }}
    </button>

    <!-- Map element -->
    <div id="map-container" :class="{'map-hidden': !mapVisible }">
      <div id="map"></div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedMachine" class="details-modal" :style="{ backgroundImage: `url(${selectedMachine.imageUrl})` }">
      <div class="modal-content">
        <button class="close-btn" @click="closeDetails">✖</button>
        <h2>{{ selectedMachine.machineName }}</h2>
        <p>{{ selectedMachine.type }}</p>
        <div :class="getStatusClass(selectedMachine.status)">
          <p>{{ selectedMachine.status }}</p>
        </div>
        <div class="rating rating-click" @click="writeReview(selectedMachine.id)">
          <span v-if = "selectedMachine.numReviews==0">★ No reviews yet... </span>
          <span v-else-if = "selectedMachine.numReviews==1">★ {{ selectedMachine.avgRating }}/5, 1 review </span>
          <span v-else>★ {{ selectedMachine.avgRating }}/5, {{ selectedMachine.numReviews }} reviews </span>
        </div>
        <p><strong>Address:</strong> {{ selectedMachine.locDes }}</p>
        <p><strong>Description:</strong> {{ selectedMachine.description }}</p>
        <p><strong>Contents:</strong> {{ selectedMachine.contents.join(' | ') }}</p>
        <p><strong>Payment Methods:</strong> {{ selectedMachine.paymentType.join(' | ') }}</p>
        <div class="actions">
          <button class="action-btn" @click="getDirections(selectedMachine.coordinates)">Directions</button>
          <button class="action-btn" @click="writeReview(selectedMachine.id)">Review</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  data() {
    return {
      vendingMachines: [],
      selectedMachine: null,
      infoWindow: null,
      markers: [],
      searchQuery: '',
      sortOption: 'type', // Default sort option
      filterType: '', // No filter by default
      userLocation: null,
      sidebarVisible: false,
      mapVisible: true,
      isSmallScreen: false,
    };
  },


  mounted() {
    this.fetchVendingMachines().then(() => {
      // Check if there are query parameters for machine coordinates
      const machineLat = parseFloat(this.$route.query.lat);
      const machineLng = parseFloat(this.$route.query.lng);
      const machineId = this.$route.query.machineId;

      // If machine coordinates exist, center the map on them
      if (!isNaN(machineLat) && !isNaN(machineLng) && machineId) {
        this.map.setCenter({ lat: machineLat, lng: machineLng });

        // Find the marker for this machine based on its ID
        const selectedMarker = this.markers.find(([id]) => id === machineId);

        if (selectedMarker) {
          const marker = selectedMarker[1];
          marker.setAnimation(google.maps.Animation.BOUNCE);
          
          // Optional: Select the machine to show details if you want a modal or info window
          this.selectedMachine = this.vendingMachines.find(machine => machine.id === machineId);

          // Stop the bounce animation after a short period
          setTimeout(() => marker.setAnimation(null), 1400);
        }
      }
    });
    this.checkScreenWidth();
    window.addEventListener('resize', this.checkScreenWidth);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenWidth);
  },

  created() {
    this.searchQuery = this.$route.query.snack || ''; // Set search bar text to snack query if available
  },

  computed: {
    filteredMachines() {
      let machines = this.vendingMachines;

      // Apply search query filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        machines = machines.filter(machine => {
          return (
            machine.machineName.toLowerCase().includes(query) ||
            machine.description.toLowerCase().includes(query) ||
            machine.contents.some(content => content.toLowerCase().includes(query))
          );
        });
      }

      // Apply filter by type
      if (this.filterType) {
        machines = machines.filter(machine => machine.type === this.filterType);
      }

      // Sort by distance and add distance property
      return machines
        .map(machine => ({
          ...machine,
          distance: this.calculateDistance(machine.coordinates),
        }))
        .sort((a, b) => a.distance - b.distance);
    },

    lowerCaseQuery() {
      return this.searchQuery.toLowerCase();
    },
  },

  methods: {
    toggleMap() {
      this.mapVisible = !this.mapVisible;
      if(this.mapVisible == true){
        this.sidebarVisible = false;
      }
      else{
        this.sidebarVisible = true;
      }
    },
    checkScreenWidth() {
      this.isSmallScreen = (window.innerWidth <= 768); // Define your threshold for "small screen"
      if (!this.isSmallScreen) {
        this.mapVisible = true; // Show map by default on larger screens
        this.sidebarVisible = true;
      }
      else {
        if(this.sidebarVisible == true){
          this.mapVisible = false;
        }
      }
    },

    async fetchVendingMachines() {
      try {
        const vendingMachinesRef = collection(db, 'vendingMachines');
        const snapshot = await getDocs(vendingMachinesRef);
        this.vendingMachines = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.initMap();
      } catch (error) {
        console.error("Error fetching vending machines:", error);
      }
    },
    async initMap() {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: this.userLocation,
        zoom: 16,
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.map.setCenter(this.userLocation);
          },
          (error) => {
            console.error("Geolocation failed or not supported.");
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }

      this.vendingMachines.forEach((machine) => {
        const marker = new google.maps.Marker({
          position: { lat: machine.coordinates.latitude, lng: machine.coordinates.longitude },
          map: this.map,
          title: machine.machineName,
        });

        this.markers.push([machine.id, marker])

        marker.addListener('click', () => {
          this.selectMachine(machine)
        });

      })
    },

    calculateDistance(machineCoords) {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371; // Earth’s mean radius in km

      const dLat = toRad(machineCoords.latitude - this.userLocation.lat);
      const dLng = toRad(machineCoords.longitude - this.userLocation.lng);
      const lat1 = toRad(this.userLocation.lat);
      const lat2 = toRad(machineCoords.latitude);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return (R * c).toFixed(2); // Distance in km, rounded to 2 decimal places
    },

    bounceMarker(id){
      for(let object of this.markers){
        if(object[0] == id){
          let marker = object[1]
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }
    },

    stopBounce(id){
      for(let object of this.markers){
        if(object[0] == id){
          let marker = object[1]
          marker.setAnimation(null);
        }
      }
    },


    getStatusClass(status) {
      switch (status) {
        case 'Running':
          return 'status status-running';
        case 'Maintenance':
          return 'status status-maintenance';
        case 'Out Of Order':
          return 'status status-out-of-order';
        default:
          return '';
      }
    },

    selectMachine(machine) {
      this.selectedMachine = machine;
    },
    closeDetails() {
      this.selectedMachine = null;
    },
    writeReview(machineID){
      this.$router.push({
        name: 'Review',
        query: { machine: machineID }
      });
    },    

    getDirections(coordinates) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`)
    },
  },
};
</script>

<style scoped>
  @import 'bootstrap/dist/css/bootstrap.css';

  .app {
    position:fixed;
    top:0px;
    bottom:0px;
    left:0px;
    right:0px;
    display: flex;
    height: 100vh;
  }

  .sidebar {
    animation: popup 0.5s ease forwards;
    display: block;
    width: 300px;
    height: calc(100% - 60px);
    padding: 20px;
    background: linear-gradient(to bottom, #003061, #001f3f, black);
    color: white;
    overflow-y: auto;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  #sidebarMenu.sidebar-hidden {
    display: none;
  }

  .sidebar h1 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1rem;
    color: white;
  }

  .sidebar h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #ffcc00;
  }

  .search-bar {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.9rem;
  }

  .sort-by, .filter-type {
    margin-bottom: 15px;
  }

  .filter-container {
    margin-bottom: 15px;
  }

  select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .vending-card {
    position: relative;
    color: white;
    background-size: cover;
    background-position: center;
    background-color: #44516a;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 10px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;

  }

  .vending-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* Adjust for darker effect */
    border-radius: 10px;
    z-index: 1; /* Overlay below text */
  }
 
  .vending-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* Adjust the opacity for darkness */
    border-radius: 10px;
    z-index: 1; /* Make sure overlay is above the background but below text */
  }

  .vending-card:hover {
    transform: scale(1.05);
    cursor: pointer;
  }

  .vending-thumbnail {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 20px;
      filter: brightness(1.2); /* Brighter effect */
      opacity: 0.9; /* Slight transparency */
      position: absolute;
      top: 50px;
      right: 10px;
      z-index: 9;
  }

  .vending-thumbnail:hover {
    transform: scale(1.5);
    transition: 0.2s ease;
  }

  .status {
    border-radius: 5px;
    display: inline-block;
  }

  .status p {
    font-weight: bold;
  }

  .status-running {
    color: #28a745; /* Green */
  }

  .status-maintenance {
    color: #ffa500; /* Orange */
  }

  .status-out-of-order {
    color: #dc3545; /* Red */
  }

  .rating span {
    color: #ffc107;
    font-weight: bold;
    position: relative;
    z-index: 5;
  }

  .rating-click span:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .vending-card p {
    margin: 0.5rem 0;
    font-size: 1rem;
  }

  .actions {
    margin-top: 10px;
  }

  .action-btn {
    background-color: #ffcc00;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
    color: black;
    transition: background-color 0.3s ease;
    position: relative;
    z-index: 2
  }
 
  .action-btn:hover {
    background-color: #ffd633;
  }

  /* Map and zoom controls styling */
  #map-container {
    animation: popup 0.5s ease forwards;
    display: block;
    flex-grow: 1;
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }

  /* Hidden map style */
  #map-container.map-hidden {
    display: none;
  }

  /* Button styling */
  .map-toggle-btn {
    position: fixed;
    bottom: 15px;
    right: 55px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1010;
    display: none; /* Hide by default */
  }

  #map {
    width: 100%;
    height: calc(100% - 60px);
  }

  /* Modal Styles */
  @keyframes popup {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .details-modal {
    position: fixed;
    bottom: 0px;
    right: 0;
    width: 420px;
    height: calc(100% - 60px);
    background-size: cover;
    background-position: center;
    color: white;
    padding: 20px;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
    z-index: 1;
    transition: all 0.3s ease;
    animation: popup 0.8s ease forwards;
  }


  .details-modal::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6); /* Adjust the opacity for darkness */
    z-index: 1; /* Make sure overlay is above the background but below text */
  }

  .vending-card h2, .details-modal h2 {
    padding: 5px;
    border-radius: 5px;
    margin-bottom: 10px;
    position: relative; /* Ensure text is above the overlay */
    z-index: 2; /* Bring the text above the overlay */
  }
  

  .vending-card p, .details-modal p {
    padding: 5px;
    border-radius: 5px;
    position: relative; /* Ensure text is above the overlay */
    z-index: 2; /* Bring the text above the overlay */
  }

  .close-btn {
    position: absolute;
    top: 10px; 
    right: 10px;
    font-size: 24px;
    background: transparent;
    border: none; 
    cursor: pointer;
    z-index: 1001; /* Make sure it's above other modal content */
    padding: 0; /* No padding for better alignment */
    line-height: 1; /* Ensures button height aligns with font-size */
  }

  /* Optional Hover and Focus Effect */
  .close-btn:hover,
  .close-btn:focus {
    color: #ff9900; /* Slightly darker color on hover */
    outline: none; /* Removes default focus outline */
  }

  /* Temporary outline to debug clickable area */
  .close-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .details-modal h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #ffcc00;
  }

  .details-modal .rating {
    color: #ffc107;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .details-modal p {
    margin: 0.5rem 0;
    font-size: 1rem;
  }

  .details-modal .actions {
    margin-top: 10px;
  }

  .details-modal .action-btn {
    background-color: #ffcc00;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    margin-right: 5px;
    color: black;
    transition: background-color 0.3s ease;
  }

  .details-modal .action-btn:hover {
    background-color: #ffd633;
  }

  @media (min-width: 769px) {
    .sidebar {
        display: block;
    }
  }

  @media only screen and (max-width: 768px) {

    .app {
      flex-direction: column;
    }

    .map-toggle-btn {
      display: block;
    }

    .sidebar {
      width: 100%;
    }

    #map-container {
      width: 100%;
      height: 100vh;
      flex-grow: 1;
    }


    .vending-thumbnail{
      position: absolute;
      top: 15%;
      right: 45px;
      transform: scale(1.5)
    }

    .vending-thumbnail:hover{
      transform: scale(1.8);
    }

    .details-modal {
      position: absolute;
      bottom: 0; /* position it at the bottom */
      width: 300px;
      max-height: 70vh;
      max-width: 100%;
      z-index: 10; /* ensures the modal appears above other elements */
      overflow-y: auto;
    }

    .details-modal h2 {
      font-size: 1.1em;
      margin: 0rem;
    }
    
    .details-modal p {
      font-size: 0.7em;
      margin: 0rem;
    }

    .details-modal .rating {
      font-size: 0.7em;
      margin-bottom: 5px;
    }

    .details-modal .action-btn {
      font-size: 0.7em;
      padding: 5px 10px;
    }

  }

  @media only screen and (max-width: 426px) {
    .details-modal {
      width: 100%;
      max-height: 75vh;
    }

    .vending-thumbnail{
      right: 15px;
      transform: scale(1.0)
    }
  }


</style>