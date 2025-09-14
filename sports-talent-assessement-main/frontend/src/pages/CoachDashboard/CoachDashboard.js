import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CoachDashboard.css';

// Mock data for athlete videos
const mockVideos = [
  {
    id: 1,
    athleteName: 'John Doe',
    sport: 'Basketball',
    status: 'pending',
    videoUrl: 'https://example.com/video1.mp4',
    thumbnail: 'https://via.placeholder.com/300x200',
    duration: '2:45',
    submittedAt: new Date().toISOString(),
  },
  {
    id: 2,
    athleteName: 'Jane Smith',
    sport: 'Swimming',
    status: 'reviewed',
    feedback: 'Great form! Work on your turns.',
    rating: 4,
    videoUrl: 'https://example.com/video2.mp4',
    thumbnail: 'https://via.placeholder.com/300x200',
    duration: '1:30',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedAt: new Date().toISOString(),
  },
];

const CoachDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingVideos, setPendingVideos] = useState([]);
  const [reviewedVideos, setReviewedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('videos'); // 'videos' or 'profile'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'coach') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }
    
    // Load mock data for now
    const pending = mockVideos.filter(video => video.status === 'pending');
    const reviewed = mockVideos.filter(video => video.status === 'reviewed');
    setPendingVideos(pending);
    setReviewedVideos(reviewed);
    if (pending.length > 0) {
      setSelectedVideo(pending[0]);
    }
    
    // Fetch videos from the API
  fetchVideos();
  }, [user, navigate]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // First, fetch pending assessments that need review
      const pendingResponse = await axios.get('/api/assessments/pending-review', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Then, fetch already reviewed assessments
      const reviewedResponse = await axios.get('/api/assessments/reviewed', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Transform the pending assessments data
      const pending = pendingResponse.data.map(assessment => ({
        id: assessment._id,
        athleteName: assessment.athlete?.name || 'Unknown Athlete',
        sport: assessment.sport || assessment.assessmentType || 'General',
        status: 'pending',
        videoUrl: assessment.videoUrl || '',
        thumbnail: assessment.thumbnail || 'https://via.placeholder.com/300x200',
        duration: assessment.duration || '0:00',
        submittedAt: assessment.createdAt || new Date().toISOString(),
        athleteId: assessment.athlete?._id,
        assessmentType: assessment.assessmentType,
        testDate: assessment.testDate
      }));

      // Transform the reviewed assessments data
      const reviewed = reviewedResponse.data.map(assessment => ({
        id: assessment._id,
        athleteName: assessment.athlete?.name || 'Unknown Athlete',
        sport: assessment.sport || assessment.assessmentType || 'General',
        status: 'reviewed',
        videoUrl: assessment.videoUrl || '',
        thumbnail: assessment.thumbnail || 'https://via.placeholder.com/300x200',
        duration: assessment.duration || '0:00',
        submittedAt: assessment.createdAt || new Date().toISOString(),
        reviewedAt: assessment.updatedAt || new Date().toISOString(),
        feedback: assessment.feedback || '',
        rating: assessment.rating || 0,
        athleteId: assessment.athlete?._id,
        assessmentType: assessment.assessmentType,
        testDate: assessment.testDate
      }));

      setPendingVideos(pending);
      setReviewedVideos(reviewed);
      
      // Auto-select first pending video if none selected
      if (pending.length > 0 && !selectedVideo) {
        handleVideoSelect(pending[0]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos. Please try again.');
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setFeedback(video.feedback || '');
    setRating(video.rating || 5);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedVideo || !feedback.trim()) {
      toast.error('Please provide feedback before submitting');
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit feedback to the backend
      const response = await axios.put(
        `/api/assessments/${selectedVideo.id}/feedback`,
        { 
          feedback, 
          rating: parseInt(rating), 
          status: 'reviewed' 
        },
        { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      toast.success('Feedback submitted successfully!');
      
      // Update local state
      const updatedVideo = {
        ...selectedVideo,
        feedback,
        rating: parseInt(rating),
        status: 'reviewed',
        reviewedAt: new Date().toISOString()
      };
      
      // Update the video lists
      const updatedPending = pendingVideos.filter(v => v.id !== selectedVideo.id);
      const updatedReviewed = [updatedVideo, ...reviewedVideos];
      
      setPendingVideos(updatedPending);
      setReviewedVideos(updatedReviewed);
      
      // Select the next pending video if available
      if (updatedPending.length > 0) {
        setSelectedVideo(updatedPending[0]);
      } else {
        setSelectedVideo(updatedVideo);
      }
      
      // Reset form
      setFeedback('');
      setRating(5);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderVideoList = (videos) => (
    <div className="video-list">
      {videos.length === 0 ? (
        <p>No videos found</p>
      ) : (
        videos.map((video) => (
          <div 
            key={video.id} 
            className={`video-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
            onClick={() => handleVideoSelect(video)}
          >
            <div className="video-thumbnail">
              <img src={video.thumbnail} alt={video.sport} />
              <span className="video-duration">{video.duration}</span>
            </div>
            <div className="video-info">
              <h4>{video.athleteName}</h4>
              <p>{video.sport} - {video.testName}</p>
              <span className={`status ${video.status}`}>{video.status}</span>
              {video.rating && (
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < video.rating ? 'filled' : ''}>★</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="coach-dashboard">
      <div className="dashboard-header">
        <h1>Coach Dashboard</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Pending Review ({pendingVideos.length})
          </button>
          <button 
            className={activeTab === 'reviewed' ? 'active' : ''}
            onClick={() => setActiveTab('reviewed')}
          >
            Reviewed ({reviewedVideos.length})
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="video-container">
          {loading ? (
            <div className="loading">Loading videos...</div>
          ) : (
            <>
              {activeTab === 'pending' ? (
                <>
                  <h2>Pending Review</h2>
                  {renderVideoList(pendingVideos)}
                </>
              ) : (
                <>
                  <h2>Reviewed Videos</h2>
                  {renderVideoList(reviewedVideos)}
                </>
              )}
            </>
          )}
        </div>

        <div className="feedback-panel">
          {selectedVideo ? (
            <div className="feedback-form">
              <h3>Review Video</h3>
              <div className="video-preview">
                <video controls src={selectedVideo.videoUrl} />
                <h4>{selectedVideo.athleteName} - {selectedVideo.sport}</h4>
                <p>{selectedVideo.testName}</p>
              </div>
              
              <form onSubmit={handleSubmitFeedback}>
                <div className="form-group">
                  <label>Rating:</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <span 
                        key={value}
                        className={value <= rating ? 'selected' : ''}
                        onClick={() => setRating(value)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Feedback:</label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide detailed feedback..."
                    rows="6"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setSelectedVideo(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!feedback.trim()}
                  >
                    {selectedVideo.status === 'reviewed' ? 'Update Feedback' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="no-video-selected">
              <i className="fas fa-video"></i>
              <p>Select a video to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
