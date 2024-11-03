import { db, storage } from '@/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  increment,
  setDoc,
  getDoc,
  writeBatch, 
  orderBy,
  limit,
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';


export default {
    async fetchUserMachines(userId) {
      const q = query(collection(db, "vendingMachines"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  
    async addVendingMachine(machineData, userId) {
      return await addDoc(collection(db, "vendingMachines"), {
        ...machineData,
        userId: userId
      });
    },
  
    async updateVendingMachine(machineId, machineData) {
      await updateDoc(doc(db, "vendingMachines", machineId), machineData);
    },
  
    async deleteVendingMachine(machineId) {
      await deleteDoc(doc(db, "vendingMachines", machineId));
    },
  
    async uploadImage(file) {
      if (!file) return null;
      const storageRef = ref(storage, `machine-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    },

    async  deleteImage(imageUrl) {
        if (!imageUrl) return;
        const imageRef = ref(storage, imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting image: ", error);
        }
    },

    async getAllVendingMachines() {
        const machinesCollection = collection(db, "vendingMachines");
        const querySnapshot = await getDocs(machinesCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async getReviewsForMachine(machineId) {
        const reviewsCollection = collection(db, "reviews");
        const q = query(reviewsCollection, where("machineID", "==", machineId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Work in Progress...
    // async getRecentReviewsForMachine(machineId) {
    //     console.log("Fetching recent reviews for machine:", machineId); 
    //     try {
    //         const reviewsCollection = collection(db, "reviews");
    //         const q = query(
    //           reviewsCollection,
    //           where("machineID", "==", machineId),
    //           orderBy("timestamp", "desc"),
    //           limit(5)
    //         );
    //         const querySnapshot = await getDocs(q);
    //         return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //       } catch (error) {
    //         console.error("Error fetching recent reviews:", error);
    //         throw error;
    //       }
    // },
    
    async getAllReviews() {
        const reviewsCollection = collection(db, "reviews");
        const querySnapshot = await getDocs(reviewsCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addReview(reviewData) {
        try {
          // Add the review
          const reviewRef = await addDoc(collection(db, "reviews"), reviewData);
    
          // Update the review count for the vending machine
          const machineRef = doc(db, 'vendingMachines', reviewData.machineID);
          await updateDoc(machineRef, {
            numReviews: increment(1)  // Assuming 'reviews' is the field name for the review count
          });
    
          return reviewRef;
        } catch (error) {
          console.error("Error adding review:", error);
          throw error;  // Re-throw the error so it can be caught by the calling function
        }
      },

    async updateMachineRating(machineId, avgRating) {
        try {
          const machineRef = doc(db, 'vendingMachines', machineId);
          await updateDoc(machineRef, { avgRating: avgRating });
        } catch (error) {
          console.error("Error updating machine rating:", error);
        }
      },

    async storeUserData(userId, userData) {
    try {
        await setDoc(doc(db, "users", userId), userData);
        console.log("User data stored successfully");
    } catch (error) {
        console.error("Error storing user data:", error);
        throw error;
    }
    },

    async getUserData(userId) {
        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            return userSnap.data();
          } else {
            console.log("No such user!");
            return null;
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          throw error;
        }
      },

      async updateUserData(userId, userData) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, userData);
      },

      async deleteAllReviewsForMachine(machineId) {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('machineID', '==', machineId));
        const querySnapshot = await getDocs(q);
      
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      
        await batch.commit();
      },


  };