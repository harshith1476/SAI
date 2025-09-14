import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import PostureAnalysis from '../../components/PostureAnalysis/PostureAnalysis';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import './VideoAssessment.css';

const VideoAssessment = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [selectedTest, setSelectedTest] = useState(searchParams.get('test') || 'vertical_jump');
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [postureScore, setPostureScore] = useState(0);
  const [postureFeedback, setPostureFeedback] = useState('');
  const [showPostureAnalysis, setShowPostureAnalysis] = useState(true);
  const countdownRef = useRef(null);
  
  const startCountdown = useCallback((duration, onComplete) => {
    let timeLeft = duration;
    setCountdown(timeLeft);
    
    countdownRef.current = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownRef.current);
        if (onComplete) onComplete();
      }
    }, 1000);
  }, []);

  const fitnessTests = {
    vertical_jump: {
      name: 'Vertical Jump Test',
      description: 'Stand next to a wall and jump as high as possible. Mark your highest reach.',
      duration: 30,
      instructions: [
        'Stand with your side to the wall',
        'Reach up and mark your standing reach',
        'Jump as high as possible and touch the wall',
        'Perform 3 attempts with rest between'
      ],
      icon: 'fa-arrow-up'
    },
    shuttle_run: {
      name: 'Shuttle Run Test',
      description: 'Run back and forth between two points as quickly as possible.',
      duration: 60,
      instructions: [
        'Set up two cones 10 meters apart',
        'Start at one cone',
        'Run to the other cone and back',
        'Complete as many shuttles as possible'
      ],
      icon: 'fa-running'
    },
    sit_ups: {
      name: 'Sit-ups Test',
      description: 'Perform as many sit-ups as possible in 60 seconds.',
      duration: 60,
      instructions: [
        'Lie on your back with knees bent',
        'Place hands behind your head',
        'Sit up until elbows touch knees',
        'Return to starting position and repeat'
      ],
      icon: 'fa-user'
    },
    endurance_run: {
      name: 'Endurance Run Test',
      description: 'Run continuously for the specified distance or time.',
      duration: 300,
      instructions: [
        'Warm up with light jogging',
        'Run at a steady, sustainable pace',
        'Maintain consistent form throughout',
        'Cool down with walking after completion'
      ],
      icon: 'fa-road'
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const handleDataAvailable = useCallback(
    (event) => {
      if (event.data && event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = useCallback(() => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleStartCapture = useCallback(() => {
    setCapturing(true);
    const stream = webcamRef.current.video.srcObject;
    
    // Create a new MediaRecorder with the video stream
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000, // 2.5Mbps
    });
    
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start(100); // Request data every 100ms
    
    // Start posture analysis when recording starts
    setShowPostureAnalysis(true);
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);
  
  const startRecording = () => {
    handleStartCapture();

    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - Date.now()) / 1000);
      setRecordingTime(elapsed);
      
      if (elapsed >= currentTest.duration) {
        handleStopCaptureClick();
        clearInterval(timerInterval);
      }
    }, 1000);
  };

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setCapturing(false);
      setCountdown(0);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      setShowPostureAnalysis(false);
    }
  }, [mediaRecorderRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      setVideoBlob(blob);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = `${selectedTest}_${Date.now()}.webm`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }, [recordedChunks, selectedTest]);

  const handleUploadAndAnalyze = async () => {
    if (!recordedChunks.length) return;

    setUploading(true);
    
    try {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const formData = new FormData();
      formData.append('video', blob, `${selectedTest}_${Date.now()}.webm`);
      formData.append('testType', selectedTest);
      formData.append('athleteId', user.id);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/assessments/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAnalysisResult(response.data);
      
      // Navigate to results page after successful upload
      setTimeout(() => {
        navigate(`/dashboard?tab=assessments`);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePostureUpdate = (score, feedback) => {
    setPostureScore(score);
    setPostureFeedback(feedback);
  };

  if (!user) {
    return (
      <div className="video-assessment-page">
        <div className="container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>Please log in to access the video assessment feature.</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Webcam component is now directly in the JSX
  const currentTest = fitnessTests[selectedTest];

  return (
    <div className="video-assessment-page">
      <div className="container">
        <div className="assessment-header">
          <h1>Video Assessment</h1>
          <p>Record your fitness test performance for AI-powered analysis</p>
        </div>

        <div className="assessment-content">
          {/* Main content will be rendered here */}
          {/* Test Selection */}
          <div className="test-selection">
            <h3>Select Fitness Test</h3>
            <div className="test-buttons">
              {Object.entries(fitnessTests).map(([key, test]) => (
                <button
                  key={key}
                  className={`test-btn ${selectedTest === key ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTest(key);
                    setShowInstructions(true);
                  }}
                  disabled={capturing}
                >
                  <i className={`fas ${test.icon}`}></i>
                  {test.name}
                </button>
              ))}
            </div>
          </div>

          {/* Test Instructions */}
          <div className={`test-instructions ${showInstructions ? 'expanded' : 'collapsed'}`}>
            <div className="instructions-header">
              <h3>{currentTest.name}</h3>
              <button 
                className="toggle-instructions"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <i className={`fas ${showInstructions ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>
            </div>
            
            {showInstructions && (
              <div className="instructions-content">
                <p>{currentTest.description}</p>
                <div className="instructions-list">
                  <h4>Instructions:</h4>
                  <ol>
                    {currentTest.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
                <div className="test-duration">
                  <i className="fas fa-clock"></i>
                  <strong>Duration: {formatTime(currentTest.duration)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Video Recording Interface */}
          <div className="video-interface">
            <div className="webcam-container">
              <div className="video-wrapper">
                <Webcam
                  audio={true}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="webcam"
                  mirrored={true}
                />
                {showPostureAnalysis && (
                  <PostureAnalysis 
                    videoRef={webcamRef} 
                    onPostureUpdate={handlePostureUpdate}
                  />
                )}
              </div>
              {countdown > 0 && <div className="countdown">{countdown}</div>}
              
              {capturing && (
                <div className="posture-feedback-overlay">
                  <div className={`posture-score ${postureScore > 70 ? 'good' : postureScore > 40 ? 'fair' : 'poor'}`}>
                    Posture: {Math.round(postureScore)}%
                  </div>
                  {postureFeedback && (
                    <div className="posture-message">{postureFeedback}</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="video-controls">
              {!capturing && recordedChunks.length === 0 && (
                <button
                  className="btn btn-primary btn-large record-btn"
                  onClick={handleStartCaptureClick}
                >
                  <i className="fas fa-video"></i>
                  Start Recording
                </button>
              )}
              
              {capturing && (
                <div className="recording-overlay">
                  <div className="recording-indicator">
                    <div className="recording-dot"></div>
                    <span>REC {formatTime(recordingTime)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(recordingTime / currentTest.duration) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {capturing && (
                <button
                  className="btn btn-danger btn-large stop-btn"
                  onClick={handleStopCaptureClick}
                >
                  <i className="fas fa-stop"></i>
                  Stop Recording
                </button>
              )}

              {recordedChunks.length > 0 && !capturing && (
                <div className="recording-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={handleDownload}
                  >
                    <i className="fas fa-download"></i>
                    Download Video
                  </button>
                  
                  <button
                    className="btn btn-primary upload-btn"
                    onClick={handleUploadAndAnalyze}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt"></i>
                        Upload & Analyze
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setRecordedChunks([]);
                      setVideoBlob(null);
                    }}
                  >
                    <i className="fas fa-redo"></i>
                    Record Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="analysis-results">
              <div className="success-animation">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <h3>Analysis Complete!</h3>
              <div className="result-summary">
                <div className="result-item">
                  <span className="result-label">Confidence Score:</span>
                  <span className="result-value">
                    {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Performance Score:</span>
                  <span className="result-value">
                    {analysisResult.normalizedScore || 'Processing...'}
                  </span>
                </div>
              </div>
              <p>Your video has been submitted for detailed analysis. Check your dashboard for complete results.</p>
            </div>
          )}

          {/* Tips and Guidelines */}
          <div className="assessment-tips">
            <h3>Recording Tips</h3>
            <div className="tips-grid">
              <div className="tip-item">
                <div className="tip-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div>
                  <h4>Good Lighting</h4>
                  <p>Ensure adequate lighting for clear video quality</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div>
                  <h4>Stable Position</h4>
                  <p>Keep your device steady or use a tripod</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <div>
                  <h4>Full Body Visible</h4>
                  <p>Make sure your entire body is visible in the frame</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">
                  <i className="fas fa-volume-up"></i>
                </div>
                <div>
                  <h4>Clear Audio</h4>
                  <p>Record in a quiet environment for better analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAssessment;