<template>
  <div class="app">
    <div class="sidebar">
      <h1>Vending Machines Near You:</h1>
      <button class="filter-btn">
        <i class="fas fa-filter"></i> Filter By:
      </button>

      <!-- Loop through vending machines to create cards -->
      <div 
        class="vending-card" 
        v-for="(machine, index) in vendingMachines" 
        :key="index" 
        @click="showDetails(machine)"
      >
        <h2>{{ machine.name }}</h2>
        <div class="rating">
          <span>⭐ {{ machine.rating }} ({{ machine.reviews }})</span>
        </div>
        <p>{{ machine.address }}</p>
        <p>{{ machine.description }}</p>
        <div class="actions">
          <button class="action-btn">Directions</button>
          <button class="action-btn">Details</button>
        </div>
      </div>
    </div>

    <!-- Map element -->
    <div id="map"></div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        vendingMachines: [
          {
            name: "Coffee Bot",
            rating: "4.5",
            reviews: "399",
            address: "70 Stamford Rd, Singapore 178901\nFloor B1 Singapore Management University",
            description: "Clean, well-stocked and affordable",
            lat: 1.2978,
            lng: 103.8477
          },
          {
            name: "Orange Juice Bot",
            rating: "4.5",
            reviews: "399",
            address: "70 Stamford Rd, Singapore 178901\nFloor B1 Singapore Management University",
            description: "Clean, well-stocked and affordable",
            lat: 1.2982,
            lng: 103.8480
          },
          {
            name: "Snack Bot",
            rating: "4.5",
            reviews: "399",
            address: "70 Stamford Rd, Singapore 178901\nFloor B1 Singapore Management University",
            description: "Clean, well-stocked and affordable",
            lat: 1.2975,
            lng: 103.8473
          },
          {
            name: "Salad Bot",
            rating: "4.5",
            reviews: "399",
            address: "70 Stamford Rd, Singapore 178901\nFloor B1 Singapore Management University",
            description: "Clean, well-stocked and affordable",
            lat: 1.2970,
            lng: 103.8471
          }
        ],
        infoWindow: null,  // Store the current info window
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        // Create the map centered on the user's location or default
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: this.userLocation,
          zoom: 16,
        });

        // Detect user's location
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

        // Add vending machine markers
        this.vendingMachines.forEach((machine) => {
          const marker = new google.maps.Marker({
            position: { lat: machine.lat, lng: machine.lng },
            map: this.map,
            title: machine.name,
          });

          // Create an info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="info-window">
                <h3> ${machine.name} </h3>
                <p><strong>Rating:</strong> ${machine.rating} </p>
                <p><strong>Reviews:</strong> ${machine.reviews} </p>
                <p><strong>Address:</strong> ${machine.address} </p>
                <p><strong>Description:</strong> ${machine.description} </p>
              </div>
            `,
          });

          // Add click listener to show the popup (infoWindow)
          marker.addListener('click', () => {
            // Close the currently opened info window, if any
            if (this.infoWindow) {
              this.infoWindow.close();
            }
            this.infoWindow = infoWindow;
            infoWindow.open(this.map, marker);
          });
        });
      },
      selectMachine(machine) {
        this.selectedMachine = machine;
      },
      closeDetails() {
        this.selectedMachine = null;
      },
      getDirections(location) {
        // Link to Google Maps directions
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`);
      },
      viewReviews(machine) {
        alert(`Viewing reviews for ${machine.name}`);
      },
      viewDetails(machine) {
        alert(`Viewing details for ${machine.name}`);
      },
    },
  };
</script>

<style scoped>
  /* Global styles */
  html, body {
    height: 100%;
    margin: 0;
    font-family: 'Avenir', sans-serif;
    background-color: #f0f2f5;
  }

  .app {
    display: flex;
    height: 100vh;
  }

  .sidebar {
    width: 350px;
    padding: 20px;
    background-color: #30394f;
    color: white;
    overflow-y: auto;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .sidebar h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #ffcc00;
  }

  .filter-btn {
    width: 100%;
    background-color: #3b4a67;
    border: none;
    color: white;
    font-size: 1.2rem;
    padding: 10px;
    margin-bottom: 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .filter-btn i {
    margin-right: 8px;
  }

  .vending-card {
    background-color: #44516a;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 10px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
  }

  .vending-card:hover {
    transform: scale(1.05);
  }

  .vending-card h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #ffcc00;
  }

  .rating span {
    color: #ffc107;
    font-weight: bold;
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
    font-size: 1rem;
    cursor: pointer;
    margin-right: 5px;
    color: black;
    transition: background-color 0.3s ease;
  }

  .action-btn:hover {
    background-color: #ffd633;
  }

  #map {
    flex-grow: 1;
    height: 100%;
  }

  @media (max-width: 768px) {
    .app {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      height: 40vh;
    }

    #map {
      height: 60vh;
    }
  }

  /* Info window styling */
  .info-window {
    font-family: 'Avenir', sans-serif;
    color: #30394f;
  }

  .info-window h3 {
    color: #ffcc00;
    margin: 0;
    font-size: 1.2rem;
  }

  .info-window p {
    margin: 5px 0;
    font-size: 1rem;
  }
</style>