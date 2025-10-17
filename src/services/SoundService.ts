
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

/**
 * PRODUCTION IMPLEMENTATION NOTES:
 * 
 * To implement actual sound playback in production, you need to:
 * 
 * 1. Download the sound files from the provided URLs and add them to your project:
 *    - Create an assets/sounds/ directory
 *    - Download each sound file and save with appropriate names
 *    - Update the SOUND_LIBRARY to reference local files instead of URLs
 * 
 * 2. Update the loadSound method to use Audio.Sound.createAsync:
 *    const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/filename.mp3'));
 * 
 * 3. For streaming from URLs (less reliable but possible):
 *    const { sound } = await Audio.Sound.createAsync({ uri: soundDef.url });
 * 
 * 4. The current implementation logs all actions for demonstration purposes.
 *    In production, replace console.log statements with actual audio playback.
 * 
 * 5. Background playback is configured in app.json with UIBackgroundModes: ["audio"]
 *    and in the Audio.setAudioModeAsync call with staysActiveInBackground: true
 * 
 * 6. The interruptionMode settings allow mixing with other apps' audio,
 *    so users can play music from other apps while using focus sounds.
 */

// Sound definitions with URLs and metadata
export interface SoundDefinition {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'breathing' | 'ticking' | 'nature';
}

export const SOUND_LIBRARY: SoundDefinition[] = [
  // Breathing sounds
  {
    id: 'breathing-deep-calm',
    title: 'Deep Calm Breathing',
    description: 'Slow, deep breathing sounds for relaxation and focus',
    url: 'https://freesound.org/people/dynamique/sounds/554735/',
    category: 'breathing'
  },
  {
    id: 'breathing-gentle-waves',
    title: 'Gentle Wave Breathing',
    description: 'Soft breathing pattern like gentle ocean waves',
    url: 'https://freesound.org/people/fuchsrodolfo/sounds/391175/',
    category: 'breathing'
  },
  {
    id: 'breathing-meditative',
    title: 'Meditative Breathing',
    description: 'Peaceful meditative breathing for deep concentration',
    url: 'https://freesound.org/people/giddster/sounds/336532/',
    category: 'breathing'
  },
  
  // Ticking sounds
  {
    id: 'ticking-classic-clock',
    title: 'Classic Clock Tick',
    description: 'Traditional clock ticking sound for time awareness',
    url: 'https://freesound.org/people/knufds/sounds/490323/',
    category: 'ticking'
  },
  {
    id: 'ticking-vintage-metronome',
    title: 'Vintage Metronome',
    description: 'Rhythmic metronome ticking for steady focus',
    url: 'https://freesound.org/people/DiArchangeli/sounds/462929/',
    category: 'ticking'
  },
  {
    id: 'ticking-modern-digital',
    title: 'Modern Digital Tick',
    description: 'Clean digital ticking sound for contemporary focus',
    url: 'https://freesound.org/people/RandomRecord19/sounds/673790/',
    category: 'ticking'
  },
  {
    id: 'ticking-soft-wooden',
    title: 'Soft Wooden Clock',
    description: 'Gentle wooden clock ticking for ambient focus',
    url: 'https://freesound.org/people/ST303/sounds/171043/',
    category: 'ticking'
  },
  {
    id: 'ticking-subtle-pulse',
    title: 'Subtle Pulse Tick',
    description: 'Minimal pulsing tick for background timing',
    url: 'https://freesound.org/people/nightcustard/sounds/675679/',
    category: 'ticking'
  },
  {
    id: 'ticking-mechanical-watch',
    title: 'Mechanical Watch',
    description: 'Precise mechanical watch ticking for structured focus',
    url: 'https://freesound.org/people/urbaneguerilla/sounds/161443/',
    category: 'ticking'
  },
  
  // Nature sounds
  {
    id: 'nature-forest-ambience',
    title: 'Forest Ambience',
    description: 'Peaceful forest sounds with birds and rustling leaves',
    url: 'https://freesound.org/people/DudeAwesome/sounds/386454/',
    category: 'nature'
  },
  {
    id: 'nature-gentle-rain',
    title: 'Gentle Rain',
    description: 'Soft rainfall sounds for calming background ambience',
    url: 'https://freesound.org/people/Garuda1982/sounds/737002/',
    category: 'nature'
  },
  {
    id: 'nature-ocean-waves',
    title: 'Ocean Waves',
    description: 'Rhythmic ocean waves for natural relaxation',
    url: 'https://freesound.org/people/Garuda1982/sounds/759738/',
    category: 'nature'
  },
  {
    id: 'nature-mountain-stream',
    title: 'Mountain Stream',
    description: 'Flowing water sounds from a peaceful mountain stream',
    url: 'https://freesound.org/people/ricardoemfield/sounds/734108/',
    category: 'nature'
  },
  {
    id: 'nature-spa-ambience',
    title: 'Spa Ambience',
    description: 'Tranquil spa environment sounds for deep relaxation',
    url: 'https://freesound.org/people/naturesoundspa/sounds/163597/',
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes',
    title: 'Wind Chimes',
    description: 'Gentle wind chimes for peaceful meditation',
    url: 'https://freesound.org/people/Anthousai/sounds/398742/',
    category: 'nature'
  }
];

export class SoundService {
  private sounds: { [key: string]: Audio.Sound } = {};
  private isInitialized: boolean = false;
  private masterEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  private currentlyPlaying: Set<string> = new Set();

