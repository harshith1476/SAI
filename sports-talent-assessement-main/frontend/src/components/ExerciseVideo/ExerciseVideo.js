import React, { useState, useRef, useEffect } from 'react';
import { getVideoAsset } from '../../utils/videoAssets';
import './ExerciseVideo.css';

const ExerciseVideo = ({ sport, exercise, onVideoComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [videoAsset, setVideoAsset] = useState(null);
  const videoRef = useRef(null);

  // Load video asset on component mount
  useEffect(() => {
    const asset = getVideoAsset(sport, exercise);
    setVideoAsset(asset);
  }, [sport, exercise]);

  // Exercise video data with AI-generated content descriptions
  const exerciseVideos = {
    athletics: {
      'sprint': {
        title: '100m Sprint Technique',
        videoUrl: '/videos/athletics/sprint-technique.mp4',
        thumbnail: '/images/athletics/sprint-thumb.jpg',
        duration: '2:30',
        keyPoints: [
          'Proper starting position with hands behind the line',
          'Forward lean angle of 15-20 degrees',
          'High knee lift during acceleration',
          'Arm swing at 90-degree angles',
          'Maintain straight back posture'
        ],
        aiTips: [
          'AI detects your forward lean - aim for 15-20 degrees',
          'Knee height sensor will alert if lift is insufficient',
          'Arm angle tracker ensures 90-degree positioning',
          'Posture analysis prevents back rounding'
        ]
      },
      'long-jump': {
        title: 'Long Jump Takeoff Technique',
        videoUrl: '/videos/athletics/long-jump-technique.mp4',
        thumbnail: '/images/athletics/long-jump-thumb.jpg',
        duration: '3:15',
        keyPoints: [
          'Controlled approach run speed',
          'Plant takeoff foot firmly at board',
          'Drive opposite knee upward',
          'Extend arms forward and up',
          'Maintain forward momentum'
        ],
        aiTips: [
          'AI tracks takeoff leg extension angle',
          'Knee drive height measurement',
          'Arm positioning analysis',
          'Momentum vector calculation'
        ]
      },
      'high-jump': {
        title: 'High Jump Clearance Form',
        videoUrl: '/videos/athletics/high-jump-technique.mp4',
        thumbnail: '/images/athletics/high-jump-thumb.jpg',
        duration: '2:45',
        keyPoints: [
          'Curved approach run',
          'Plant outside foot for takeoff',
          'Arch back over the bar',
          'Lead with shoulders',
          'Kick legs up and over'
        ],
        aiTips: [
          'AI monitors body arch angle',
          'Shoulder lead detection',
          'Leg clearance tracking',
          'Bar clearance analysis'
        ]
      },
      'shot-put': {
        title: 'Shot Put Release Technique',
        videoUrl: '/videos/athletics/shot-put-technique.mp4',
        thumbnail: '/images/athletics/shot-put-thumb.jpg',
        duration: '3:00',
        keyPoints: [
          'Glide or spin technique setup',
          'Power position with low stance',
          'Extend throwing arm fully',
          'Rotate shoulders and hips',
          'Release at 40-degree angle'
        ],
        aiTips: [
          'AI tracks throwing arm extension',
          'Shoulder rotation measurement',
          'Release angle calculation',
          'Power position validation'
        ]
      }
    },
    swimming: {
      'freestyle': {
        title: 'Freestyle Stroke Technique',
        videoUrl: '/videos/swimming/freestyle-technique.mp4',
        thumbnail: '/images/swimming/freestyle-thumb.jpg',
        duration: '4:00',
        keyPoints: [
          'Body horizontal in water',
          'Rotate shoulders with each stroke',
          'Extend arms fully forward',
          'Keep head in neutral position',
          'Maintain steady kick rhythm'
        ],
        aiTips: [
          'AI analyzes arm extension angles',
          'Shoulder rotation tracking',
          'Head position monitoring',
          'Stroke symmetry analysis'
        ]
      },
      'butterfly': {
        title: 'Butterfly Stroke Form',
        videoUrl: '/videos/swimming/butterfly-technique.mp4',
        thumbnail: '/images/swimming/butterfly-thumb.jpg',
        duration: '3:30',
        keyPoints: [
          'Simultaneous arm movement',
          'Dolphin kick timing',
          'Body undulation wave',
          'Breathing technique',
          'Entry and catch phase'
        ],
        aiTips: [
          'AI ensures arm synchronization',
          'Kick timing analysis',
          'Body wave pattern tracking',
          'Breathing rhythm monitoring'
        ]
      }
    },
    gymnastics: {
      'balance': {
        title: 'Balance Beam Technique',
        videoUrl: '/videos/gymnastics/balance-technique.mp4',
        thumbnail: '/images/gymnastics/balance-thumb.jpg',
        duration: '2:20',
        keyPoints: [
          'Feet parallel and stable',
          'Engage core muscles',
          'Maintain straight spine',
          'Keep head aligned with body',
          'Focus eyes on fixed point'
        ],
        aiTips: [
          'AI monitors center of gravity',
          'Spine alignment tracking',
          'Head position analysis',
          'Balance stability scoring'
        ]
      },
      'flexibility': {
        title: 'Flexibility Assessment',
        videoUrl: '/videos/gymnastics/flexibility-technique.mp4',
        thumbnail: '/images/gymnastics/flexibility-thumb.jpg',
        duration: '3:45',
        keyPoints: [
          'Gradual range of motion',
          'Proper warm-up sequence',
          'Joint mobility testing',
          'Muscle flexibility assessment',
          'Safe stretching techniques'
        ],
        aiTips: [
          'AI measures joint angles',
          'Range of motion tracking',
          'Flexibility scoring system',
          'Safety boundary monitoring'
        ]
      }
    },
    weightlifting: {
      'squat': {
        title: 'Perfect Squat Form',
        videoUrl: '/videos/weightlifting/squat-technique.mp4',
        thumbnail: '/images/weightlifting/squat-thumb.jpg',
        duration: '3:20',
        keyPoints: [
          'Feet shoulder-width apart',
          'Keep chest up and back straight',
          'Lower hips below knee level',
          'Keep knees aligned with toes',
          'Drive through heels to stand'
        ],
        aiTips: [
          'AI tracks squat depth accuracy',
          'Knee alignment monitoring',
          'Back posture analysis',
          'Weight distribution tracking'
        ]
      },
      'deadlift': {
        title: 'Deadlift Technique',
        videoUrl: '/videos/weightlifting/deadlift-technique.mp4',
        thumbnail: '/images/weightlifting/deadlift-thumb.jpg',
        duration: '3:50',
        keyPoints: [
          'Bar close to shins',
          'Straight back throughout lift',
          'Hip hinge movement pattern',
          'Engage lats and core',
          'Full hip extension at top'
        ],
        aiTips: [
          'AI monitors back straightness',
          'Hip hinge angle tracking',
          'Bar path analysis',
          'Lift completion validation'
        ]
      }
    },
    boxing: {
      'stance': {
        title: 'Boxing Stance Fundamentals',
        videoUrl: '/videos/boxing/stance-technique.mp4',
        thumbnail: '/images/boxing/stance-thumb.jpg',
        duration: '2:15',
        keyPoints: [
          'Hands up in guard position',
          'Feet shoulder-width apart',
          'Slight bend in knees',
          'Keep chin tucked',
          'Stay light on feet'
        ],
        aiTips: [
          'AI monitors guard height',
          'Stance width measurement',
          'Knee bend angle tracking',
          'Chin position analysis'
        ]
      }
    },
    wrestling: {
      'stance': {
        title: 'Wrestling Defensive Stance',
        videoUrl: '/videos/wrestling/stance-technique.mp4',
        thumbnail: '/images/wrestling/stance-thumb.jpg',
        duration: '2:40',
        keyPoints: [
          'Lower center of gravity',
          'Shoulders over knees',
          'Hands ready for contact',
          'Balanced on balls of feet',
          'Keep head up and alert'
        ],
        aiTips: [
          'AI tracks center of gravity',
          'Shoulder position monitoring',
          'Hand readiness analysis',
          'Balance distribution tracking'
        ]
      }
    },
    badminton: {
      'ready-position': {
        title: 'Badminton Ready Position',
        videoUrl: '/videos/badminton/ready-technique.mp4',
        thumbnail: '/images/badminton/ready-thumb.jpg',
        duration: '2:30',
        keyPoints: [
          'Feet shoulder-width apart',
          'Slight bend in knees',
          'Racket up and ready',
          'Weight on balls of feet',
          'Stay alert and balanced'
        ],
        aiTips: [
          'AI monitors ready position',
          'Racket angle tracking',
          'Weight distribution analysis',
          'Reaction readiness scoring'
        ]
      }
    },
    football: {
      'stance': {
        title: 'Football Athletic Stance',
        videoUrl: '/videos/football/stance-technique.mp4',
        thumbnail: '/images/football/stance-thumb.jpg',
        duration: '2:25',
        keyPoints: [
          'Athletic position with bent knees',
          'Feet wider than shoulders',
          'Keep chest up',
          'Arms ready for movement',
          'Stay balanced and ready'
        ],
        aiTips: [
          'AI tracks athletic position',
          'Knee bend measurement',
          'Chest position analysis',
          'Movement readiness scoring'
        ]
      }
    }
  };

  const currentVideo = exerciseVideos[sport]?.[exercise];

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('ended', () => {
        setIsPlaying(false);
        if (onVideoComplete) onVideoComplete();
      });

      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [onVideoComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) {
    return (
      <div className="exercise-video-placeholder">
        <div className="placeholder-content">
          <i className="fas fa-video"></i>
          <h3>Video Coming Soon</h3>
          <p>Exercise demonstration video for {exercise} will be available shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-video">
      <div className="video-header">
        <h3>{currentVideo.title}</h3>
        <span className="video-duration">{currentVideo.duration}</span>
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          className="exercise-video-player"
          poster={videoAsset?.thumbnail || currentVideo.thumbnail}
          preload="metadata"
          onError={() => console.log('Video loading error')}
        >
          <source src={videoAsset?.videoUrl || currentVideo.videoUrl} type="video/mp4" />
          {videoAsset?.fallbackVideo && (
            <source src={videoAsset.fallbackVideo} type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </video>

        <div className="video-overlay">
          <button className="play-button" onClick={togglePlay}>
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
        </div>

        <div className="video-controls">
          <button className="control-btn" onClick={togglePlay}>
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          
          <div className="progress-container" onClick={handleSeek}>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {showInstructions && (
        <div className="video-instructions">
          <div className="instructions-header">
            <h4>Key Technique Points</h4>
            <button 
              className="toggle-btn"
              onClick={() => setShowInstructions(false)}
            >
              <i className="fas fa-chevron-up"></i>
            </button>
          </div>
          
          <div className="technique-points">
            <div className="points-section">
              <h5><i className="fas fa-list-check"></i> Essential Form</h5>
              <ul>
                {currentVideo.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
            
            <div className="ai-tips-section">
              <h5><i className="fas fa-robot"></i> AI Analysis Features</h5>
              <ul className="ai-tips">
                {currentVideo.aiTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!showInstructions && (
        <button 
          className="show-instructions-btn"
          onClick={() => setShowInstructions(true)}
        >
          <i className="fas fa-info-circle"></i>
          Show Technique Guide
        </button>
      )}
    </div>
  );
};

export default ExerciseVideo;
