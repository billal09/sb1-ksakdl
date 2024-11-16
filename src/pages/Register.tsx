import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  siren: string;
  password: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    siren: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'Cette adresse email est déjà utilisée.';
        case 'auth/invalid-email':
          return 'Adresse email invalide.';
        case 'auth/operation-not-allowed':
          return 'L\'inscription est temporairement désactivée.';
        case 'auth/weak-password':
          return 'Le mot de passe est trop faible.';
        case 'auth/network-request-failed':
          return 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
        default:
          return 'Une erreur est survenue lors de l\'inscription.';
      }
    }
    return 'Une erreur inattendue est survenue.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-8">
        <UserPlus className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-8">Inscription</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={handleChange('companyName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Numéro SIREN
          </label>
          <input
            type="text"
            value={formData.siren}
            onChange={handleChange('siren')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
            pattern="[0-9]{9}"
            title="Le numéro SIREN doit contenir 9 chiffres"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Adresse
          </label>
          <textarea
            value={formData.address}
            onChange={handleChange('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
            rows={2}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
            minLength={6}
          />
          <p className="mt-1 text-sm text-gray-500">
            Le mot de passe doit contenir au moins 6 caractères
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
}