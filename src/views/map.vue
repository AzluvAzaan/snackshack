<template>
  <div class="app container-fluid">
    <div class="sidebar">
      <h1>Vending Machines Near You</h1>

      <!-- Search Bar -->
      <input
        type="text"
        class="search-bar"
        placeholder="Find Your Favourite Machine!"
        v-model="searchQuery"
        @input="filterMachines"
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
        <p>{{ machine.type }}</p>
        <div :class="getStatusClass(machine.status)">
          <p>{{ machine.status }}</p>
        </div>
        <div class="rating">
          <span>⭐ {{ machineReviews.machine }} </span>
        </div>
        <p>{{ machine.description }}</p>
        <p v-if = "this.userLocation">{{ calculateDistance(machine.coordinates) }}km away</p>
        <div class="actions">
          <button class="action-btn" @click="getDirections(machine)">Directions</button>
          <button class="action-btn" @click="writeReview(machine.id)">Review</button>
          <button class="action-btn" @click="selectMachine(machine)">Details</button>
        </div>
      </div>
    </div>

    <!-- Map element -->
    <div id="map-container" class="col-12 col-md-8 position-relative">
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
        <div class="rating">
          <span>⭐ {{ machineReviews.selectedMachine }} </span>
        </div>
        <p><strong>Address:</strong> {{ selectedMachine.locDes }}</p>
        <p><strong>Description:</strong> {{ selectedMachine.description }}</p>
        <p><strong>Contents:</strong> {{ selectedMachine.contents.join(' | ') }}</p>
        <div class="actions">
          <button class="action-btn" @click="getDirections(selectedMachine)">Directions</button>
          <router-link to="/review">
            <button class="action-btn">Review</button>
          </router-link>
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
      machineReviews: {},
      selectedMachine: null,
      infoWindow: null,
      markers: [],
      searchQuery: '',
      sortOption: 'type', // Default sort option
      filterType: '', // No filter by default
      userLocation: null,
    };
  },

  mounted() {
    this.fetchVendingMachines();
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

    getDirections(machine) {
      window.open('https://www.google.com/maps/dir/?api=1&destination=${machine.coordinates.latitude},${machine.coordinates.longitude}')
    },
  },
};
</script>

<style scoped>
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
    width: 300px;
    height: 83vh;
    padding: 20px;
    background-color: #30394f;
    color: white;
    overflow-y: auto;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .sidebar h1 {
    font-size: 2.0rem;
    text-align: center;
    margin-bottom: 1rem;
    color: #ffcc00;
  }

  .sidebar h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #ffcc00;
  }

  .search-bar {
    width: 92%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .sort-by, .filter-type {
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
    background-color: rgba(0, 0, 0, 0.3); /* Adjust for darker effect */
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
  }

  .status {
    border-radius: 5px;
    display: inline-block;
  }

  .status p {
    font-weight: bold;
    text-align: center;
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
    z-index: 2;
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
    font-size: 0.8rem;
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
    position: relative;
    flex-grow: 1;
    height: 95%;
  }

  #map {
    width: 100%;
    height: 94%;
  }

  /* Modal Styles */
  .details-modal {
    position: fixed;
    top: 60px;
    right: 0;
    width: 350px;
    height: calc(100% - 120px);
    background-color: #44516a;
    background-size: cover;
    background-position: center;
    color: white;
    padding: 20px;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
    z-index: 1000;
    transition: all 0.3s ease;
  }

  .details-modal::before {
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

  .details-modal::after {
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
    background: none;
    border: none;
    color: #ffcc00;
    font-size: 1.5rem;
    cursor: pointer;
    position: absolute;
    z-index: 2;
    top: 10px;
    right: 10px;
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

  @media (max-width: 768px) {

    .sidebar {
      width: 100%;
      height: 40vh;
    }

    #map {
      height: 60vh;
    }
  }

</style>