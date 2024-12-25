import Sound from 'react-native-sound';

/**
 * Manages sound effects for an application.
 * Capabilities include loading, playing, stopping, and releasing sound resources.
 */
class SoundManager {
    constructor() {
        this.sounds = {};
        this.soundOn = true;
        console.log("SoundManager initialized from SoundManager.js");
    }

    // Method to load a sound file and store it in the sounds object
    loadSound(name, path) {
        return new Promise((resolve, reject) => {
            const sound = new Sound(path, (error) => {
                if (error) {
                    console.error(`Failed to load ${name} sound:`, error);
                    reject(error);
                } else {
                    console.log(`${name} sound loaded successfully`);
                    this.sounds[name] = sound;
                    resolve(sound);
                }
            });
        });
    }

    // Method to initialize all required sounds
    async initializeSounds() {
        try {
            await this.loadSound('shot', require('../assets/sounds/shot.wav'));
            await this.loadSound('explosion', require('../assets/sounds/explode.wav'));
            await this.loadSound('collision', require('../assets/sounds/hit.wav'));
            await this.loadSound('win', require('../assets/sounds/win.wav'));
            await this.loadSound('lose', require('../assets/sounds/lose.wav'));
            await this.loadSound('bonus', require('../assets/sounds/bonus.wav'));

            // Set volumes for each sound
            this.setVolume('shot', 1.0);
            this.setVolume('explosion', 1.0);
            this.setVolume('collision', 1.0);
            this.setVolume('win', 1.0);
            this.setVolume('lose', 1.0);
            this.setVolume('bonus', 1.0);
        } catch (error) {
            console.error('Error initializing sounds:', error);
        }
    }

    // Method to set the volume for a specific sound
    setVolume(name, volume) {
        if (this.sounds[name]) {
            this.sounds[name].setVolume(volume);
        }
    }

    // Method to play a sound
    playSound(name) {
        if (this.soundOn && this.sounds[name]) {
            console.log(`Playing ${name} sound`);
            this.sounds[name].stop(); // Stop any ongoing playback
            this.sounds[name].play((success) => {
                if (!success) {
                    console.log(`${name} sound playback failed`);
                }
            });
        }
    }

    // Method to toggle sound on or off
    // Method to toggle sound on or off
    setSoundOn(isOn) {
        this.soundOn = isOn;
        console.log(`SoundManager: Sound is now ${isOn ? 'On' : 'Off'}`);
    }


    // Method to stop a specific sound
    stopSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].stop();
        }
    }

    // Method to release a specific sound from memory
    releaseSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].release();
            delete this.sounds[name];
        }
    }

    // Method to release all sounds from memory
    releaseAllSounds() {
        for (const name in this.sounds) {
            if (this.sounds.hasOwnProperty(name)) {
                this.sounds[name].release();
            }
        }
        this.sounds = {};
    }
}

// Initialize sounds after creating an instance
/**
 * Instance of the SoundManager class responsible for handling all sound-related functionalities
 * in the application. This includes playing, pausing, stopping sounds, and managing sound settings
 * like volume and balance.
 *
 * The SoundManager class provides methods to manage audio assets and control playback. This
 * instance should be used whenever sound operations are required, ensuring a single point of
 * control for audio within the app.
 */
const soundManagerInstance = new SoundManager();
soundManagerInstance.initializeSounds()
    .then(() => {
        console.log("All sounds loaded successfully");
    })
    .catch((error) => {
        console.error("Error loading sounds", error);
    });

export default soundManagerInstance;
