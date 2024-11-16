import { auth, db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  deleteUser, 
  updateProfile, 
  updateEmail, 
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

interface UserUpdateData {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  siren: string;
}

interface ReauthData {
  email: string;
  password: string;
}

class UserService {
  async reauthenticateUser(data: ReauthData): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Utilisateur non connecté');

    const credential = EmailAuthProvider.credential(data.email, data.password);
    await reauthenticateWithCredential(user, credential);
  }

  async updateUserProfile(userId: string, data: UserUpdateData): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      // Update auth profile
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`
      });

      // Update email if changed
      if (data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      // Update Firestore data
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }

  async deleteUserAccount(userId: string, reauthData?: ReauthData): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      // If reauthData is provided, reauthenticate first
      if (reauthData) {
        await this.reauthenticateUser(reauthData);
      }

      // Delete Firestore data first
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // Then delete auth user
      await deleteUser(user);
    } catch (error: any) {
      if (error?.code === 'auth/requires-recent-login') {
        throw new Error('REAUTH_REQUIRED');
      }
      console.error('Erreur suppression compte:', error);
      throw error;
    }
  }
}

export const userService = new UserService();