import * as ScreenOrientation from 'expo-screen-orientation';
import React, {useEffect, useState} from 'react';
import {Dimensions, Image, PixelRatio, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Sound from 'react-native-sound';
import {getCurrentLevelAndScore} from '../utils/async-storage';
import soundManager from '../utils/soundManager'; // Import soundManager to manage global sound state

const {width, height} = Dimensions.get('window');
const heartIcon = require('../assets/icons/icons8-heart.gif');

// Function to adjust text size based on screen width and height
/**
 * Normalizes a given size based on the dimensions of the device screen.
 *
 * The function takes a size value and scales it proportionally according to the
 * smaller dimension (width or height) of the device screen. The calculation uses
 * a base dimension of 375, ensuring consistent UI scaling.
 *
 * @param {number} size - The size value to be normalized.
 * @returns {number} - The normalized size value, rounded to the nearest pixel.
 */
const normalize = (size) => {
    return Math.round(PixelRatio.roundToNearestPixel((size * Math.min(width, height)) / 375));
};

/**
 * A functional React component that renders a customizable button.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.title - The text to be displayed on the button.
 * @param {function} props.onPress - The function to be called when the button is pressed.
 * @param {Object} [props.style] - Optional custom styles to be applied to the button.
 *
 * @returns {React.Element} The rendered button component.
 */
const Button = ({title, onPress, style}) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

/**
 * GameOverMenu component to display the game over screen.
 *
 * @param {function} onRetry - Function to call when the retry button is pressed.
 * @param {function} onMainMenu - Function to call when the main menu button is pressed.
 * @param {object} isGameOver - Ref object that indicates whether the game is over.
 * @param {number} currentScore - The score achieved in the current game.
 * @param {number} currentLevel - The level reached in the current game.
 *
 * @component
 *
 * @description
 * This component handles the game over state and provides options to retry the game or return to the main menu. The final level and score are displayed, and if enabled, a game-over sound is played. It also handles locking the screen orientation to landscape mode and synchronizes the sound state with a sound manager.
 */
const GameOverMenu = ({onRetry, onMainMenu, isGameOver, currentScore, currentLevel}) => {
    const [gameOverSound, setGameOverSound] = useState(null);
    const [level, setLevel] = useState(currentLevel || 1);
    const [finalScore, setFinalScore] = useState(currentScore);
    const [soundOn, setSoundOn] = useState(soundManager.soundOn); // Local state for sound

    useEffect(() => {
        isGameOver.current = true;

        // Lock orientation to landscape
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        };
        lockOrientation();

        const loadLevelAndScore = async () => {
            try {
                const {level, score} = await getCurrentLevelAndScore();
                if (level && level.level > 0) {
                    setLevel(level.level);
                }
                if (score !== null && score !== undefined) {
                    setFinalScore(score);
                }
            } catch (error) {
                console.error('Error loading level and score:', error);
                setLevel(currentLevel || 1);
                setFinalScore(currentScore);
            }
        };

        // Play game-over sound only if soundOn is true
        if (soundOn) {
            const sound = new Sound(require('../assets/sounds/lose.wav'), error => {
                if (error) {
                    console.error('Error loading sound:', error);
                    return;
                }
                setGameOverSound(sound);
                sound.play(success => {
                    if (!success) {
                        console.error('Sound playback failed in GAME OVER');
                    }
                });

                // Stop and release the sound after 2 seconds
                setTimeout(() => {
                    sound.stop(() => {
                        sound.release();
                    });
                }, 2000);
            });
        }

        loadLevelAndScore();

        return () => {
            if (gameOverSound) {
                gameOverSound.release();
            }
        }
    }, [soundOn]); // Dependency on soundOn to re-run when it changes

    const handleToggleSound = () => {
        setSoundOn(!soundOn); // Toggle sound state
        soundManager.setSoundOn(!soundOn); // Update soundManager
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Game Over</Text>
            <Image source={heartIcon} style={styles.heartIcon}/>
            <Text style={styles.healthText}>Final Health: 0</Text>
            <Text style={styles.scoreText}>Final Score: {finalScore}</Text>
            <Text style={styles.levelText}>Final Level: {level}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Retry" onPress={onRetry} style={styles.retryButton}/>
                <Button title="Main Menu" onPress={onMainMenu} style={styles.mainMenuButton}/>
                {/*<Button title={soundOn ? "Sound Off" : "Sound On"} onPress={handleToggleSound} style={styles.toggleSoundButton} />*/}
            </View>
        </SafeAreaView>
    );
};

/**
 * Styles for the application components.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: normalize(36),
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 20,
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
        textAlign: 'center',
    },
    heartIcon: {
        width: normalize(40),
        height: normalize(40),
        marginBottom: 20,
    },
    healthText: {
        fontSize: normalize(24),
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    scoreText: {
        fontSize: normalize(24),
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    levelText: {
        fontSize: normalize(24),
        color: '#fff',
        textAlign: 'center',
        marginBottom: 80,
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 40,
    },
    button: {
        width: '30%',
        padding: normalize(10),
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: '#D8A422',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    retryButton: {
        backgroundColor: '#007bff',
    },
    mainMenuButton: {
        backgroundColor: '#ff0000',
    },
    toggleSoundButton: {
        backgroundColor: '#555',
        borderWidth: 2,
        borderColor: '#D8A422',
    },
    buttonText: {
        color: 'white',
        fontSize: normalize(18),
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
});

export default GameOverMenu;
