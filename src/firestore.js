import { db, storage } from '@/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
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
        const q = query(reviewsCollection, where("machineId", "==", machineId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async getAllReviews() {
        const reviewsCollection = collection(db, "reviews");
        const querySnapshot = await getDocs(reviewsCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addReview(reviewData) {
        return await addDoc(collection(db, "reviews"), reviewData);
    }

  };