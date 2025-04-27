import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import EmployerNavbar from '../Navbar/EmployerNavbar';
import { toast } from 'react-toastify';

import './ViewApplication.css';

const BASE_URL = 'http://localhost:5000';

const ViewApplications = () => {
    const [applications, setApplications] = useState([]);
    const [visibleResume, setVisibleResume] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const decoded = jwtDecode(token);
                const userId = decoded.userId;

                const res = await api.get(`/auth/employer-applications/${userId}`);
                setApplications(res.data);
                console.log(res.data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };

        fetchApplications();
    }, []);

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await api.put(
                `/auth/application-status/${applicationId}`,
                { status: newStatus }
            );

            setApplications((prev) =>
                prev.map((app) =>
                    app.application_id === applicationId
                        ? { ...app, application_status: newStatus }
                        : app
                )
            );
            toast.success(`Application ${newStatus.toLowerCase()} successfully!`);
        } catch (error) {
            toast.error('Failed to update status');
            console.error('Error updating status:', error);
        }
    };

    const toggleResume = (applicationId) => {
        setVisibleResume((prev) => (prev === applicationId ? null : applicationId));
    };

    return (
        <>
            <EmployerNavbar />
            <div className="ViewApplications-container">
                <h2>Applications Received</h2>

                {applications.length === 0 ? (
                    <p className="no-applications">No applications yet.</p>
                ) : (
                    applications.map((app) => (
                        <div key={app.application_id} className="application-card">
                            <div className="application-details">
                                <div className="application-left">
                                    <img
                                        src={app.profile_photo || '/default-avatar.png'}
                                        alt="Profile"
                                        className="applicant-avatar"
                                    />
                                    <h4 className="applicant-name">{app.applicant_name}</h4>
                                    <p><strong>Email:</strong> {app.email}</p>
                                    <p><strong>Phone:</strong> {app.phone || 'N/A'}</p>
                                    <p><strong>Skills:</strong> {app.skills}</p>
                                    {app.linkedin_url && (
                                        <p>
                                            <a href={app.linkedin_url} target="_blank" rel="noreferrer">
                                                🔗 LinkedIn
                                            </a>
                                        </p>
                                    )}
                                    {app.github_url && (
                                        <p>
                                            <a href={app.github_url} target="_blank" rel="noreferrer">
                                                💻 GitHub
                                            </a>
                                        </p>
                                    )}
                                    <div className="status-section">
                                        <span
                                            className={`status-tag ${app.application_status.toLowerCase()}`}
                                        >
                                            {app.application_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="application-right">
                                    <h3>{app.job_title}</h3>
                                    <div className="job-details-grid">
                                        <div><strong>Experience Required:</strong> {app.experience_required || 'N/A'} years</div>
                                        <div><strong>Salary:</strong> {app.salary || 'N/A'}</div>
                                        <div><strong>Location:</strong> {app.location || 'N/A'}</div>
                                        <div><strong>Job Type:</strong> {app.job_type || 'N/A'}</div>
                                        <div><strong>Technologies:</strong> {app.skills_required || 'N/A'}</div>
                                        <div className="description"><strong>Description:</strong> {app.job_description}</div>
                                    </div>

                                    {app.resume_link && (
                                        <>
                                            <button
                                                className="resume-btn"
                                                onClick={() => toggleResume(app.application_id)}
                                            >
                                                📄 {visibleResume === app.application_id ? 'Hide Resume' : 'Preview Resume'}
                                            </button>
                                            <a
                                                href={`${BASE_URL}/uploads/${app.resume_link}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="resume-link"
                                            >
                                                🔗 View/Download Resume
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {visibleResume === app.application_id && app.resume_link && (
                                <div className="resume-preview">
                                    {console.log("Preview URL:", BASE_URL + '/uploads/' + app.resume_link)}  {/* Debugging line */}
                                    <iframe
                                        src={`${BASE_URL}/uploads/${app.resume_link}`}
                                        width="100%"
                                        height="500px"
                                        frameBorder="0"
                                        title="Resume Preview"
                                    />
                                </div>
                            )}

                            <div className="action-buttons">
                                <button
                                    className="approve-btn"
                                    onClick={() => handleStatusUpdate(app.application_id, 'Accepted')}
                                    disabled={app.application_status !== 'Pending'}
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={() => handleStatusUpdate(app.application_id, 'Rejected')}
                                    disabled={app.application_status !== 'Pending'}
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default ViewApplications;
