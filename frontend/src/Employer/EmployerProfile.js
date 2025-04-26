import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './EmployerProfile.css';

const EmployerProfile = () => {
  const [employerData, setEmployerData] = useState({
    username: '',
    email: '',
    company_name: '',
    company_description: '',
    jobCount: 0,
    profilePicture: 'https://i.pravatar.cc/150?img=12', // Default image
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(''); // Store base64 image or URL

  const [updatedData, setUpdatedData] = useState({
    username: '',
    email: '',
    company_name: '',
    company_description: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await api.get('/auth/profile');
  
        // Check if the profile picture is a base64 string, and set it accordingly
        console.log(response.data.profile_picture)
        if (response.data.profile_picture) {
          setProfilePicture(response.data.profile_picture); // Set base64 image directly
        } else {
          setProfilePicture('https://i.pravatar.cc/150?img=12'); // Default image
        }
  
        setEmployerData(response.data);  // Store other data as well
      } catch (error) {
        toast.error('Failed to load employer profile');
        console.error(error);
      }
    };
  
    fetchEmployerProfile();
  }, []);
  

  const handleEditClick = () => {
    setIsEditing(true);
    setProfilePicture(employerData.profile_picture || 'https://i.pravatar.cc/150?img=12');
    setUpdatedData({
      username: employerData.username,
      email: employerData.email,
      company_name: employerData.company_name,
      company_description: employerData.company_description,
    });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // 1. Update profile fields
      const profileResponse = await api.put('/auth/profile',updatedData);

      // 2. Update password only if both fields are filled and match
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        if (newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }

        await api.put(
          '/auth/update-password',
          { newPassword }
        );

        toast.success('Password updated successfully');
      }

      setEmployerData(profileResponse.data);
      setIsEditing(false);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleImageClick = () => {
    document.getElementById('profile-picture-input').click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file);  // Log the file to check
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result; // This is the base64 encoded image string
        console.log('Base64 Image:', base64Image);  // Log the base64 string
  
        setProfilePicture(base64Image);  // Update the profile picture immediately
  
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await api.put('/auth/upload-profile-picture', { profilePicture: base64Image });
  
          console.log('Backend Response:', response.data); // Log the response to see what the backend returns
  
          // Update employerData with the new image (if backend sends a URL or base64)
          setEmployerData((prev) => ({
            ...prev,
            profilePicture: response.data.profilePicture || base64Image, // Assuming backend returns the image URL or base64
          }));
  
          toast.success('Profile picture updated successfully');
        } catch (error) {
          toast.error('Failed to upload profile picture');
          console.error(error);
        }
      };
      reader.readAsDataURL(file); // Converts image to base64
    } else {
      console.error('No file selected');
    }
  };
  
  

  return (
    <div className="EmployerProfile-container">
      <img
        src={profilePicture || 'https://i.pravatar.cc/150?img=12'}
        alt="Profile"
        className="EmployerProfile-avatar"
        onClick={handleImageClick}
      />
      <input
        type="file"
        id="profile-picture-input"
        style={{ display: 'none' }}
        onChange={handleImageChange}
        accept="image/*"
      />
      <h2 className="EmployerProfile-title">Employer Profile</h2>

      <div className="EmployerProfile-details">
        <div className="EmployerProfile-column">
          <div className="EmployerProfile-field">
            <label className="EmployerProfile-label">Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={updatedData.username}
                onChange={handleInputChange}
                className="EmployerProfile-input"
              />
            ) : (
              <span className="EmployerProfile-text">{employerData.username}</span>
            )}
          </div>

          <div className="EmployerProfile-field">
            <label className="EmployerProfile-label">Email:</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={updatedData.email}
                onChange={handleInputChange}
                className="EmployerProfile-input"
              />
            ) : (
              <span className="EmployerProfile-text">{employerData.email}</span>
            )}
          </div>

          {isEditing && (
            <>
              <div className="EmployerProfile-field">
                <label className="EmployerProfile-label">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="EmployerProfile-input"
                />
              </div>
              <div className="EmployerProfile-field">
                <label className="EmployerProfile-label">Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="EmployerProfile-input"
                />
              </div>
            </>
          )}
        </div>

        <div className="EmployerProfile-column">
          <div className="EmployerProfile-field">
            <label className="EmployerProfile-label">Company Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="company_name"
                value={updatedData.company_name}
                onChange={handleInputChange}
                className="EmployerProfile-input"
              />
            ) : (
              <span className="EmployerProfile-text">{employerData.company_name}</span>
            )}
          </div>

          <div className="EmployerProfile-field">
            <label className="EmployerProfile-label">Company Description:</label>
            {isEditing ? (
              <textarea
                name="company_description"
                value={updatedData.company_description}
                onChange={handleInputChange}
                className="EmployerProfile-input"
                rows={3}
              />
            ) : (
              <span className="EmployerProfile-text">{employerData.company_description}</span>
            )}
          </div>
        </div>
      </div>

      <div className="EmployerProfile-footer">
        <div className="EmployerProfile-actions">
          {isEditing ? (
            <>
              <button className="EmployerProfile-saveButton" onClick={handleSaveClick}>
                Save
              </button>
              <button className="EmployerProfile-cancelButton" onClick={handleCancelClick}>
                Cancel
              </button>
            </>
          ) : (
            <button className="EmployerProfile-editButton" onClick={handleEditClick}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
