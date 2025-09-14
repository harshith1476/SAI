// Video asset configuration for sports tutorial system
export const videoAssets = {
  athletics: {
    sprint: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Sprint+Technique',
      fallbackVideo: '/videos/athletics/sprint-technique.mp4'
    },
    'long-jump': {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Long+Jump',
      fallbackVideo: '/videos/athletics/long-jump-technique.mp4'
    },
    'high-jump': {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=High+Jump',
      fallbackVideo: '/videos/athletics/high-jump-technique.mp4'
    },
    'shot-put': {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Shot+Put',
      fallbackVideo: '/videos/athletics/shot-put-technique.mp4'
    }
  },
  swimming: {
    freestyle: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Freestyle',
      fallbackVideo: '/videos/swimming/freestyle-technique.mp4'
    },
    butterfly: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Butterfly',
      fallbackVideo: '/videos/swimming/butterfly-technique.mp4'
    }
  },
  gymnastics: {
    balance: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Balance',
      fallbackVideo: '/videos/gymnastics/balance-technique.mp4'
    },
    flexibility: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Flexibility',
      fallbackVideo: '/videos/gymnastics/flexibility-technique.mp4'
    }
  },
  weightlifting: {
    squat: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Squat',
      fallbackVideo: '/videos/weightlifting/squat-technique.mp4'
    },
    deadlift: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Deadlift',
      fallbackVideo: '/videos/weightlifting/deadlift-technique.mp4'
    }
  },
  boxing: {
    stance: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Boxing+Stance',
      fallbackVideo: '/videos/boxing/stance-technique.mp4'
    }
  },
  wrestling: {
    stance: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Wrestling+Stance',
      fallbackVideo: '/videos/wrestling/stance-technique.mp4'
    }
  },
  badminton: {
    'ready-position': {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Ready+Position',
      fallbackVideo: '/videos/badminton/ready-technique.mp4'
    }
  },
  football: {
    stance: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Athletic+Stance',
      fallbackVideo: '/videos/football/stance-technique.mp4'
    }
  }
};

// Function to get video asset with fallback
export const getVideoAsset = (sport, exercise) => {
  const asset = videoAssets[sport]?.[exercise];
  if (!asset) {
    return {
      videoUrl: '/videos/placeholder.mp4',
      thumbnail: 'https://via.placeholder.com/300x200/666666/FFFFFF?text=Video+Coming+Soon',
      fallbackVideo: '/videos/placeholder.mp4'
    };
  }
  return asset;
};

// Function to check if video exists
export const checkVideoExists = async (videoUrl) => {
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};
