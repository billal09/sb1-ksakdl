import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { User, UserCircle, Settings, LogOut, Trash2 } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

interface ReauthFormData {
  email: string;
  password: string;
}

export default function ProfileMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const handleDeleteAccount = async (reauthData?: ReauthFormData) => {
    if (!currentUser) return;
    
    try {
      setError('');
      await userService.deleteUserAccount(currentUser.uid, reauthData);
      navigate('/');
    } catch (error: any) {
      if (error.message === 'REAUTH_REQUIRED') {
        setShowReauthModal(true);
        setShowDeleteConfirm(false);
        return;
      }
      setError(error.message || 'Une erreur est survenue');
    }
  };

  const handleReauthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reauthData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };
    await handleDeleteAccount(reauthData);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
      >
        <UserCircle className="h-6 w-6" />
        <span className="hidden md:block">{userData?.firstName}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          <button
            onClick={() => {
              setShowMenu(false);
              setShowEditModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
            Modifier mon compte
          </button>
          
          <button
            onClick={() => {
              setShowMenu(false);
              setShowDeleteConfirm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Désactiver mon compte
          </button>

          <hr className="my-2" />
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteAccount()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showReauthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmation requise</h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <p className="text-gray-600 mb-6">
              Pour des raisons de sécurité, veuillez confirmer votre identité.
            </p>
            <form onSubmit={handleReauthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReauthModal(false);
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
      />
    </div>
  );
}