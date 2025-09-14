import React, { useState, useEffect } from 'react';
import './VideoGenerator.css';

const VideoGenerator = ({ sport, exercise, onGenerationComplete }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);

  // AI Video Generation prompts for each exercise
  const videoPrompts = {
    athletics: {
      'sprint': {
        prompt: "Generate a professional sports training video showing proper 100m sprint technique. Show an athletic person demonstrating: starting position with hands behind the line, forward lean of 15-20 degrees, high knee lift during acceleration, 90-degree arm swing, and straight back posture. Include slow-motion breakdowns of each phase.",
        style: "professional sports training, high-quality, athletic demonstration",
        duration: 150 // 2:30 minutes
      },
      '100m-sprint': {
        prompt: "Generate a professional sports training video showing proper 100m sprint technique. Show an athletic person demonstrating: starting position with hands behind the line, forward lean of 15-20 degrees, high knee lift during acceleration, 90-degree arm swing, and straight back posture. Include slow-motion breakdowns of each phase.",
        style: "professional sports training, high-quality, athletic demonstration",
        duration: 150 // 2:30 minutes
      },
      'long-jump': {
        prompt: "Create an instructional video for long jump takeoff technique. Demonstrate controlled approach run, firm foot plant at takeoff board, upward knee drive, forward arm extension, and momentum maintenance. Include multiple angles and slow-motion analysis.",
        style: "athletic training, track and field, instructional",
        duration: 195 // 3:15 minutes
      },
      'high-jump': {
        prompt: "Generate a high jump clearance form tutorial. Show curved approach run, outside foot takeoff plant, back arch over bar, shoulder-led clearance, and leg kick technique. Include biomechanical analysis overlays.",
        style: "sports biomechanics, professional coaching, detailed technique",
        duration: 165 // 2:45 minutes
      },
      'shot-put': {
        prompt: "Create shot put release technique video. Demonstrate glide/spin setup, power position with low stance, full arm extension, shoulder and hip rotation, and 40-degree release angle. Include force vector analysis.",
        style: "strength sports, technical analysis, coaching demonstration",
        duration: 180 // 3:00 minutes
      },
      '800m-run': {
        prompt: "Generate 800m running technique video. Show pacing strategy, efficient stride mechanics, breathing rhythm, cornering technique, and finishing kick. Include endurance training tips.",
        style: "middle distance running, endurance training, race strategy",
        duration: 210 // 3:30 minutes
      },
      '1500m-run': {
        prompt: "Create 1500m race strategy tutorial. Demonstrate tactical positioning, pace control, energy conservation, kick timing, and mental preparation. Include race analysis.",
        style: "distance running, tactical racing, endurance sports",
        duration: 240 // 4:00 minutes
      }
    },
    swimming: {
      'freestyle': {
        prompt: "Generate freestyle stroke technique video. Show horizontal body position, shoulder rotation with each stroke, full arm extension, neutral head position, and steady kick rhythm. Include underwater and surface views.",
        style: "aquatic sports, swimming technique, multi-angle demonstration",
        duration: 240 // 4:00 minutes
      },
      'butterfly': {
        prompt: "Create butterfly stroke form tutorial. Demonstrate simultaneous arm movement, dolphin kick timing, body undulation wave, breathing technique, and entry/catch phase. Include synchronized movement analysis.",
        style: "competitive swimming, technical precision, rhythm demonstration",
        duration: 210 // 3:30 minutes
      },
      '50m-freestyle': {
        prompt: "Generate freestyle stroke technique video. Show horizontal body position, shoulder rotation with each stroke, full arm extension, neutral head position, and steady kick rhythm. Include underwater and surface views.",
        style: "aquatic sports, swimming technique, multi-angle demonstration",
        duration: 240 // 4:00 minutes
      },
      'backstroke': {
        prompt: "Create backstroke technique tutorial. Show body rotation, arm entry and pull, flutter kick, and breathing rhythm. Include body position and stroke timing analysis.",
        style: "swimming technique, stroke mechanics, aquatic sports",
        duration: 200 // 3:20 minutes
      },
      'breaststroke': {
        prompt: "Generate breaststroke form video. Demonstrate pull-breathe-kick-glide sequence, proper timing, streamlined position, and efficient propulsion. Include underwater analysis.",
        style: "swimming technique, stroke coordination, aquatic training",
        duration: 220 // 3:40 minutes
      }
    },
    gymnastics: {
      'balance': {
        prompt: "Generate balance beam technique video. Show parallel foot placement, core engagement, straight spine alignment, head-body alignment, and fixed-point focus. Include stability analysis and common corrections.",
        style: "gymnastics training, balance demonstration, precision coaching",
        duration: 140 // 2:20 minutes
      },
      'flexibility': {
        prompt: "Create flexibility assessment tutorial. Demonstrate gradual range of motion, proper warm-up sequence, joint mobility testing, muscle flexibility assessment, and safe stretching techniques.",
        style: "fitness assessment, flexibility training, safety-focused",
        duration: 225 // 3:45 minutes
      },
      'flexibility-test': {
        prompt: "Create flexibility assessment tutorial. Demonstrate gradual range of motion, proper warm-up sequence, joint mobility testing, muscle flexibility assessment, and safe stretching techniques.",
        style: "fitness assessment, flexibility training, safety-focused",
        duration: 225 // 3:45 minutes
      },
      'balance-beam': {
        prompt: "Generate balance beam technique video. Show parallel foot placement, core engagement, straight spine alignment, head-body alignment, and fixed-point focus. Include stability analysis and common corrections.",
        style: "gymnastics training, balance demonstration, precision coaching",
        duration: 140 // 2:20 minutes
      },
      'floor-exercise': {
        prompt: "Create floor exercise routine tutorial. Show proper tumbling form, landing technique, rhythm and flow, artistic expression, and strength elements. Include choreography tips.",
        style: "gymnastics artistry, floor routine, performance coaching",
        duration: 280 // 4:40 minutes
      },
      'strength-assessment': {
        prompt: "Generate strength assessment video. Show core stability tests, functional movement patterns, bodyweight exercises, and strength evaluation protocols. Include safety guidelines.",
        style: "fitness testing, strength evaluation, functional movement",
        duration: 190 // 3:10 minutes
      }
    },
    weightlifting: {
      'squat': {
        prompt: "Generate perfect squat form video. Show shoulder-width foot placement, chest up posture, straight back maintenance, hip-below-knee depth, knee-toe alignment, and heel drive. Include common error corrections.",
        style: "strength training, powerlifting technique, form analysis",
        duration: 200 // 3:20 minutes
      },
      'deadlift': {
        prompt: "Create deadlift technique tutorial. Demonstrate bar-to-shin proximity, straight back throughout lift, hip hinge movement, lat and core engagement, and full hip extension. Include safety protocols.",
        style: "powerlifting, strength coaching, safety demonstration",
        duration: 230 // 3:50 minutes
      },
      'bench-press': {
        prompt: "Generate bench press form video. Show proper setup, bar path, shoulder blade retraction, leg drive, and controlled descent. Include safety spotting and common mistakes.",
        style: "powerlifting, strength training, safety protocols",
        duration: 210 // 3:30 minutes
      },
      'clean-&-jerk': {
        prompt: "Create clean and jerk tutorial. Demonstrate first pull, transition, front squat catch, jerk drive, and overhead stability. Include Olympic lifting progression.",
        style: "olympic weightlifting, technical precision, explosive power",
        duration: 300 // 5:00 minutes
      },
      'clean-jerk': {
        prompt: "Create clean and jerk tutorial. Demonstrate first pull, transition, front squat catch, jerk drive, and overhead stability. Include Olympic lifting progression.",
        style: "olympic weightlifting, technical precision, explosive power",
        duration: 300 // 5:00 minutes
      }
    },
    boxing: {
      'stance': {
        prompt: "Generate boxing stance fundamentals video. Show guard position with hands up, shoulder-width foot placement, slight knee bend, tucked chin, and light footwork. Include defensive positioning.",
        style: "combat sports, boxing fundamentals, defensive technique",
        duration: 135 // 2:15 minutes
      },
      'jab': {
        prompt: "Create jab technique tutorial. Show proper extension, shoulder rotation, hip engagement, return to guard, and footwork coordination. Include speed and accuracy drills.",
        style: "boxing technique, striking fundamentals, combat sports",
        duration: 180 // 3:00 minutes
      },
      'hook': {
        prompt: "Generate hook punch video. Demonstrate pivot foot, hip rotation, elbow angle, target accuracy, and defensive recovery. Include power generation mechanics.",
        style: "boxing technique, power punching, combat training",
        duration: 195 // 3:15 minutes
      },
      'footwork': {
        prompt: "Create boxing footwork tutorial. Show lateral movement, forward/backward steps, pivot techniques, balance maintenance, and ring positioning. Include agility drills.",
        style: "boxing movement, footwork fundamentals, agility training",
        duration: 220 // 3:40 minutes
      }
    },
    wrestling: {
      'stance': {
        prompt: "Create wrestling defensive stance tutorial. Demonstrate low center of gravity, shoulders over knees, ready hand position, balanced foot placement, and alert head position. Include reaction drills.",
        style: "wrestling technique, defensive positioning, athletic stance",
        duration: 160 // 2:40 minutes
      },
      'takedown': {
        prompt: "Generate takedown setup video. Show level change, penetration step, head position, hand placement, and drive through. Include setup combinations.",
        style: "wrestling technique, takedown fundamentals, grappling",
        duration: 240 // 4:00 minutes
      },
      'sprawl': {
        prompt: "Create sprawl defense tutorial. Demonstrate hip extension, leg drive back, hand placement, and counter-attack positioning. Include defensive reactions.",
        style: "wrestling defense, sprawl technique, grappling fundamentals",
        duration: 170 // 2:50 minutes
      },
      'bridge': {
        prompt: "Generate bridge position video. Show neck strength, hip elevation, shoulder positioning, and escape techniques. Include flexibility and strength training.",
        style: "wrestling fundamentals, bridge technique, escape methods",
        duration: 155 // 2:35 minutes
      }
    },
    badminton: {
      'ready-position': {
        prompt: "Generate badminton ready position video. Show shoulder-width foot stance, slight knee bend, racket ready position, weight on balls of feet, and alert balanced posture. Include reaction demonstrations.",
        style: "racquet sports, badminton technique, ready position",
        duration: 150 // 2:30 minutes
      },
      'forehand': {
        prompt: "Create forehand stroke tutorial. Show grip, backswing, contact point, follow-through, and footwork. Include power and placement techniques.",
        style: "badminton technique, stroke mechanics, racquet sports",
        duration: 200 // 3:20 minutes
      },
      'backhand': {
        prompt: "Generate backhand stroke video. Demonstrate grip change, body rotation, contact timing, and recovery position. Include defensive and attacking variations.",
        style: "badminton technique, backhand mechanics, stroke training",
        duration: 210 // 3:30 minutes
      },
      'serve': {
        prompt: "Create badminton serve tutorial. Show service stance, shuttle placement, racket swing, and follow-through. Include different serve types and strategies.",
        style: "badminton fundamentals, serving technique, game strategy",
        duration: 185 // 3:05 minutes
      }
    },
    football: {
      'stance': {
        prompt: "Create football athletic stance tutorial. Demonstrate bent knee athletic position, wider-than-shoulder foot placement, chest up posture, ready arm position, and balanced stance. Include movement preparation.",
        style: "american football, athletic positioning, stance fundamentals",
        duration: 145 // 2:25 minutes
      },
      'sprint': {
        prompt: "Generate football sprint technique video. Show acceleration mechanics, arm drive, leg turnover, and speed development. Include position-specific running form.",
        style: "football training, speed development, athletic performance",
        duration: 190 // 3:10 minutes
      },
      'catching': {
        prompt: "Create catching technique tutorial. Show hand positioning, eye tracking, body positioning, and secure ball handling. Include various catch scenarios.",
        style: "football skills, receiving technique, ball handling",
        duration: 175 // 2:55 minutes
      },
      'kicking': {
        prompt: "Generate kicking form video. Demonstrate approach angle, plant foot placement, contact point, and follow-through. Include accuracy and distance techniques.",
        style: "football kicking, special teams, technique fundamentals",
        duration: 165 // 2:45 minutes
      }
    }
  };

  // Simulate AI video generation process
  const generateVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    const currentPrompt = videoPrompts[sport]?.[exercise];
    
    if (!currentPrompt) {
      setError(`Video generation not available for ${sport} - ${exercise}`);
      setIsGenerating(false);
      return;
    }

    try {
      // Simulate AI generation progress
      const progressSteps = [
        { progress: 10, message: "Analyzing exercise requirements..." },
        { progress: 25, message: "Generating movement sequences..." },
        { progress: 40, message: "Creating biomechanical analysis..." },
        { progress: 60, message: "Rendering video frames..." },
        { progress: 80, message: "Adding instructional overlays..." },
        { progress: 95, message: "Finalizing video output..." },
        { progress: 100, message: "Video generation complete!" }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setGenerationProgress(step.progress);
      }

      // Simulate generated video data
      const generatedVideoData = {
        id: `${sport}-${exercise}-${Date.now()}`,
        title: currentPrompt.prompt.split('.')[0],
        videoUrl: `/generated-videos/${sport}/${exercise}-ai-generated.mp4`,
        thumbnail: `/generated-videos/${sport}/${exercise}-thumbnail.jpg`,
        duration: formatDuration(currentPrompt.duration),
        prompt: currentPrompt.prompt,
        style: currentPrompt.style,
        generatedAt: new Date().toISOString(),
        aiModel: "SportsTech AI v2.1",
        quality: "4K Ultra HD",
        features: [
          "Slow-motion analysis",
          "Biomechanical overlays", 
          "Form correction tips",
          "Multiple camera angles",
          "Professional narration"
        ]
      };

      setGeneratedVideo(generatedVideoData);
      
      if (onGenerationComplete) {
        onGenerationComplete(generatedVideoData);
      }

    } catch (err) {
      setError("Failed to generate video. Please try again.");
      console.error("Video generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    if (generatedVideo) {
      // Simulate video download
      const link = document.createElement('a');
      link.href = generatedVideo.videoUrl;
      link.download = `${sport}-${exercise}-tutorial.mp4`;
      link.click();
    }
  };

  const shareVideo = () => {
    if (generatedVideo && navigator.share) {
      navigator.share({
        title: generatedVideo.title,
        text: `Check out this AI-generated sports tutorial for ${sport} ${exercise}`,
        url: generatedVideo.videoUrl
      });
    }
  };

  return (
    <div className="video-generator">
      <div className="generator-header">
        <h3>
          <i className="fas fa-robot"></i>
          AI Video Generator
        </h3>
        <p>Generate personalized exercise demonstration videos using AI</p>
      </div>

      {!generatedVideo && !isGenerating && (
        <div className="generation-prompt">
          <div className="prompt-preview">
            <h4>Video to Generate:</h4>
            <p>{videoPrompts[sport]?.[exercise]?.prompt || "Custom exercise demonstration video"}</p>
            
            <div className="prompt-details">
              <span className="detail-tag">
                <i className="fas fa-clock"></i>
                Duration: {formatDuration(videoPrompts[sport]?.[exercise]?.duration || 120)}
              </span>
              <span className="detail-tag">
                <i className="fas fa-palette"></i>
                Style: {videoPrompts[sport]?.[exercise]?.style || "Professional sports training"}
              </span>
            </div>
          </div>

          <button 
            className="generate-btn"
            onClick={generateVideo}
          >
            <i className="fas fa-magic"></i>
            Generate AI Video
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="generation-progress">
          <div className="progress-header">
            <h4>
              <i className="fas fa-cog fa-spin"></i>
              Generating Video...
            </h4>
            <span className="progress-percentage">{generationProgress}%</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          
          <div className="progress-steps">
            <div className="step active">
              <i className="fas fa-check-circle"></i>
              Analyzing Exercise
            </div>
            <div className={`step ${generationProgress >= 25 ? 'active' : ''}`}>
              <i className="fas fa-running"></i>
              Generating Movements
            </div>
            <div className={`step ${generationProgress >= 60 ? 'active' : ''}`}>
              <i className="fas fa-video"></i>
              Rendering Video
            </div>
            <div className={`step ${generationProgress >= 100 ? 'active' : ''}`}>
              <i className="fas fa-star"></i>
              Finalizing
            </div>
          </div>
        </div>
      )}

      {generatedVideo && (
        <div className="generated-video-result">
          <div className="video-preview">
            <div className="video-thumbnail">
              <img src={generatedVideo.thumbnail} alt="Generated video thumbnail" />
              <div className="play-overlay">
                <i className="fas fa-play"></i>
              </div>
              <div className="ai-badge">
                <i className="fas fa-robot"></i>
                AI Generated
              </div>
            </div>
            
            <div className="video-info">
              <h4>{generatedVideo.title}</h4>
              <div className="video-meta">
                <span><i className="fas fa-clock"></i> {generatedVideo.duration}</span>
                <span><i className="fas fa-eye"></i> {generatedVideo.quality}</span>
                <span><i className="fas fa-brain"></i> {generatedVideo.aiModel}</span>
              </div>
              
              <div className="video-features">
                <h5>Features:</h5>
                <ul>
                  {generatedVideo.features.map((feature, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="video-actions">
            <button className="action-btn primary" onClick={downloadVideo}>
              <i className="fas fa-download"></i>
              Download Video
            </button>
            <button className="action-btn secondary" onClick={shareVideo}>
              <i className="fas fa-share"></i>
              Share
            </button>
            <button className="action-btn tertiary" onClick={() => setGeneratedVideo(null)}>
              <i className="fas fa-redo"></i>
              Generate New
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="generation-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
