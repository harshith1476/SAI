import React, { useRef, useEffect, useState } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS, POSE_LANDMARKS } from '@mediapipe/pose';
import { Pose } from '@mediapipe/pose';
import './PostureAnalysis.css';

const PostureAnalysis = ({ videoRef, onPostureUpdate }) => {
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [postureScore, setPostureScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const animationRef = useRef();

  // Initialize the pose detector
  useEffect(() => {
    const loadDetector = async () => {
      try {
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });
        
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        pose.onResults((results) => {
          if (results.poseLandmarks) {
            analyzePosture(results.poseLandmarks);
            drawLandmarks(canvasRef.current, results.poseLandmarks, {
              color: '#FF0000',
              lineWidth: 2
            });
            drawConnectors(canvasRef.current, results.poseLandmarks, POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2
            });
          }
        });
        
        setDetector(pose);
        setIsModelLoading(false);
        detectPose(pose);
      } catch (error) {
        console.error('Error loading pose detector:', error);
        setIsModelLoading(false);
      }
    };

    loadDetector();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Analyze posture based on key points
  const analyzePosture = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return;

    // Get key points for posture analysis
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftEar = landmarks[POSE_LANDMARKS.LEFT_EAR];
    const rightEar = landmarks[POSE_LANDMARKS.RIGHT_EAR];

    if (!leftShoulder || !rightShoulder) return;

    // Calculate shoulder slope (simplified posture analysis)
    const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);
    let score = 100 - Math.min(shoulderSlope * 10, 100);
    
    // Provide feedback based on score
    let feedback = '';
    if (score > 80) {
      feedback = 'Great posture!';
    } else if (score > 60) {
      feedback = 'Good posture, but could be better';
    } else {
      feedback = 'Try to straighten your back and level your shoulders';
    }
    
    setPostureScore(score);
    setFeedback(feedback);
    
    // Call the parent component's callback if provided
    if (onPostureUpdate) {
      onPostureUpdate(score, feedback);
    }
  };

  // Detect pose in the video stream
  const detectPose = async (pose) => {
    if (!pose || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current.video;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      try {
        await pose.send({ image: video });
      } catch (error) {
        console.error('Error detecting pose:', error);
      }
      
      animationRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  if (isModelLoading) {
    return <div className="posture-loading">Loading posture analysis...</div>;
  }

  return (
    <div className="posture-analysis-container">
      <canvas
        ref={canvasRef}
        className="posture-canvas"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <div className="posture-feedback">
        <div className="posture-score">
          Posture Score: {Math.round(postureScore)}%
        </div>
        <div className="posture-message">{feedback}</div>
      </div>
    </div>
  );
};

export default PostureAnalysis;