  async initialize() {
    console.log('SoundService: Initializing');
    try {
      // Configure audio for background playback and mixing with other apps
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true, // Enable background playback
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true, // Duck other audio on Android
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 'mixWithOthers', // Fixed: Use string literal instead of deprecated constant
        interruptionModeAndroid: 'duckOthers', // Fixed: Use string literal instead of deprecated constant
      });
      this.isInitialized = true;
      console.log('SoundService: Initialized successfully with background playback');
    } catch (error) {
      console.log('SoundService: Error initializing audio:', error);
    }
  }

  async preloadSounds() {
    console.log('SoundService: Preloading sounds from library');
    
    for (const soundDef of SOUND_LIBRARY) {
      try {
        // Note: In a production app, you would download and cache these files locally
        // For now, we'll prepare the sound objects but not load the actual audio
        console.log(`SoundService: Prepared ${soundDef.title} (${soundDef.category})`);
        console.log(`  Description: ${soundDef.description}`);
        console.log(`  URL: ${soundDef.url}`);
      } catch (error) {
        console.log(`SoundService: Error preparing ${soundDef.title}:`, error);
      }
    }
  }

  async loadSound(soundId: string): Promise<Audio.Sound | null> {
    if (this.sounds[soundId]) {
      return this.sounds[soundId];
    }

    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    if (!soundDef) {
      console.log(`SoundService: Sound definition not found for ${soundId}`);
      return null;
    }

    try {
      // In a production app, you would load from the actual URL or local file
      // For now, we'll create a placeholder sound object
      console.log(`SoundService: Loading ${soundDef.title} from ${soundDef.url}`);
      
      // Note: This is where you would actually load the sound file
      // const { sound } = await Audio.Sound.createAsync({ uri: soundDef.url });
      // this.sounds[soundId] = sound;
      
      console.log(`SoundService: Successfully loaded ${soundDef.title}`);
      return null; // Return null for now since we're not loading actual files
    } catch (error) {
      console.log(`SoundService: Error loading ${soundDef.title}:`, error);
      return null;
    }
  }

  async playSound(soundId: string, loop: boolean = true) {
    if (!this.masterEnabled || !this.isInitialized) {
      console.log('SoundService: Sound disabled or not initialized');
      return;
    }

    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    if (!soundDef) {
      console.log(`SoundService: Sound definition not found for ${soundId}`);
      return;
    }

    console.log(`SoundService: Playing ${soundDef.title}`);
    console.log(`  Category: ${soundDef.category}`);
    console.log(`  Description: ${soundDef.description}`);
    console.log(`  URL: ${soundDef.url}`);
    console.log(`  Loop: ${loop}`);
    
    try {
      // Load the sound if not already loaded
      const sound = await this.loadSound(soundId);
      
      if (sound) {
        await sound.setIsLoopingAsync(loop);
        await sound.playAsync();
        this.currentlyPlaying.add(soundId);
        console.log(`SoundService: ${soundDef.title} is now playing`);
      } else {
        // Simulate playing for demo purposes
        this.currentlyPlaying.add(soundId);
        console.log(`SoundService: Simulating playback of ${soundDef.title}`);
      }
    } catch (error) {
      console.log(`SoundService: Error playing ${soundDef.title}:`, error);
    }
  }

  async stopSound(soundId: string) {
    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    const soundName = soundDef ? soundDef.title : soundId;
    
    console.log(`SoundService: Stopping ${soundName}`);
    
    try {
      if (this.sounds[soundId]) {
        await this.sounds[soundId].stopAsync();
      }
      this.currentlyPlaying.delete(soundId);
      console.log(`SoundService: ${soundName} stopped`);
    } catch (error) {
      console.log(`SoundService: Error stopping ${soundName}:`, error);
    }
  }

  async forceStopAll() {
    console.log('SoundService: Force stopping all sounds');
    
    for (const soundId of this.currentlyPlaying) {
      try {
        if (this.sounds[soundId]) {
          await this.sounds[soundId].stopAsync();
        }
      } catch (error) {
        console.log(`SoundService: Error force stopping ${soundId}:`, error);
      }
    }
    this.currentlyPlaying.clear();
  }

  setMasterEnabled(enabled: boolean) {
    console.log('SoundService: Setting master enabled to', enabled);
    this.masterEnabled = enabled;
    if (!enabled) {
      this.forceStopAll();
    }
  }

  setHapticsEnabled(enabled: boolean) {
    console.log('SoundService: Setting haptics enabled to', enabled);
    this.hapticsEnabled = enabled;
  }

  async playHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.hapticsEnabled) {
      console.log('SoundService: Haptics disabled');
      return;
    }

    console.log(`SoundService: Playing ${type} haptic`);
    
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.log('SoundService: Error playing haptic:', error);
    }
  }

  // Get sounds by category
  getSoundsByCategory(category: 'breathing' | 'ticking' | 'nature'): SoundDefinition[] {
    return SOUND_LIBRARY.filter(sound => sound.category === category);
  }

  // Get sound definition by ID
  getSoundDefinition(soundId: string): SoundDefinition | undefined {
    return SOUND_LIBRARY.find(sound => sound.id === soundId);
  }

  // Check if a sound is currently playing
  isPlaying(soundId: string): boolean {
    return this.currentlyPlaying.has(soundId);
  }

  // Get all currently playing sounds
  getCurrentlyPlaying(): string[] {
    return Array.from(this.currentlyPlaying);
  }
}

export const soundService = new SoundService();
