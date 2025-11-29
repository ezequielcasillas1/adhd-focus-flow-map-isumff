
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { freesoundAPI } from './FreesoundAPI';

/**
 * SOUND SERVICE - Audio Playback Implementation
 * 
 * This service handles audio playback for focus sounds (ticking, breathing, nature).
 * Sounds are streamed from URLs on-demand when first played.
 * 
 * Features:
 * - Background playback (configured in app.json with UIBackgroundModes: ["audio"])
 * - Audio mixing with other apps (users can play music while using focus sounds)
 * - On-demand loading (sounds loaded when first played, cached thereafter)
 * - Looping support for ambient sounds
 * 
 * Note: For better performance and offline support, consider:
 * - Downloading sound files to assets/sounds/ directory
 * - Using require() instead of URI streaming
 * - Implementing sound caching with expo-file-system
 */

// Sound definitions with URLs and metadata
export interface SoundDefinition {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'breathing' | 'ticking' | 'nature';
}

// Map Freesound IDs to our sound definitions
export const SOUND_LIBRARY: SoundDefinition[] = [
  // Breathing sounds - Freesound.org
  {
    id: 'breathing-deep-calm',
    title: 'Deep Calm Breathing',
    description: 'Slow, deep breathing sounds for relaxation and focus',
    url: '554735.mp3', // Freesound ID
    category: 'breathing'
  },
  {
    id: 'breathing-gentle-waves',
    title: 'Gentle Wave Breathing',
    description: 'Soft breathing pattern like gentle ocean waves',
    url: '391175.mp3', // Freesound ID
    category: 'breathing'
  },
  {
    id: 'breathing-meditative',
    title: 'Meditative Breathing',
    description: 'Peaceful meditative breathing for deep concentration',
    url: '336532.mp3', // Freesound ID
    category: 'breathing'
  },
  {
    id: 'breathing-woman-sigh',
    title: 'Woman Breathing & Sighing',
    description: 'Middle-aged woman breathing and sighing naturally',
    url: '218311.mp3', // Freesound ID: SpliceSound
    category: 'breathing'
  },
  {
    id: 'breathing-woman-nose',
    title: 'Woman Breathing Through Nose',
    description: 'Natural female nose breathing for calm focus',
    url: '112556.mp3', // Freesound ID: nickrave
    category: 'breathing'
  },
  {
    id: 'breathing-woman-mouth',
    title: 'Woman Breathing Through Mouth',
    description: 'Natural female mouth breathing pattern',
    url: '112555.mp3', // Freesound ID: nickrave
    category: 'breathing'
  },
  {
    id: 'breathing-woman-outofbreath',
    title: 'Woman Out of Breath (Slow)',
    description: 'Young woman breathing slowly after exertion',
    url: '667286.mp3', // Freesound ID: pekena_larva
    category: 'breathing'
  },
  {
    id: 'breathing-man-stereo',
    title: 'Man Breathing (Stereo)',
    description: 'Male breathing recorded in stereo, close proximity',
    url: '749673.mp3', // Freesound ID: SgtPepperArc360
    category: 'breathing'
  },
  {
    id: 'breathing-man-heavy',
    title: 'Man Heavy Breathing',
    description: 'Male breathing heavily, deep and pronounced',
    url: '410969.mp3', // Freesound ID: MihirFreeSound
    category: 'breathing'
  },
  {
    id: 'breathing-woman-calm',
    title: 'Calm Woman Smoking Cigarette',
    description: 'Calm woman smoking a cigarette naturally',
    url: '327806.mp3', // Freesound ID: Fluffayfish
    category: 'breathing'
  },
  {
    id: 'breathing-underwater',
    title: 'Underwater Breathing',
    description: 'Breathing with underwater atmosphere and bubble effects',
    url: '324562.mp3', // Freesound ID: univ_lyon3
    category: 'breathing'
  },
  
  // Ticking sounds - Freesound.org
  {
    id: 'ticking-classic-clock',
    title: 'Classic Clock Tick',
    description: 'Traditional clock ticking sound for time awareness',
    url: '490323.mp3', // Freesound ID
    category: 'ticking'
  },
  {
    id: 'ticking-vintage-metronome',
    title: 'Vintage Metronome',
    description: 'Rhythmic metronome ticking for steady focus',
    url: '462929.mp3', // Freesound ID
    category: 'ticking'
  },
  {
    id: 'ticking-modern-digital',
    title: 'Modern Digital Tick',
    description: 'Clean digital ticking sound for contemporary focus',
    url: '673790.mp3', // Freesound ID
    category: 'ticking'
  },
  {
    id: 'ticking-soft-wooden',
    title: 'Soft Wooden Clock',
    description: 'Gentle wooden clock ticking for ambient focus',
    url: '171043.mp3', // Freesound ID
    category: 'ticking'
  },
  {
    id: 'ticking-subtle-pulse',
    title: 'Subtle Pulse Tick',
    description: 'Minimal pulsing tick for background timing',
    url: '675679.mp3', // Freesound ID
    category: 'ticking'
  },
  {
    id: 'ticking-mechanical-watch',
    title: 'Mechanical Watch',
    description: 'Precise mechanical watch ticking for structured focus',
    url: '161443.mp3', // Freesound ID
    category: 'ticking'
  },
  
  // Nature sounds - Freesound.org
  {
    id: 'nature-ocean-waves',
    title: 'Ocean Waves',
    description: 'Rhythmic ocean waves for natural relaxation',
    url: '386454.mp3', // Freesound ID (corrected)
    category: 'nature'
  },
  {
    id: 'nature-forest-ambience',
    title: 'Forest Ambience',
    description: 'Peaceful forest sounds with birds and rustling leaves',
    url: '759738.mp3', // Freesound ID (corrected)
    category: 'nature'
  },
  {
    id: 'nature-gentle-rain',
    title: 'Gentle Rain',
    description: 'Soft rainfall sounds for calming background ambience',
    url: '398742.mp3', // Freesound ID (moved from old wind chimes)
    category: 'nature'
  },
  {
    id: 'nature-mountain-stream',
    title: 'Mountain Stream',
    description: 'Flowing water sounds from a peaceful mountain stream',
    url: '734108.mp3', // Freesound ID
    category: 'nature'
  },
  {
    id: 'nature-spa-ambience',
    title: 'Spa Ambience',
    description: 'Tranquil spa environment sounds for deep relaxation',
    url: '163597.mp3', // Freesound ID
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes',
    title: 'Wind Chimes',
    description: 'Metal wind chimes swayed at different speeds',
    url: '541113.mp3', // Freesound ID: Chelly01
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-relaxing',
    title: 'Relaxing Wind Chimes',
    description: 'Evening wind chimes for purifying and enhancing energy',
    url: '560543.mp3', // Freesound ID: SterckxS
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-gregorian',
    title: 'Gregorian Wind Chimes',
    description: 'Gregorian wind chimes playing gently in the wind',
    url: '529016.mp3', // Freesound ID: SiriusParsec
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-binaural',
    title: 'Binaural Wind Chimes',
    description: 'Ambisonic-derived binaural wind chimes with yard sounds (use headphones)',
    url: '799569.mp3', // Freesound ID: lonemonk
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-playground',
    title: 'Playground Wind Chimes',
    description: 'Distant wind chimes with meditative far background ambience',
    url: '521026.mp3', // Freesound ID: Profispiesser
    category: 'nature'
  }
];

