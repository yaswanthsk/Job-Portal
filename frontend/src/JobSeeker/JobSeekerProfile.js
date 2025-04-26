import React, { useState, useEffect } from 'react';
import './JobSeekerProfile.css';
import JobSeekerNavbar from './JobSeekerNavbar';
import api from '../utils/api';
import {toast } from 'react-toastify';

const JobSeekerProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        skills: '',
        experience: '',
        location: '',
        resume: null,
        profile_photo: null,
        is_fresher: 'Fresher',
        current_title: '',
        willing_to_relocate: 'No', // Change this to 'Yes' or 'No'
        linkedin_url: '',
        github_url: '',
    });

    const [errors, setErrors] = useState({});
    const [resumeStatus, setResumeStatus] = useState('');
    const [profilePhotoStatus, setProfilePhotoStatus] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/jobseeker/profile');
                const profile = response.data;

                setFormData({
                    ...profile,
                    is_fresher: profile.is_fresher === 'Fresher' ? 'Fresher' : 'Experienced', // Set 'Fresher' or 'Experienced'
                    willing_to_relocate: profile.willing_to_relocate === 'Yes' ? 'Yes' : 'No', // Set 'Yes' or 'No'
                });

                setProfileExists(true);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setProfileExists(false);
                } else {
                    console.error('Error fetching profile data:', error);
                }
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        console.log("Profile Exists?", profileExists);
    }, [profileExists]);


    const handleCancel = () => {
        window.location.href = '/jobseeker/profile';
    };

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (!file) return;

            if (name === 'resume') {
                if (file.type !== 'application/pdf') {
                    alert('Please upload a valid PDF file for your resume.');
                    return;
                }
                setFormData(prev => ({ ...prev, resume: file }));
                setResumeStatus('Resume uploaded ✅');
            } else if (name === 'profile_photo') {
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    alert('Please upload a valid image (JPEG/PNG) for the profile photo.');
                    return;
                }
                if (name === 'profile_photo') {
                    if (files && files[0]) {
                        setProfilePhotoPreview(URL.createObjectURL(files[0])); // 👈 create preview
                    }
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, [name]: reader.result }));
                    setProfilePhotoStatus('Profile photo uploaded ✅');
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'checkbox') {
            // For 'willing_to_relocate', toggle between 'Yes' and 'No'
            setFormData(prev => ({
                ...prev,
                willing_to_relocate: checked ? 'Yes' : 'No',
            }));
        } else if (name === 'is_fresher') {
            setFormData(prev => ({ ...prev, is_fresher: value }));

        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };



    const validateForm = () => {
        let formErrors = {};
        if (!formData.name) formErrors.name = 'Full Name is required';
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            formErrors.phone = 'Phone number must be 10 digits';
        }
        if (!formData.linkedin_url) formErrors.linkedin_url = 'LinkedIn URL is required';
        if (!formData.github_url) formErrors.github_url = 'GitHub URL is required';
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        // Handle Save Profile (POST)
        if (validateForm()) {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('skills', formData.skills);
                formDataToSend.append('experience', formData.experience);
                formDataToSend.append('location', formData.location);
                formDataToSend.append('is_fresher', formData.is_fresher); // true or false
                formDataToSend.append('current_title', formData.current_title);
                formDataToSend.append('willing_to_relocate', formData.willing_to_relocate); // Send '1' for 'Yes'
                formDataToSend.append('linkedin_url', formData.linkedin_url);
                formDataToSend.append('github_url', formData.github_url);

                // Send the base64 profile photo
                if (formData.profile_photo) {
                    formDataToSend.append('profile_photo', formData.profile_photo);
                }

                // Append files if they exist
                if (formData.resume) {
                    formDataToSend.append('resume', formData.resume);
                }

                // Send the POST request for new profile
                const response = await api.post('/auth/jobseeker/profile', formDataToSend);
                toast.success('Profile created successfully!');
                setTimeout(() => {
                    window.location.reload(); // Reload page after 1 second
                }, 1000);
                console.log('Profile saved successfully:', response.data);
            } catch (error) {
                console.error('Error saving profile:', error);
            }
        } else {
            console.log('Form validation failed');
        }
    };

    const handleChangeProfile = async (e) => {
        e.preventDefault();
        // Handle Change Profile (PUT)
        if (validateForm()) {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('skills', formData.skills);
                formDataToSend.append('experience', formData.experience);
                formDataToSend.append('location', formData.location);
                formDataToSend.append('is_fresher', formData.is_fresher);  // Sending 'Fresher' or 'Experienced'
                formDataToSend.append('current_title', formData.current_title);
                formDataToSend.append('willing_to_relocate', formData.willing_to_relocate); // Send '1' for 'Yes'
                formDataToSend.append('linkedin_url', formData.linkedin_url);
                formDataToSend.append('github_url', formData.github_url);

                // Send the base64 profile photo
                if (formData.profile_photo) {
                    formDataToSend.append('profile_photo', formData.profile_photo);
                }

                // Append files if they exist
                if (formData.resume) {
                    formDataToSend.append('resume', formData.resume);
                }

                // ✅ Log to double-check before sending
                for (let pair of formDataToSend.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                // Send the PUT request for updating profile
                const response = await api.put('/auth/jobseeker/profile', formDataToSend);
                toast.success('Profile updated successfully!');
                setTimeout(() => {
                    window.location.reload(); // Reload the page after 2 seconds
                }, 1000);
                console.log('Profile updated successfully:', response.data);
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        } else {
            console.log('Form validation failed');
        }
    };

    return (
        <>
            <JobSeekerNavbar />
            <div className="JobSeekerProfile-wrapper">
                <div className="JobSeekerProfile-card">
                    <img
                        src={
                            formData.profile_photo
                                ? formData.profile_photo
                                : "https://www.w3schools.com/howto/img_avatar.png"
                        }
                        alt="Profile"
                        className="JobSeekerProfile-avatar"
                    />
                    <div className="JobSeekerProfile-basicInfo">
                        <h2>{formData.name || "Your Name"}</h2>
                        <p>
                            {formData.current_title ||
                                (formData.is_fresher
                                    ? formData.is_fresher === "Fresher"
                                        ? "Fresher"
                                        : "Experienced"
                                    : "Fresher/Experienced")}
                        </p>
                        <p>{formData.location || "Preferred Location"}</p>
                        <button
                            className="JobSeekerProfile-updateBtn"
                            onClick={() => setIsEditing(true)}
                        >
                            Update Profile
                        </button>
                    </div>
                </div>

                {isEditing ? (
                    <div className="JobSeekerProfile-container">
                        <h2 className="JobSeekerProfile-title">Edit Your Profile</h2>
                        <form className="JobSeekerProfile-form">
                            {/* --- Form Fields --- */}
                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="form-input"
                                    />
                                    {errors.name && (
                                        <div className="error-message">{errors.name}</div>
                                    )}
                                </div>

                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                        className="form-input"
                                    />
                                    {errors.phone && (
                                        <div className="error-message">{errors.phone}</div>
                                    )}
                                </div>
                            </div>

                            <div className="JobSeekerProfile-formGroup">
                                <textarea
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="Skills (e.g. JavaScript, React, Node.js)"
                                    className="form-input"
                                    rows="3"
                                />
                            </div>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="Experience (e.g. 0-2 years)"
                                        className="form-input"
                                    />
                                </div>

                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Preferred Job Location"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="JobSeekerProfile-formGroup">
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="is_fresher"
                                            value="Fresher"
                                            checked={formData.is_fresher === "Fresher"}
                                            onChange={handleChange}
                                        />
                                        Fresher
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            name="is_fresher"
                                            value="Experienced"
                                            checked={formData.is_fresher === "Experienced"}
                                            onChange={handleChange}
                                        />
                                        Experienced
                                    </label>
                                </div>
                            </div>

                            {formData.is_fresher === "Experienced" && (
                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="text"
                                        name="current_title"
                                        value={formData.current_title}
                                        onChange={handleChange}
                                        placeholder="Current Job Title"
                                        className="form-input"
                                    />
                                </div>
                            )}

                            <div className="JobSeekerProfile-formGroup">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="willing_to_relocate"
                                        checked={formData.willing_to_relocate === "Yes"}
                                        onChange={handleChange}
                                        className="checkbox-input"
                                    />
                                    Willing to Relocate
                                </label>
                            </div>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={formData.linkedin_url}
                                        onChange={handleChange}
                                        placeholder="LinkedIn URL"
                                        className="form-input"
                                    />
                                    {errors.linkedin_url && (
                                        <div className="error-message">{errors.linkedin_url}</div>
                                    )}
                                </div>

                                <div className="JobSeekerProfile-formGroup">
                                    <input
                                        type="url"
                                        name="github_url"
                                        value={formData.github_url}
                                        onChange={handleChange}
                                        placeholder="GitHub URL"
                                        className="form-input"
                                    />
                                    {errors.github_url && (
                                        <div className="error-message">{errors.github_url}</div>
                                    )}
                                </div>
                            </div>

                            <div className="JobSeekerProfile-row">
                                {/* Profile Photo Upload */}
                                <div className="JobSeekerProfile-formGroup">
                                    <label className="text-gray-700 font-semibold mb-2 block">Profile Photo (JPEG/PNG):</label>
                                    <div className="upload-box">
                                        <input
                                            type="file"
                                            name="profile_photo"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="file-input"
                                            id="profilePhotoInput"
                                        />
                                        <label htmlFor="profilePhotoInput" className="upload-label">
                                            <span className="upload-icon">📷</span>
                                            <span>Click to upload photo</span>
                                        </label>
                                    </div>
                                    {profilePhotoStatus && (
                                        <div className="file-status">{profilePhotoStatus}</div>
                                    )}
                                    {/* //for preview */}
                                    {profilePhotoPreview && (
                                        <div className="profile-photo-preview">
                                            <img src={profilePhotoPreview} alt="Profile Preview" />
                                        </div>
                                    )}
                                </div>

                                {/* Resume Upload */}
                                <div className="JobSeekerProfile-formGroup">
                                    <label className="text-gray-700 font-semibold mb-2 block">Resume (PDF):</label>
                                    <div className="upload-box">
                                        <input
                                            type="file"
                                            name="resume"
                                            accept=".pdf"
                                            onChange={handleChange}
                                            className="file-input"
                                            id="resumeInput"
                                        />
                                        <label htmlFor="resumeInput" className="upload-label">
                                            <span className="upload-icon">📄</span>
                                            <span>Click to upload resume</span>
                                        </label>
                                    </div>
                                    {resumeStatus && (
                                        <div className="file-status">{resumeStatus}</div>
                                    )}
                                </div>
                            </div>


                            {/* --- Buttons --- */}
                            <div className="JobSeekerProfile-buttonsContainer">
                                {!profileExists && (
                                    <button
                                        className="JobSeekerProfile-updateBtn"
                                        type="submit"
                                        onClick={handleSaveProfile}
                                    >
                                        Save Profile
                                    </button>
                                )}

                                {profileExists && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleChangeProfile}
                                            className="JobSeekerProfile-changePicBtn"
                                        >
                                            Update Profile
                                        </button>
                                        <button
                                            className="JobSeekerProfile-cancelBtn"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>

                        </form>
                    </div>
                ) : (
                    (formData.name || formData.skills || formData.phone) && (
                        <div className="JobSeekerProfile-detailsCard">
                            <h2 className="JobSeekerProfile-title">Profile Details</h2>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-field">
                                    <strong>Full Name:</strong> {formData.name}
                                </div>
                                <div className="JobSeekerProfile-field">
                                    <strong>Phone:</strong> {formData.phone}
                                </div>
                            </div>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-field">
                                    <strong>Skills:</strong> {formData.skills}
                                </div>
                                <div className="JobSeekerProfile-field">
                                    <strong>Experience:</strong> {formData.experience}
                                </div>
                            </div>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-field">
                                    <strong>Location:</strong> {formData.location}
                                </div>
                                {formData.is_fresher === "Experienced" && (
                                    <div className="JobSeekerProfile-field">
                                        <strong>Current Title:</strong> {formData.current_title}
                                    </div>
                                )}
                            </div>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-field">
                                    <strong>LinkedIn URL:</strong> {formData.linkedin_url}
                                </div>
                                <div className="JobSeekerProfile-field">
                                    <strong>GitHub URL:</strong> {formData.github_url}
                                </div>
                            </div>

                            <div className="JobSeekerProfile-row">
                                <div className="JobSeekerProfile-field">
                                    <strong>Willing to Relocate:</strong>{" "}
                                    {formData.willing_to_relocate === "Yes" ? "Yes" : "No"}
                                </div>
                                <div className="JobSeekerProfile-field">
                                    <strong>Fresher:</strong>{" "}
                                    {formData.is_fresher === "Fresher" ? "Yes" : "No"}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    );
}

export default JobSeekerProfile;
