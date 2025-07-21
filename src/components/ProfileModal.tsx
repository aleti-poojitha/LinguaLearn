import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onSave
}) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<User>(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(user);
    setError(null);
    setSuccess(null);
    setEditMode(false);
  }, [user, isOpen]);

  useEffect(() => {
    if (editMode && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [editMode]);

  // Compare form and user to check if there are changes
  const isChanged = () => {
    const interestsA = Array.isArray(form.interests) ? form.interests.join(',') : '';
    const interestsB = Array.isArray(user.interests) ? user.interests.join(',') : '';
    return (
      form.name !== user.name ||
      form.email !== user.email ||
      form.phone !== user.phone ||
      form.education !== user.education ||
      String(form.age || '') !== String(user.age || '') ||
      form.gender !== user.gender ||
      form.location !== user.location ||
      interestsA !== interestsB
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      // Prepare payload
      const payload = {
        token,
        name: form.name,
        email: form.email,
        phone: form.phone,
        education: form.education,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        location: form.location,
        interests: Array.isArray(form.interests) ? form.interests : (form.interests ? String(form.interests).split(',').map(s => s.trim()).filter(Boolean) : [])
      };
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      const data = await res.json();
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      onSave(data.user);
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(user);
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = () => {
    setEditMode(true);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center h-screen">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-3xl border-b border-gray-100 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Profile Details
            </h2>
            <button
              onClick={() => { onClose(); setError(null); setSuccess(null); }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close profile"
            >
              <span className="text-2xl text-gray-600">&times;</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
            {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
            <div className="p-4 border border-purple-200 rounded-xl space-y-3 bg-purple-50">
              <div className="flex flex-col space-y-2">
                {editMode ? (
                  <>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Name:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="name"
                        value={form.name || ''}
                        onChange={handleChange}
                        disabled={loading}
                        ref={firstInputRef}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Email:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="email"
                        value={form.email || ''}
                        onChange={handleChange}
                        type="email"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Phone:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        type="tel"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Education:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="education"
                        value={form.education || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Age:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="age"
                        value={form.age || ''}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Gender:</label>
                      <select
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="gender"
                        value={form.gender || ''}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Location:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="location"
                        value={form.location || ''}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700 w-32">Interests:</label>
                      <input
                        className="flex-1 ml-2 border rounded px-2 py-1"
                        name="interests"
                        value={Array.isArray(form.interests) ? form.interests.join(', ') : (form.interests || '')}
                        onChange={e => setForm(prev => ({ ...prev, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                        placeholder="Comma separated"
                        disabled={loading}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-gray-900">{user.name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="text-gray-900">{user.email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Phone:</span>
                      <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Education:</span>
                      <span className="text-gray-900">{user.education || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Age:</span>
                      <span className="text-gray-900">{user.age || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Gender:</span>
                      <span className="text-gray-900">{user.gender || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Location:</span>
                      <span className="text-gray-900">{user.location || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Interests:</span>
                      <span className="text-gray-900 text-right">
                        {Array.isArray(user.interests) && user.interests.length > 0 ? user.interests.join(', ') : 'Not provided'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="bg-white rounded-b-3xl border-t border-gray-100 p-6 flex-shrink-0">
          <div className="flex space-x-3">
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={loading || !isChanged()}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 