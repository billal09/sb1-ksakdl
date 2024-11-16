import { collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function deleteAllCollections() {
  try {
    // Liste des collections à supprimer
    const collections = ['invoices', 'users', '_schema'];

    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      // Utiliser des batchs pour supprimer les documents par groupes de 500
      const batchSize = 500;
      const batches = [];
      let batch = writeBatch(db);
      let operationCount = 0;

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        operationCount++;

        if (operationCount === batchSize) {
          batches.push(batch.commit());
          batch = writeBatch(db);
          operationCount = 0;
        }
      });

      // Commit le dernier batch s'il reste des opérations
      if (operationCount > 0) {
        batches.push(batch.commit());
      }

      // Attendre que tous les batches soient terminés
      await Promise.all(batches);
      console.log(`Collection ${collectionName} supprimée`);
    }

    console.log('Toutes les collections ont été supprimées avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des collections:', error);
    throw error;
  }
}