export class SoundService {
  private sounds: { [key: string]: Audio.Sound } = {};
  private isInitialized: boolean = false;
  private masterEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  private currentlyPlaying: Set<string> = new Set();
  private fadeOutTimers: { [key: string]: NodeJS.Timeout } = {};
  private crossfadeLoops: { [key: string]: { instances: Audio.Sound[], active: boolean, scheduledTimers: NodeJS.Timeout[] } } = {};

  async initialize() {
    console.log('SoundService: Initializing');
    try {
      // Configure audio for background playback - DoNotMix ensures audio continues when screen locks
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix, // ✅ CRITICAL: DoNotMix keeps audio playing when screen locks
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
      });
      this.isInitialized = true;
      console.log('SoundService: Initialized successfully with background playback');
    } catch (error) {
      console.log('SoundService: Error initializing audio:', error);
      // Try without background/interruption settings
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
        this.isInitialized = true;
        console.log('SoundService: Initialized with basic audio mode');
      } catch (fallbackError) {
        console.log('SoundService: Fallback initialization failed:', fallbackError);
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
      console.log(`SoundService: Loading ${soundDef.title} - fetching from Freesound...`);
      
      // Get sound URL from Freesound API (via Supabase Edge Function)
      const freesoundId = soundDef.url.replace('.mp3', '');
      const soundData = await freesoundAPI.getSound(freesoundId);
      
      if (!soundData || !soundData.downloadUrl) {
        throw new Error(`Failed to get sound URL from Freesound API`);
      }
      
      console.log(`SoundService: Got CDN URL, loading audio for ${soundDef.title}...`);
      
      // Stream directly from Freesound CDN URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundData.downloadUrl },
        { shouldPlay: false, isLooping: false }
      );
      
      this.sounds[soundId] = sound;
      console.log(`SoundService: Successfully loaded ${soundDef.title} from Freesound CDN`);
      return sound;
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

    // Stop if already playing
    if (this.currentlyPlaying.has(soundId)) {
      console.log(`SoundService: ${soundDef.title} already playing, stopping first...`);
      await this.stopSound(soundId);
    }

    console.log(`SoundService: Playing ${soundDef.title} (loop: ${loop ? 'CROSSFADE' : 'ONCE'})`);
    
    try {
      if (loop) {
        // Use crossfade looping for seamless transitions
        await this.startCrossfadeLoop(soundId, soundDef);
      } else {
        // Single playback with fade-out
        const sound = await this.loadSound(soundId);
        
        if (sound) {
          await sound.setIsLoopingAsync(false);
          await sound.setVolumeAsync(0);
          await sound.playAsync();
          this.currentlyPlaying.add(soundId);
          
          // Fade in over 1 second
          this.fadeIn(sound, 1000);
          
          // Schedule fade-out 2 seconds before end
          await this.scheduleFadeOutBeforeEnd(soundId, sound, 2000);
          
          console.log(`SoundService: ✅ ${soundDef.title} playing ONCE with fade`);
        }
      }
    } catch (error) {
      console.log(`SoundService: ❌ Error playing ${soundDef.title}:`, error);
    }
  }

  private async startCrossfadeLoop(soundId: string, soundDef: SoundDefinition) {
    console.log(`[CROSSFADE] Starting crossfade loop for ${soundDef.title}`);
    
    // Initialize crossfade loop tracking
    this.crossfadeLoops[soundId] = {
      instances: [],
      active: true,
      scheduledTimers: []
    };
    
    this.currentlyPlaying.add(soundId);
    
    // Start the first instance
    await this.playNextCrossfadeInstance(soundId, soundDef, true);
  }

  private async playNextCrossfadeInstance(soundId: string, soundDef: SoundDefinition, isFirst: boolean = false) {
    // Check if loop is still active
    if (!this.crossfadeLoops[soundId] || !this.crossfadeLoops[soundId].active) {
      console.log(`[CROSSFADE] Loop stopped for ${soundId}, not starting next instance`);
      return;
    }

    try {
      console.log(`[CROSSFADE] Loading new instance for ${soundId}...`);
      
      // Get sound URL from Freesound API
      const freesoundId = soundDef.url.replace('.mp3', '');
      const soundData = await freesoundAPI.getSound(freesoundId);
      
      if (!soundData || !soundData.downloadUrl) {
        throw new Error(`Failed to get sound URL from Freesound API`);
      }
      
      // Create new sound instance
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundData.downloadUrl },
        { shouldPlay: false, isLooping: false }
      );
      
      // Wait for sound to be fully loaded and get duration
      // Audio metadata (duration) may take a moment to load from streaming URI
      let duration: number | null = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!duration && attempts < maxAttempts) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          duration = status.durationMillis;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`[CROSSFADE] Waiting for audio metadata... (attempt ${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms between attempts
        }
      }
      
      if (!duration) {
        throw new Error('Could not get sound duration after multiple attempts');
      }
      
      // Nature sounds: simple 3s overlap, no fading (ambient sounds) - longer overlap hides loop point better
      // Other sounds: 2s crossfade with fade in/out (breathing, ticking)
      const isNature = soundDef.category === 'nature';
      const overlapDuration = isNature ? 3000 : 2000; // 3s for nature, 2s for breathing/ticking
      const nextInstanceDelay = Math.max(0, duration - overlapDuration);
      
      console.log(`[CROSSFADE] ${soundDef.category.toUpperCase()} sound - Duration: ${(duration/1000).toFixed(1)}s, overlap: ${overlapDuration}ms, next at: ${(nextInstanceDelay/1000).toFixed(1)}s`);
      
      // Add to instances
      this.crossfadeLoops[soundId].instances.push(sound);
      
      // Start playback
      if (isFirst) {
        if (isNature) {
          // Nature sounds: NO FADE, start at full volume immediately
          await sound.setVolumeAsync(1);
          await sound.playAsync();
          console.log(`[CROSSFADE] ✅ First nature instance playing (NO FADE, full volume)`);
        } else {
          // First instance for breathing/ticking: fade in from 0
          await sound.setVolumeAsync(0);
          await sound.playAsync();
          this.fadeIn(sound, 1000);
          console.log(`[CROSSFADE] ✅ First instance playing, fading in`);
        }
      } else {
        if (isNature) {
          // Nature sounds: simple overlap, no fade (just play at full volume)
          await sound.setVolumeAsync(1);
          await sound.playAsync();
          console.log(`[CROSSFADE] ✅ Next instance playing (nature overlap, no fade)`);
        } else {
          // Breathing/Ticking: crossfade in
          await sound.setVolumeAsync(0);
          await sound.playAsync();
          this.fadeIn(sound, overlapDuration);
          console.log(`[CROSSFADE] ✅ Next instance playing, crossfading in`);
        }
      }
      
      // Schedule fade-out/stop for current instance
      if (!isNature) {
        // Non-nature sounds: fade out during crossfade
        const fadeTimer = setTimeout(async () => {
          try {
            console.log(`[CROSSFADE] ⬇️ Fading out current instance for ${soundId}`);
            await this.fadeOut(sound, overlapDuration);
          } catch (error) {
            console.log(`[CROSSFADE] Error fading out:`, error);
          }
        }, nextInstanceDelay);
        
        if (this.crossfadeLoops[soundId]) {
          this.crossfadeLoops[soundId].scheduledTimers.push(fadeTimer);
        }
      }
      // Nature sounds don't fade out - they just overlap and stop naturally
      
      // Schedule next instance before this one ends (at the same time fade-out starts)
      const nextInstanceTimer = setTimeout(async () => {
        if (this.crossfadeLoops[soundId] && this.crossfadeLoops[soundId].active) {
          console.log(`[CROSSFADE] ⏰ Time to start next instance for ${soundId}`);
          await this.playNextCrossfadeInstance(soundId, soundDef, false);
        }
      }, nextInstanceDelay);
      
      if (this.crossfadeLoops[soundId]) {
        this.crossfadeLoops[soundId].scheduledTimers.push(nextInstanceTimer);
      }
      
      // Schedule cleanup AFTER fade-out completes
      const cleanupTimer = setTimeout(async () => {
        try {
          // Unload after playback complete
          await sound.unloadAsync();
          
          // Remove from instances array
          if (this.crossfadeLoops[soundId]) {
            const index = this.crossfadeLoops[soundId].instances.indexOf(sound);
            if (index > -1) {
              this.crossfadeLoops[soundId].instances.splice(index, 1);
            }
          }
          
          console.log(`[CROSSFADE] Cleaned up instance for ${soundId}`);
        } catch (error) {
          console.log(`[CROSSFADE] Error cleaning up instance:`, error);
        }
      }, duration + 100); // Small buffer after sound ends
      
      if (this.crossfadeLoops[soundId]) {
        this.crossfadeLoops[soundId].scheduledTimers.push(cleanupTimer);
      }
      
    } catch (error) {
      console.log(`[CROSSFADE] ❌ Error playing instance for ${soundId}:`, error);
    }
  }

  private fadeIn(sound: Audio.Sound, duration: number) {
    const steps = 20; // Number of volume steps
    const stepDuration = duration / steps;
    const volumeIncrement = 1 / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(async () => {
      currentStep++;
      const newVolume = Math.min(currentStep * volumeIncrement, 1);
      
      try {
        await sound.setVolumeAsync(newVolume);
      } catch (error) {
        clearInterval(fadeInterval);
      }
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  private async scheduleFadeOutBeforeEnd(soundId: string, sound: Audio.Sound, fadeOutDuration: number): Promise<void> {
    try {
      // Get the sound's duration
      const status = await sound.getStatusAsync();
      
      if (status.isLoaded && status.durationMillis) {
        const soundDuration = status.durationMillis;
        const soundDurationSec = (soundDuration / 1000).toFixed(1);
        const fadeOutSec = (fadeOutDuration / 1000).toFixed(1);
        
        // Calculate when to start fade-out (duration - fadeOutDuration)
        // Ensure we don't start fading immediately if sound is shorter than fade duration
        const fadeStartTime = Math.max(0, soundDuration - fadeOutDuration);
        const fadeStartSec = (fadeStartTime / 1000).toFixed(1);
        
        if (fadeStartTime > 0) {
          console.log(`[F12 DEBUG] SoundService: Sound duration: ${soundDurationSec}s, Fade: ${fadeOutSec}s, Will start fade at: ${fadeStartSec}s`);
          console.log(`[F12 DEBUG] SoundService: Scheduling fade-out timer for ${soundId}`);
          
          // Clear any existing timer for this sound
          if (this.fadeOutTimers[soundId]) {
            clearTimeout(this.fadeOutTimers[soundId]);
            console.log(`[F12 DEBUG] SoundService: Cleared previous fade timer for ${soundId}`);
          }
          
          // Schedule the fade-out
          this.fadeOutTimers[soundId] = setTimeout(async () => {
            console.log(`[F12 DEBUG] ⏰ Fade timer fired! Starting ${fadeOutSec}s fade-out for ${soundId}`);
            await this.fadeOut(sound, fadeOutDuration);
            console.log(`[F12 DEBUG] ✅ Fade-out complete for ${soundId}`);
            
            // CRITICAL: Stop and unload sound after fade completes to prevent harsh cutoff
            try {
              console.log(`[F12 DEBUG] Stopping and unloading ${soundId}...`);
              await sound.stopAsync();
              await sound.unloadAsync();
              delete this.sounds[soundId];
              this.currentlyPlaying.delete(soundId);
              console.log(`[F12 DEBUG] ✅✅✅ ${soundId} CLEANLY STOPPED - NO CUTOFF EXPECTED`);
            } catch (error) {
              console.log(`[F12 DEBUG] ❌ Error stopping ${soundId} after fade:`, error);
            }
            
            delete this.fadeOutTimers[soundId];
          }, fadeStartTime);
        } else {
          console.log(`[F12 DEBUG] ⚠️ Sound ${soundId} (${soundDurationSec}s) is shorter than fade (${fadeOutSec}s), skipping scheduled fade`);
        }
      }
    } catch (error) {
      console.log(`[F12 DEBUG] ❌ Error scheduling fade-out for ${soundId}:`, error);
    }
  }

  async stopSound(soundId: string) {
    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    const soundName = soundDef ? soundDef.title : soundId;
    
    console.log(`SoundService: 🛑 Stopping ${soundName}...`);
    
    // Clear any pending fade-out timer
    if (this.fadeOutTimers[soundId]) {
      clearTimeout(this.fadeOutTimers[soundId]);
      delete this.fadeOutTimers[soundId];
      console.log(`SoundService: Cleared pending fade-out timer for ${soundName}`);
    }
    
    // Stop crossfade loop if active
    if (this.crossfadeLoops[soundId]) {
      console.log(`[CROSSFADE] Stopping crossfade loop for ${soundName}`);
      this.crossfadeLoops[soundId].active = false;
      
      // CRITICAL: Clear all scheduled timers first to prevent new instances from starting
      console.log(`[CROSSFADE] Clearing ${this.crossfadeLoops[soundId].scheduledTimers.length} scheduled timers`);
      for (const timer of this.crossfadeLoops[soundId].scheduledTimers) {
        clearTimeout(timer);
      }
      this.crossfadeLoops[soundId].scheduledTimers = [];
      
      // Stop and unload all instances
      for (const sound of this.crossfadeLoops[soundId].instances) {
        try {
          await this.fadeOut(sound, 1000);
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.log(`[CROSSFADE] Error stopping instance:`, error);
        }
      }
      
      delete this.crossfadeLoops[soundId];
      console.log(`[CROSSFADE] ✅ Crossfade loop stopped`);
    }
    
    try {
      if (this.sounds[soundId]) {
        console.log(`SoundService: Found sound in cache, stopping...`);
        const sound = this.sounds[soundId];
        
        // Get current status to check if it's actually playing
        const status = await sound.getStatusAsync();
        console.log(`SoundService: Sound status:`, status.isLoaded ? 'loaded' : 'not loaded', status.isLoaded && status.isPlaying ? 'playing' : 'not playing');
        
        // Fade out and stop if playing
        if (status.isLoaded && status.isPlaying) {
          await this.fadeOut(sound, 1000);
          await sound.stopAsync();
          console.log(`SoundService: ✅ Stopped playback with fade out`);
        }
        
        // Unload to free resources
        await sound.unloadAsync();
        console.log(`SoundService: ✅ Unloaded from memory`);
        
        delete this.sounds[soundId];
      } else {
        console.log(`SoundService: ⚠️ Sound not found in cache (may have already been stopped)`);
      }
      
      this.currentlyPlaying.delete(soundId);
      console.log(`SoundService: ✅ ${soundName} fully stopped`);
    } catch (error) {
      console.log(`SoundService: ❌ Error stopping ${soundName}:`, error);
      // Force remove from tracking even if stop failed
      this.currentlyPlaying.delete(soundId);
      if (this.sounds[soundId]) {
        delete this.sounds[soundId];
      }
    }
  }

  private async fadeOut(sound: Audio.Sound, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const steps = 20; // Number of volume steps
      const stepDuration = duration / steps;
      const volumeDecrement = 1 / steps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(async () => {
        currentStep++;
        const newVolume = Math.max(1 - (currentStep * volumeDecrement), 0);
        
        try {
          await sound.setVolumeAsync(newVolume);
        } catch (error) {
          clearInterval(fadeInterval);
          resolve();
        }
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepDuration);
    });
  }

  async forceStopAll() {
    console.log('SoundService: Force stopping all sounds');
    
    // Clear all fade-out timers first
    for (const soundId in this.fadeOutTimers) {
      clearTimeout(this.fadeOutTimers[soundId]);
      delete this.fadeOutTimers[soundId];
    }
    
    // Stop all crossfade loops
    for (const soundId in this.crossfadeLoops) {
      console.log(`[CROSSFADE] Force stopping crossfade loop for ${soundId}`);
      this.crossfadeLoops[soundId].active = false;
      
      // CRITICAL: Clear ALL scheduled timers to prevent new instances
      console.log(`[CROSSFADE] Clearing ${this.crossfadeLoops[soundId].scheduledTimers.length} scheduled timers for ${soundId}`);
      for (const timer of this.crossfadeLoops[soundId].scheduledTimers) {
        clearTimeout(timer);
      }
      this.crossfadeLoops[soundId].scheduledTimers = [];
      
      for (const sound of this.crossfadeLoops[soundId].instances) {
        try {
          await sound.setVolumeAsync(0);
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.log(`[CROSSFADE] Error force stopping instance:`, error);
        }
      }
      
      delete this.crossfadeLoops[soundId];
    }
    
    // Create array copy to avoid modification during iteration
    const soundsToStop = Array.from(this.currentlyPlaying);
    
    for (const soundId of soundsToStop) {
      try {
        if (this.sounds[soundId]) {
          // Immediately mute the sound first (instant silence)
          try {
            await this.sounds[soundId].setVolumeAsync(0);
          } catch (volumeError) {
            console.log(`SoundService: Could not set volume for ${soundId}:`, volumeError);
          }
          
          // Then stop and unload
          await this.sounds[soundId].stopAsync();
          await this.sounds[soundId].unloadAsync();
          delete this.sounds[soundId];
        }
      } catch (error) {
        console.log(`SoundService: Error force stopping ${soundId}:`, error);
        // Force cleanup even on error
        if (this.sounds[soundId]) {
          try {
            await this.sounds[soundId].unloadAsync();
          } catch (unloadError) {
            console.log(`SoundService: Error unloading ${soundId}:`, unloadError);
          }
          delete this.sounds[soundId];
        }
      }
    }
    
    this.currentlyPlaying.clear();
    console.log('SoundService: All sounds stopped and unloaded');
  }

  async setMasterEnabled(enabled: boolean) {
    console.log('SoundService: Setting master enabled to', enabled);
    this.masterEnabled = enabled;
    if (!enabled) {
      await this.forceStopAll();
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
