import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostureDetection from '../../components/PostureDetection/PostureDetection';
import ExerciseVideo from '../../components/ExerciseVideo/ExerciseVideo';
import VideoGenerator from '../../components/VideoGenerator/VideoGenerator';
import './PostureAssessment.css';

const PostureAssessment = () => {
  const { sport, exercise } = useParams();
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState({
    sport: sport || 'athletics',
    exercise: exercise || 'sprint',
    duration: 0,
    scores: [],
    averageScore: 0,
    averageAccuracy: 0,
    feedback: [],
    isActive: false,
    startTime: null
  });
  const [showVideo, setShowVideo] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const handleVideoComplete = () => {
    setVideoCompleted(true);
  };

  const toggleVideoView = () => {
    setShowVideo(!showVideo);
  };

  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [timer, setTimer] = useState(0);

  // Sport exercise mappings
  const sportExercises = {
    athletics: [
      { id: 'sprint', name: '100m Sprint', description: 'Sprint starting position and form' },
      { id: 'long-jump', name: 'Long Jump', description: 'Long jump takeoff technique' },
      { id: 'high-jump', name: 'High Jump', description: 'High jump approach and takeoff' },
      { id: 'shot-put', name: 'Shot Put', description: 'Shot put throwing technique' }
    ],
    swimming: [
      { id: 'freestyle', name: '50m Freestyle', description: 'Freestyle stroke technique' },
      { id: 'butterfly', name: 'Butterfly Stroke', description: 'Butterfly swimming form' },
      { id: 'backstroke', name: 'Backstroke', description: 'Backstroke technique' },
      { id: 'breaststroke', name: 'Breaststroke', description: 'Breaststroke form' }
    ],
    gymnastics: [
      { id: 'flexibility', name: 'Flexibility Test', description: 'Body flexibility assessment' },
      { id: 'balance', name: 'Balance Beam', description: 'Balance and coordination' },
      { id: 'floor-exercise', name: 'Floor Exercise', description: 'Floor routine positions' },
      { id: 'strength', name: 'Strength Assessment', description: 'Core strength evaluation' }
    ],
    weightlifting: [
      { id: 'deadlift', name: 'Deadlift', description: 'Deadlift form and technique' },
      { id: 'squat', name: 'Squat', description: 'Squat depth and alignment' },
      { id: 'bench-press', name: 'Bench Press', description: 'Bench press positioning' },
      { id: 'clean-jerk', name: 'Clean & Jerk', description: 'Olympic lift technique' }
    ],
    boxing: [
      { id: 'stance', name: 'Boxing Stance', description: 'Proper boxing guard position' },
      { id: 'jab', name: 'Jab Technique', description: 'Jab punch form' },
      { id: 'hook', name: 'Hook Punch', description: 'Hook punch technique' },
      { id: 'footwork', name: 'Footwork', description: 'Boxing footwork patterns' }
    ],
    wrestling: [
      { id: 'stance', name: 'Wrestling Stance', description: 'Defensive wrestling position' },
      { id: 'takedown', name: 'Takedown Setup', description: 'Takedown preparation' },
      { id: 'sprawl', name: 'Sprawl Defense', description: 'Defensive sprawl technique' },
      { id: 'bridge', name: 'Bridge Position', description: 'Wrestling bridge form' }
    ],
    badminton: [
      { id: 'ready-position', name: 'Ready Position', description: 'Court ready stance' },
      { id: 'forehand', name: 'Forehand Stroke', description: 'Forehand technique' },
      { id: 'backhand', name: 'Backhand Stroke', description: 'Backhand form' },
      { id: 'serve', name: 'Service Technique', description: 'Badminton serve form' }
    ],
    football: [
      { id: 'stance', name: 'Athletic Stance', description: 'Basic football stance' },
      { id: 'sprint', name: 'Sprint Technique', description: 'Football sprint form' },
      { id: 'catching', name: 'Catching Position', description: 'Ball catching stance' },
      { id: 'kicking', name: 'Kicking Form', description: 'Football kicking technique' }
    ]
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isAssessmentActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAssessmentActive]);

  // Handle posture detection results
  const handlePostureResult = (result) => {
    if (isAssessmentActive) {
      setAssessmentData(prev => ({
        ...prev,
        scores: [...prev.scores, result.accuracy],
        feedback: [...prev.feedback, result.feedback],
        averageAccuracy: calculateAverage([...prev.scores, result.accuracy])
      }));
    }
  };

  // Calculate average accuracy
  const calculateAverage = (scores) => {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Start assessment
  const startAssessment = () => {
    setIsAssessmentActive(true);
    setTimer(0);
    setAssessmentData(prev => ({
      ...prev,
      scores: [],
      feedback: [],
      averageAccuracy: 0
    }));
  };

  // Stop assessment
  const stopAssessment = () => {
    setIsAssessmentActive(false);
    // Save assessment results (you can implement API call here)
    console.log('Assessment completed:', assessmentData);
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current exercise info
  const getCurrentExercise = () => {
    const exercises = sportExercises[sport] || [];
    return exercises.find(ex => ex.id === exercise) || exercises[0];
  };

  const currentExercise = getCurrentExercise();

  return (
    <div className={`posture-assessment ${sport}`}>
      <div className="assessment-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/sports-category')}
        >
          ← Back to Sports
        </button>
        
        <div className="assessment-header">
          <div className="header-content">
            <h1>{currentExercise?.name || 'Exercise Assessment'}</h1>
            <p>{currentExercise?.description || 'Follow the instructions to complete your assessment'}</p>
          </div>
          
          <div className="header-controls">
            <div className="timer-display">
              <i className="fas fa-clock"></i>
              <span>{formatTime(timer)}</span>
            </div>
            
            <button 
              className="video-toggle-btn"
              onClick={toggleVideoView}
            >
              <i className={`fas ${showVideo ? 'fa-video-slash' : 'fa-video'}`}></i>
              {showVideo ? 'Hide Tutorial' : 'Show Tutorial'}
            </button>
            
            <button 
              className="ai-generator-btn"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
            >
              <i className="fas fa-robot"></i>
              {showAIGenerator ? 'Hide AI Generator' : 'Generate AI Video'}
            </button>
            
            <button 
              className={`assessment-btn ${isAssessmentActive ? 'stop' : 'start'}`}
              onClick={isAssessmentActive ? stopAssessment : startAssessment}
            >
              {isAssessmentActive ? (
                <>
                  <i className="fas fa-stop"></i>
                  Stop Assessment
                </>
              ) : (
                <>
                  <i className="fas fa-play"></i>
                  Start Assessment
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="assessment-content">
        {showVideo && (
          <div className="video-tutorial-section">
            <ExerciseVideo 
              sport={sport} 
              exercise={exercise}
              onVideoComplete={handleVideoComplete}
            />
          </div>
        )}
        
        {showAIGenerator && (
          <div className="ai-generator-section">
            <VideoGenerator 
              sport={sport} 
              exercise={exercise}
              onGenerationComplete={(videoData) => {
                console.log('AI Video Generated:', videoData);
              }}
            />
          </div>
        )}
        
        <div className="posture-detection-container">
          <PostureDetection
            sport={sport}
            exercise={exercise}
            onPostureResult={handlePostureResult}
          />
        </div>

        <div className="assessment-sidebar">
          <div className="score-panel">
            <h3>Real-time Score</h3>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-value">
                  {(assessmentData.averageAccuracy || 0).toFixed(0)}%
                </span>
              </div>
              <div className="score-label">
                Average Accuracy
              </div>
            </div>
          </div>

          <div className="exercise-instructions">
            <h3>Exercise Instructions</h3>
            <div className="instructions-content">
              {getExerciseInstructions(sport, exercise)}
            </div>
          </div>

          <div className="assessment-stats">
            <h3>Session Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{formatTime(timer)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Samples</span>
                <span className="stat-value">{assessmentData.scores.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Score</span>
                <span className="stat-value">
                  {assessmentData.scores.length > 0 ? Math.max(...assessmentData.scores).toFixed(0) + '%' : '0%'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className={`stat-value ${isAssessmentActive ? 'active' : 'inactive'}`}>
                  {isAssessmentActive ? 'Recording' : 'Stopped'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {assessmentData.scores.length > 0 && !isAssessmentActive && (
        <div className="assessment-results">
          <h3>Assessment Complete!</h3>
          <div className="results-summary">
            <div className="result-item">
              <span className="result-label">Final Score:</span>
              <span className="result-value">{(assessmentData.averageAccuracy || 0).toFixed(1)}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Performance:</span>
              <span className={`result-value ${getPerformanceLevel(assessmentData.averageAccuracy)}`}>
                {getPerformanceText(assessmentData.averageAccuracy)}
              </span>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={startAssessment}
            >
              Try Again
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Get exercise-specific instructions
const getExerciseInstructions = (sport, exercise) => {
  const instructions = {
    athletics: {
      sprint: [
        "1. Position feet shoulder-width apart",
        "2. Lean forward slightly (15-20 degrees)",
        "3. Keep arms at 90-degree angles",
        "4. Lift knees high during movement",
        "5. Maintain straight back posture"
      ],
      'long-jump': [
        "1. Approach with controlled speed",
        "2. Plant takeoff foot firmly",
        "3. Drive opposite knee upward",
        "4. Extend arms forward and up",
        "5. Maintain forward momentum"
      ]
    },
    swimming: {
      freestyle: [
        "1. Keep body horizontal in water",
        "2. Rotate shoulders with each stroke",
        "3. Extend arms fully forward",
        "4. Keep head in neutral position",
        "5. Maintain steady kick rhythm"
      ]
    },
    gymnastics: {
      balance: [
        "1. Keep feet parallel and stable",
        "2. Engage core muscles",
        "3. Maintain straight spine",
        "4. Keep head aligned with body",
        "5. Focus eyes on fixed point"
      ]
    },
    weightlifting: {
      squat: [
        "1. Feet shoulder-width apart",
        "2. Keep chest up and back straight",
        "3. Lower hips below knee level",
        "4. Keep knees aligned with toes",
        "5. Drive through heels to stand"
      ]
    },
    boxing: {
      stance: [
        "1. Keep hands up in guard position",
        "2. Feet shoulder-width apart",
        "3. Slight bend in knees",
        "4. Keep chin tucked",
        "5. Stay light on feet"
      ]
    },
    wrestling: {
      stance: [
        "1. Lower center of gravity",
        "2. Keep shoulders over knees",
        "3. Hands ready for contact",
        "4. Stay balanced on balls of feet",
        "5. Keep head up and alert"
      ]
    },
    badminton: {
      'ready-position': [
        "1. Feet shoulder-width apart",
        "2. Slight bend in knees",
        "3. Racket up and ready",
        "4. Weight on balls of feet",
        "5. Stay alert and balanced"
      ]
    },
    football: {
      stance: [
        "1. Athletic position with bent knees",
        "2. Feet wider than shoulders",
        "3. Keep chest up",
        "4. Arms ready for movement",
        "5. Stay balanced and ready"
      ]
    }
  };

  const sportInstructions = instructions[sport] || {};
  const exerciseInstructions = sportInstructions[exercise] || [
    "1. Maintain proper form",
    "2. Keep body aligned",
    "3. Focus on technique",
    "4. Stay balanced",
    "5. Follow sport-specific guidelines"
  ];

  return (
    <ul>
      {exerciseInstructions.map((instruction, index) => (
        <li key={index}>{instruction}</li>
      ))}
    </ul>
  );
};

// Get performance level class
const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) return 'excellent';
  if (accuracy >= 80) return 'good';
  if (accuracy >= 70) return 'fair';
  return 'needs-improvement';
};

// Get performance text
const getPerformanceText = (accuracy) => {
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= 80) return 'Good';
  if (accuracy >= 70) return 'Fair';
  return 'Needs Improvement';
};

export default PostureAssessment;
