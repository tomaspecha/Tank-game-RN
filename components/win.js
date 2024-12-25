import * as ScreenOrientation from 'expo-screen-orientation';
import React, {useEffect, useState} from 'react';
import {Dimensions, Image, PixelRatio, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Sound from 'react-native-sound';
import heartIcon from '../assets/icons/icons8-heart.gif';
import WinLoadingScreen from './winLoad';
import soundManager from '../utils/soundManager';

Sound.setCategory('Playback');

const {width, height} = Dimensions.get('window');

// Function to adjust text size based on screen width and height
const normalize = (size) => {
    return Math.round(PixelRatio.roundToNearestPixel((size * Math.min(width, height)) / 375));
};

const Button = ({title, onPress, style}) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const WinMenu = ({onContinue, onMainMenu, isGameOver, currentHealth, currentScore}) => {
    const [winSound, setWinSound] = useState(null);
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const [newHealth, setNewHealth] = useState(currentHealth + 50);
    const [soundOn, setSoundOn] = useState(soundManager.soundOn); // Local state for sound

    useEffect(() => {
        // Lock orientation to landscape
        const lockOrientation = async () => {
            try {
                console.log('Attempting to lock orientation to landscape...');
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                console.log('Orientation locked to landscape.');
            } catch (error) {
                console.error('Failed to lock orientation to landscape:', error);
            }
        };
        lockOrientation();

        // Check current orientation state
        const checkOrientation = async () => {
            const orientation = await ScreenOrientation.getOrientationAsync();
            console.log('Current orientation:', orientation);
        };
        checkOrientation();

        // Load and play sound only if soundOn is true
        if (soundOn) {
            const sound = new Sound(require("../assets/sounds/win.wav"), error => {
                if (error) {
                    console.log('Failed to load the sound', error);
                    return;
                }
                setWinSound(sound);
                sound.play(success => {
                    if (!success) {
                        console.log('Playback failed due to audio decoding errors');
                    }
                });
            });
        }

        // Cleanup on component unmount
        return () => {
            if (winSound) {
                winSound.release();
            }
            // No need to unlock orientation if you want to keep it in landscape
        };
    }, [soundOn]); // Dependency on soundOn

    const handleToggleSound = () => {
        setSoundOn(!soundOn); // Toggle sound state
        soundManager.setSoundOn(!soundOn); // Update soundManager
    };

    const handleLoadingComplete = () => {
        setShowLoadingScreen(false);
    };

    if (showLoadingScreen) {
        return <WinLoadingScreen onLoadingComplete={handleLoadingComplete}/>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>You Win!</Text>
            <Image source={heartIcon} style={styles.heartIcon}/>
            <Text style={styles.healthText}>Health increases per next level: +50</Text>
            <Text style={styles.newHealthText}>New Health: {newHealth}</Text>
            <Text style={styles.scoreText}>Score made so far: {currentScore}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Next Level" onPress={onContinue} style={styles.continueButton}/>
                <Button title="Main Menu" onPress={onMainMenu} style={styles.mainMenuButton}/>

                {/*<Button title={soundOn ? "Sound Off" : "Sound On"} onPress={handleToggleSound} style={styles.toggleSoundButton} />*/}
            </View>
        </SafeAreaView>
    );
};

// Styles for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        width: '100%', // Use full width
        height: '100%', // Use full height
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        paddingHorizontal: 20,
    },
    button: {
        width: '45%',
        padding: normalize(10),
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1.5,
        borderColor: '#D8A422',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
        flexShrink: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: normalize(24),
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
        flexShrink: 1,
    },
    title: {
        fontSize: normalize(36), // Normalized for screen size
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 30,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
        textAlign: 'center',
    },
    heartIcon: {
        width: normalize(70),
        height: normalize(70),
        marginBottom: 10,
        resizeMode: 'cover',
        flexShrink: 1,
    },
    healthText: {
        fontSize: normalize(18),
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
        flexShrink: 1,
    },
    newHealthText: {
        fontSize: normalize(18),
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
        flexShrink: 1,
    },
    scoreText: {
        fontSize: normalize(18),
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        flexShrink: 1,
    },
    continueButton: {
        backgroundColor: '#043704',
    },
    mainMenuButton: {
        backgroundColor: '#c6615c',
    },
    toggleSoundButton: {
        backgroundColor: '#555',
        borderWidth: 2,
        borderColor: '#D8A422',
    },
});

export default WinMenu;
