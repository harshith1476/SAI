import React, { useRef, useEffect, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import './PostureDetection.css';

const PostureDetection = ({ sport, exercise, onPostureResult }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [currentPosture, setCurrentPosture] = useState('');
  const [postureAccuracy, setPostureAccuracy] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initializePose = async () => {
      try {
        setIsLoading(true);
        setError(null);

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

        pose.onResults(onResults);
        poseRef.current = pose;

        // Initialize audio context for beep sounds
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Pose initialization failed:', error);
        setError('Failed to initialize pose detection');
        setIsLoading(false);
      }
    };

    initializePose();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  // Initialize camera
  useEffect(() => {
    const initializeCamera = async () => {
      if (videoRef.current && poseRef.current) {
        try {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          await camera.start();
          cameraRef.current = camera;
        } catch (error) {
          console.error('Camera initialization failed:', error);
        }
      }
    };

    // Add delay to ensure DOM elements are ready
    const timer = setTimeout(initializeCamera, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Process pose detection results
  const onResults = (results) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement || !results.image) return;
    
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;
    
    // Set canvas dimensions if not already set
    if (canvasElement.width === 0 || canvasElement.height === 0) {
      canvasElement.width = 640;
      canvasElement.height = 480;
    }
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
      // Draw pose landmarks and connections
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 6
      });

      // Analyze posture based on sport and exercise
      const postureAnalysis = analyzePosture(results.poseLandmarks, sport, exercise);
      setCurrentPosture(postureAnalysis.posture);
      setPostureAccuracy(postureAnalysis.accuracy);
      setFeedback(postureAnalysis.feedback);

      // Play beep sound for incorrect posture
      if (postureAnalysis.accuracy < 70) {
        playBeepSound();
      }

      // Send results to parent component
      if (onPostureResult) {
        onPostureResult(postureAnalysis);
      }
    }

    canvasCtx.restore();
  };

  // Analyze posture based on sport and exercise
  const analyzePosture = (landmarks, sport, exercise) => {
    switch (sport.toLowerCase()) {
      case 'athletics':
        return analyzeAthleticsPosture(landmarks, exercise);
      case 'swimming':
        return analyzeSwimmingPosture(landmarks, exercise);
      case 'gymnastics':
        return analyzeGymnasticsPosture(landmarks, exercise);
      case 'weightlifting':
        return analyzeWeightliftingPosture(landmarks, exercise);
      case 'boxing':
        return analyzeBoxingPosture(landmarks, exercise);
      case 'wrestling':
        return analyzeWrestlingPosture(landmarks, exercise);
      case 'badminton':
        return analyzeBadmintonPosture(landmarks, exercise);
      case 'football':
        return analyzeFootballPosture(landmarks, exercise);
      default:
        return { posture: 'Unknown', accuracy: 0, feedback: 'Sport not recognized' };
    }
  };

  // Athletics posture analysis
  const analyzeAthleticsPosture = (landmarks, exercise) => {
    switch (exercise.toLowerCase()) {
      case 'sprint':
      case '100m sprint':
        return analyzeSprintPosture(landmarks);
      case 'long jump':
        return analyzeLongJumpPosture(landmarks);
      case 'high jump':
        return analyzeHighJumpPosture(landmarks);
      case 'shot put':
        return analyzeShotPutPosture(landmarks);
      default:
        return analyzeRunningPosture(landmarks);
    }
  };

  // Sprint posture analysis
  const analyzeSprintPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    // Calculate body lean angle
    const torsoAngle = calculateAngle(
      { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: 1 }
    );

    // Calculate knee lift
    const leftKneeHeight = Math.abs(leftKnee.y - leftHip.y);
    const rightKneeHeight = Math.abs(rightKnee.y - rightHip.y);
    const maxKneeHeight = Math.max(leftKneeHeight, rightKneeHeight);

    let accuracy = 100;
    let feedback = [];

    // Check forward lean (should be 15-20 degrees)
    if (torsoAngle < 70 || torsoAngle > 85) {
      accuracy -= 20;
      feedback.push('Adjust forward lean angle');
    }

    // Check knee lift
    if (maxKneeHeight < 0.1) {
      accuracy -= 25;
      feedback.push('Lift knees higher');
    }

    return {
      posture: 'Sprint Start',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Good sprint posture!'
    };
  };

  // Swimming posture analysis
  const analyzeSwimmingPosture = (landmarks, exercise) => {
    switch (exercise.toLowerCase()) {
      case 'freestyle':
      case '50m freestyle':
        return analyzeFreestylePosture(landmarks);
      case 'butterfly':
        return analyzeButterflyPosture(landmarks);
      case 'backstroke':
        return analyzeBackstrokePosture(landmarks);
      case 'breaststroke':
        return analyzeBreaststrokePosture(landmarks);
      default:
        return analyzeFreestylePosture(landmarks);
    }
  };

  // Freestyle swimming posture
  const analyzeFreestylePosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Calculate arm extension
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Calculate body rotation
    const shoulderRotation = Math.abs(leftShoulder.y - rightShoulder.y);

    let accuracy = 100;
    let feedback = [];

    // Check arm extension (should be around 160-180 degrees when extended)
    if (leftArmAngle < 140 && rightArmAngle < 140) {
      accuracy -= 30;
      feedback.push('Extend arms more during stroke');
    }

    // Check body rotation
    if (shoulderRotation < 0.05) {
      accuracy -= 20;
      feedback.push('Rotate body more during stroke');
    }

    return {
      posture: 'Freestyle Stroke',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Good freestyle technique!'
    };
  };

  // Gymnastics posture analysis
  const analyzeGymnasticsPosture = (landmarks, exercise) => {
    switch (exercise.toLowerCase()) {
      case 'flexibility test':
        return analyzeFlexibilityPosture(landmarks);
      case 'balance beam':
        return analyzeBalancePosture(landmarks);
      case 'floor exercise':
        return analyzeFloorExercisePosture(landmarks);
      default:
        return analyzeBalancePosture(landmarks);
    }
  };

  // Balance posture analysis
  const analyzeBalancePosture = (landmarks) => {
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const nose = landmarks[0];

    // Calculate center of gravity
    const centerX = (leftAnkle.x + rightAnkle.x) / 2;
    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const headX = nose.x;

    // Calculate balance alignment
    const balanceOffset = Math.abs(centerX - hipCenterX);
    const headAlignment = Math.abs(headX - hipCenterX);

    let accuracy = 100;
    let feedback = [];

    // Check balance alignment
    if (balanceOffset > 0.05) {
      accuracy -= 25;
      feedback.push('Center your weight over your feet');
    }

    // Check head alignment
    if (headAlignment > 0.08) {
      accuracy -= 20;
      feedback.push('Keep head aligned with body');
    }

    return {
      posture: 'Balance Pose',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Excellent balance!'
    };
  };

  // Weightlifting posture analysis
  const analyzeWeightliftingPosture = (landmarks, exercise) => {
    switch (exercise.toLowerCase()) {
      case 'deadlift':
        return analyzeDeadliftPosture(landmarks);
      case 'squat':
        return analyzeSquatPosture(landmarks);
      case 'bench press':
        return analyzeBenchPressPosture(landmarks);
      default:
        return analyzeSquatPosture(landmarks);
    }
  };

  // Squat posture analysis
  const analyzeSquatPosture = (landmarks) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Calculate squat depth
    const hipHeight = (leftHip.y + rightHip.y) / 2;
    const kneeHeight = (leftKnee.y + rightKnee.y) / 2;
    const squatDepth = kneeHeight - hipHeight;

    // Calculate knee alignment
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    let accuracy = 100;
    let feedback = [];

    // Check squat depth (hips should be below knees)
    if (squatDepth < 0.05) {
      accuracy -= 30;
      feedback.push('Squat deeper - hips below knees');
    }

    // Check knee alignment (should be around 90 degrees or less)
    if (leftKneeAngle > 100 || rightKneeAngle > 100) {
      accuracy -= 25;
      feedback.push('Bend knees more');
    }

    return {
      posture: 'Squat Position',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Perfect squat form!'
    };
  };

  // Boxing posture analysis
  const analyzeBoxingPosture = (landmarks, exercise) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate guard position
    const leftGuardHeight = leftWrist.y - leftShoulder.y;
    const rightGuardHeight = rightWrist.y - rightShoulder.y;

    // Calculate stance width
    const stanceWidth = Math.abs(leftHip.x - rightHip.x);

    let accuracy = 100;
    let feedback = [];

    // Check guard position (hands should be up)
    if (leftGuardHeight > 0.1 || rightGuardHeight > 0.1) {
      accuracy -= 30;
      feedback.push('Keep hands up in guard position');
    }

    // Check stance width
    if (stanceWidth < 0.15) {
      accuracy -= 20;
      feedback.push('Widen your stance');
    }

    return {
      posture: 'Boxing Stance',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong boxing stance!'
    };
  };

  // Wrestling posture analysis
  const analyzeWrestlingPosture = (landmarks, exercise) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    // Calculate wrestling stance
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipHeight = (leftHip.y + rightHip.y) / 2;
    const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
    const crouchLevel = shoulderHeight - hipHeight;

    let accuracy = 100;
    let feedback = [];

    // Check crouch level
    if (crouchLevel < 0.1) {
      accuracy -= 25;
      feedback.push('Lower your stance more');
    }

    // Check shoulder width
    if (shoulderWidth < 0.2) {
      accuracy -= 20;
      feedback.push('Widen your shoulders');
    }

    return {
      posture: 'Wrestling Stance',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Good wrestling position!'
    };
  };

  // Badminton posture analysis
  const analyzeBadmintonPosture = (landmarks, exercise) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Calculate racket arm position (assuming right-handed)
    const racketArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    // Calculate ready position
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);

    let accuracy = 100;
    let feedback = [];

    // Check racket position
    if (racketArmAngle < 90 || racketArmAngle > 150) {
      accuracy -= 25;
      feedback.push('Adjust racket arm position');
    }

    // Check shoulder level
    if (shoulderLevel > 0.05) {
      accuracy -= 20;
      feedback.push('Keep shoulders level');
    }

    return {
      posture: 'Badminton Ready',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Perfect ready position!'
    };
  };

  // Football posture analysis
  const analyzeFootballPosture = (landmarks, exercise) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Calculate athletic stance
    const kneeFlexion = calculateAngle(leftHip, leftKnee, leftAnkle);
    const stanceWidth = Math.abs(leftAnkle.x - rightAnkle.x);

    let accuracy = 100;
    let feedback = [];

    // Check knee flexion
    if (kneeFlexion > 150) {
      accuracy -= 25;
      feedback.push('Bend knees more for athletic stance');
    }

    // Check stance width
    if (stanceWidth < 0.2) {
      accuracy -= 20;
      feedback.push('Widen your stance');
    }

    return {
      posture: 'Football Stance',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Great athletic stance!'
    };
  };

  // Long jump posture analysis
  const analyzeLongJumpPosture = (landmarks) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Calculate takeoff leg angle
    const leftLegAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    let accuracy = 100;
    let feedback = [];

    // Check takeoff leg extension
    if (Math.max(leftLegAngle, rightLegAngle) < 140) {
      accuracy -= 25;
      feedback.push('Extend takeoff leg more');
    }

    return {
      posture: 'Long Jump Takeoff',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Good takeoff form!'
    };
  };

  // High jump posture analysis
  const analyzeHighJumpPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate body arch
    const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
    const hipHeight = (leftHip.y + rightHip.y) / 2;
    const bodyArch = shoulderHeight - hipHeight;

    let accuracy = 100;
    let feedback = [];

    // Check body arch for clearance
    if (bodyArch > -0.1) {
      accuracy -= 30;
      feedback.push('Arch back more for clearance');
    }

    return {
      posture: 'High Jump Clearance',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Excellent arch!'
    };
  };

  // Shot put posture analysis
  const analyzeShotPutPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];

    // Calculate throwing arm position
    const throwingArmAngle = calculateAngle(rightShoulder, rightElbow, landmarks[16]);
    const shoulderRotation = Math.abs(leftShoulder.y - rightShoulder.y);

    let accuracy = 100;
    let feedback = [];

    // Check throwing arm extension
    if (throwingArmAngle < 120) {
      accuracy -= 25;
      feedback.push('Extend throwing arm more');
    }

    // Check shoulder rotation
    if (shoulderRotation < 0.08) {
      accuracy -= 20;
      feedback.push('Rotate shoulders more');
    }

    return {
      posture: 'Shot Put Release',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Great throwing form!'
    };
  };

  // Running posture analysis
  const analyzeRunningPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate running posture
    const torsoAngle = calculateAngle(
      { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: 1 }
    );

    let accuracy = 100;
    let feedback = [];

    // Check upright posture
    if (torsoAngle < 80 || torsoAngle > 95) {
      accuracy -= 20;
      feedback.push('Maintain upright posture');
    }

    return {
      posture: 'Running Form',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Good running form!'
    };
  };

  // Butterfly stroke analysis
  const analyzeButterflyPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];

    // Calculate arm synchronization
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, landmarks[15]);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, landmarks[16]);
    const armSync = Math.abs(leftArmAngle - rightArmAngle);

    let accuracy = 100;
    let feedback = [];

    // Check arm synchronization
    if (armSync > 30) {
      accuracy -= 30;
      feedback.push('Synchronize both arms');
    }

    return {
      posture: 'Butterfly Stroke',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Perfect butterfly form!'
    };
  };

  // Backstroke analysis
  const analyzeBackstrokePosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const nose = landmarks[0];

    // Calculate body position
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const headPosition = nose.y - ((leftShoulder.y + rightShoulder.y) / 2);

    let accuracy = 100;
    let feedback = [];

    // Check body alignment
    if (shoulderLevel > 0.05) {
      accuracy -= 25;
      feedback.push('Keep shoulders level');
    }

    // Check head position
    if (headPosition > 0.1) {
      accuracy -= 20;
      feedback.push('Keep head back');
    }

    return {
      posture: 'Backstroke Form',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Excellent backstroke!'
    };
  };

  // Breaststroke analysis
  const analyzeBreaststrokePosture = (landmarks) => {
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Calculate arm pull width
    const armWidth = Math.abs(leftElbow.x - rightElbow.x);
    const wristWidth = Math.abs(leftWrist.x - rightWrist.x);

    let accuracy = 100;
    let feedback = [];

    // Check arm pull technique
    if (armWidth < 0.3) {
      accuracy -= 25;
      feedback.push('Widen arm pull');
    }

    return {
      posture: 'Breaststroke Pull',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Good breaststroke technique!'
    };
  };

  // Flexibility posture analysis
  const analyzeFlexibilityPosture = (landmarks) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    // Calculate flexibility range
    const hipFlexion = Math.abs(leftKnee.y - leftHip.y);
    
    let accuracy = 100;
    let feedback = [];

    // Check flexibility range
    if (hipFlexion < 0.2) {
      accuracy -= 30;
      feedback.push('Increase flexibility range');
    }

    return {
      posture: 'Flexibility Test',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Great flexibility!'
    };
  };

  // Floor exercise posture analysis
  const analyzeFloorExercisePosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate body alignment
    const shoulderAlignment = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipAlignment = Math.abs(leftHip.x - rightHip.x);

    let accuracy = 100;
    let feedback = [];

    // Check body alignment
    if (Math.abs(shoulderAlignment - hipAlignment) > 0.1) {
      accuracy -= 25;
      feedback.push('Align body properly');
    }

    return {
      posture: 'Floor Exercise',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Perfect alignment!'
    };
  };

  // Deadlift posture analysis
  const analyzeDeadliftPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    // Calculate back angle
    const backAngle = calculateAngle(
      { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: 1 }
    );

    let accuracy = 100;
    let feedback = [];

    // Check back straightness
    if (backAngle < 70 || backAngle > 90) {
      accuracy -= 30;
      feedback.push('Keep back straight');
    }

    return {
      posture: 'Deadlift Form',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Perfect deadlift form!'
    };
  };

  // Bench press posture analysis
  const analyzeBenchPressPosture = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];

    // Calculate arm position
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, landmarks[15]);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, landmarks[16]);

    let accuracy = 100;
    let feedback = [];

    // Check arm angles
    if (leftArmAngle < 80 || rightArmAngle < 80) {
      accuracy -= 25;
      feedback.push('Lower the weight more');
    }

    return {
      posture: 'Bench Press',
      accuracy: Math.max(0, accuracy),
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Great bench press form!'
    };
  };

  // Helper function to calculate angle between three points
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  // Play beep sound for incorrect posture
  const playBeepSound = () => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    }
  };

  // Start screen recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sport}_${exercise}_recording.webm`;
        a.click();
        setRecordedChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop screen recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="posture-detection">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Initializing pose detection...</p>
        </div>
      )}
      
      {error && (
        <div className="error-overlay">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      
      <div className="video-container">
        <video
          ref={videoRef}
          className="input-video"
          autoPlay
          muted
          playsInline
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="output-canvas"
          width="640"
          height="480"
        />
      </div>
      
      <div className="posture-info">
        <div className="current-posture">
          <h3>Current Posture: {currentPosture}</h3>
          <div className="accuracy-meter">
            <div 
              className="accuracy-bar"
              style={{ 
                width: `${postureAccuracy}%`,
                backgroundColor: postureAccuracy >= 70 ? '#10B981' : '#FF6B35'
              }}
            />
            <span className="accuracy-text">{postureAccuracy.toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="feedback">
          <p className={postureAccuracy >= 70 ? 'feedback-good' : 'feedback-warning'}>
            {feedback}
          </p>
        </div>
        
        <div className="controls">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-btn ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostureDetection;
