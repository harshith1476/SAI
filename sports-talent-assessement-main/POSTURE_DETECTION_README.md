# MediaPipe Posture Detection System for Sports Assessment

## Overview
This system uses Google's MediaPipe library to provide real-time posture detection and analysis for various sports. It includes body gesture recognition, audio feedback for incorrect postures, and screen recording capabilities.

## Features

### 🏃‍♂️ Sports Covered
- **Athletics**: Sprint form, long jump, high jump, shot put
- **Swimming**: Freestyle, butterfly, backstroke, breaststroke
- **Gymnastics**: Balance, flexibility, floor exercises
- **Weightlifting**: Squat, deadlift, bench press
- **Boxing**: Stance, guard position, punch form
- **Wrestling**: Defensive stance, takedown setup
- **Badminton**: Ready position, stroke techniques
- **Football**: Athletic stance, sprint form

### 🎯 Key Features
- **Real-time Pose Detection**: Uses MediaPipe Pose for accurate body landmark detection
- **Sport-specific Analysis**: Tailored posture analysis for each sport
- **Audio Feedback**: Beep sounds for incorrect postures (< 70% accuracy)
- **Screen Recording**: Built-in recording functionality
- **Performance Scoring**: Real-time accuracy percentage
- **Visual Feedback**: Live pose landmarks and connections overlay
- **Responsive Design**: Works on desktop and mobile devices

## Technical Implementation

### MediaPipe Integration
```javascript
// Core MediaPipe setup
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
```

### Posture Analysis Examples

#### Athletics - Sprint Analysis
- **Body Lean**: Checks forward lean angle (15-20 degrees optimal)
- **Knee Lift**: Measures knee height relative to hip
- **Arm Position**: Validates 90-degree arm angles
- **Feedback**: "Adjust forward lean angle", "Lift knees higher"

#### Swimming - Freestyle Analysis
- **Arm Extension**: Checks stroke extension (160-180 degrees)
- **Body Rotation**: Measures shoulder rotation during stroke
- **Feedback**: "Extend arms more during stroke", "Rotate body more"

#### Weightlifting - Squat Analysis
- **Squat Depth**: Ensures hips go below knee level
- **Knee Alignment**: Validates proper knee tracking
- **Feedback**: "Squat deeper - hips below knees", "Bend knees more"

### Audio Feedback System
```javascript
const playBeepSound = () => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.frequency.value = 800; // Hz
  oscillator.type = 'sine';
  
  // 0.2 second beep for incorrect posture
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};
```

## Usage Instructions

### 1. Navigation
- Go to Sports Category page
- Select your sport (Athletics, Swimming, etc.)
- Click "START ASSESSMENT" button

### 2. Camera Setup
- Allow camera permissions when prompted
- Position yourself in front of the camera
- Ensure good lighting and clear background
- Stand 3-6 feet from camera for optimal detection

### 3. Assessment Process
- Click "Start Assessment" to begin recording
- Perform the exercise/posture as instructed
- Follow the real-time feedback on screen
- Listen for audio beeps indicating incorrect form
- Click "Stop Assessment" when finished

### 4. Results
- View your average accuracy score
- Review performance feedback
- Download recorded video if needed
- Try again to improve your score

## Posture Guidelines by Sport

### Athletics (Sprint)
1. Position feet shoulder-width apart
2. Lean forward slightly (15-20 degrees)
3. Keep arms at 90-degree angles
4. Lift knees high during movement
5. Maintain straight back posture

### Swimming (Freestyle)
1. Keep body horizontal in water position
2. Rotate shoulders with each stroke
3. Extend arms fully forward
4. Keep head in neutral position
5. Maintain steady rhythm

### Gymnastics (Balance)
1. Keep feet parallel and stable
2. Engage core muscles
3. Maintain straight spine
4. Keep head aligned with body
5. Focus eyes on fixed point

### Weightlifting (Squat)
1. Feet shoulder-width apart
2. Keep chest up and back straight
3. Lower hips below knee level
4. Keep knees aligned with toes
5. Drive through heels to stand

### Boxing (Stance)
1. Keep hands up in guard position
2. Feet shoulder-width apart
3. Slight bend in knees
4. Keep chin tucked
5. Stay light on feet

## Scoring System

### Accuracy Levels
- **90-100%**: Excellent form
- **80-89%**: Good form
- **70-79%**: Fair form (minor adjustments needed)
- **Below 70%**: Needs improvement (triggers audio feedback)

### Performance Indicators
- **Green**: Correct posture (>70% accuracy)
- **Orange/Red**: Incorrect posture (<70% accuracy)
- **Audio Beep**: Immediate feedback for poor form

## Browser Compatibility
- Chrome 80+ (Recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

## Permissions Required
- **Camera Access**: For pose detection
- **Microphone Access**: For audio feedback
- **Screen Recording**: For session recording (optional)

## Troubleshooting

### Common Issues
1. **Camera not working**: Check browser permissions
2. **Poor detection**: Improve lighting, remove background clutter
3. **Audio not playing**: Check browser audio settings
4. **Slow performance**: Close other applications, use Chrome

### Optimization Tips
- Use good lighting (natural light preferred)
- Wear contrasting colors to background
- Ensure full body is visible in frame
- Minimize background movement
- Use stable internet connection

## File Structure
```
src/
├── components/
│   └── PostureDetection/
│       ├── PostureDetection.js
│       └── PostureDetection.css
├── pages/
│   └── PostureAssessment/
│       ├── PostureAssessment.js
│       └── PostureAssessment.css
└── App.js (routing configuration)
```

## Dependencies
```json
{
  "@mediapipe/camera_utils": "^0.3.1675466124",
  "@mediapipe/drawing_utils": "^0.3.1675466124",
  "@mediapipe/pose": "^0.5.1675469404"
}
```

## Future Enhancements
- Machine learning model training for sport-specific improvements
- Multi-person pose detection for team sports
- Integration with wearable devices
- Advanced biomechanical analysis
- Coach dashboard for reviewing athlete assessments
- Historical performance tracking and analytics

## Support
For technical support or questions about the posture detection system, please contact the development team or refer to the MediaPipe documentation at https://mediapipe.dev/
