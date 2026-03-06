import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';

interface ProfileData {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface VersionInfo {
  version: string;
  latestVersion: string;
  updateAvailable: boolean;
  downloadUrl: string;
}

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Version check
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [checkingVersion, setCheckingVersion] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkVersion();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setName(data.data.name || '');
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const checkVersion = async () => {
    try {
      setCheckingVersion(true);
      const response = await fetch('http://127.0.0.1:5000/api/system/version');
      if (!response.ok) {
        throw new Error('Failed to check version');
      }
      const data = await response.json();
      setVersionInfo(data);
    } catch (err: any) {
      console.error('Failed to check version:', err);
    } finally {
      setCheckingVersion(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setSuccess('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>User Profile & Settings</h1>
        </header>

        <div className="content-area" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Profile Card */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h2>Profile Information</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            {!editing ? (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Email:</strong> {profile?.email}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Name:</strong> {profile?.name || 'Not set'}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{profile?.role}</span>
                </div>
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={profile?.email} disabled style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} />
                  <small>Email cannot be changed</small>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => { setEditing(false); setName(profile?.name || ''); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password Change Card */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h2>Change Password</h2>

            {!changingPassword ? (
              <button className="edit-btn" onClick={() => setChangingPassword(true)}>
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password *</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label>New Password *</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password (min 6 characters)" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="save-btn">
                    Update Password
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Version & Update Card */}
          <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h2>Application Updates</h2>
            {checkingVersion ? (
              <p>Checking for updates...</p>
            ) : versionInfo ? (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Current Version:</strong> {versionInfo.version}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Latest Version:</strong> {versionInfo.latestVersion}
                </div>
                {versionInfo.updateAvailable ? (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                    <strong style={{ color: '#856404' }}>⚠️ Update Available!</strong>
                    <p style={{ color: '#856404', margin: '5px 0 0 0' }}>A new version is available. Please download it to get the latest features and security updates.</p>
                    <a href={versionInfo.downloadUrl} target="_blank" rel="noopener noreferrer" className="edit-btn" style={{ display: 'inline-block', marginTop: '10px' }}>
                      Download Update
                    </a>
                  </div>
                ) : (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                    <strong style={{ color: '#155724' }}>✓ You are up to date!</strong>
                    <p style={{ color: '#155724', margin: '5px 0 0 0' }}>You are running the latest version of the application.</p>
                  </div>
                )}
                <button className="edit-btn" onClick={checkVersion}>
                  Check for Updates
                </button>
              </div>
            ) : (
              <button className="edit-btn" onClick={checkVersion}>
                Check for Updates
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
