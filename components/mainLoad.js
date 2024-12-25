import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

/**
 * MainLoad is a functional component that simulates a loading screen.
 * It displays a progress bar that fills up over a minimum load time of
 * 5.5 seconds. Once the progress reaches 100%, the `onLoadingComplete`
 * callback is invoked.
 *
 * @param {Object} props - The props object.
 * @param {Function} props.onLoadingComplete - The callback function
 *   to be called when loading is complete.
 */
const MainLoad = ({ onLoadingComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const minLoadTime = 5500; // 5.5 seconds to simulate loading screen

        const timer = setInterval(() => {
            setProgress(prevProgress => {
                const newProgress = prevProgress + 5;
                if (newProgress >= 100) {
                    clearInterval(timer);
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime < minLoadTime) {
                        setTimeout(() => {
                            onLoadingComplete();
                        }, minLoadTime - elapsedTime);
                    } else {
                        onLoadingComplete();
                    }
                    return 100;
                }
                return newProgress;
            });
        }, 200); // Update progress every 200ms for smoother animation

        return () => clearInterval(timer);
    }, [onLoadingComplete]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar hidden={true} translucent={true} backgroundColor="transparent" />
            <ImageBackground
                source={require('../assets/background.png')}
                style={styles.container}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.overlay}>
                    <Text style={styles.title}>Tank Game</Text>
                    <Text style={styles.subtitle}>Created by T.P from Feb/2024 to July/2024</Text>
                    <Text style={styles.loadingText}>Loading...</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

/**
 * Object containing styles for UI components.
 */
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black', // Fallback color if the image doesn't cover the entire area
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(27,27,27,0.8)',
        padding: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#3faa16',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 10,
    },
    subtitle: {
        color: 'rgb(167,234,127)',
        fontSize: 22,
        textShadowColor: '#e2c2c2',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 30,
    },
    loadingText: {
        fontSize: 16,
        color: '#244898',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 20,
    },
    progressBarContainer: {
        height: 20,
        width: '80%',
        backgroundColor: 'transparent',  // Make it transparent
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: '#D8A422', // Optional: Add border to make it visible
        borderWidth: 1, // Optional: Border thickness
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#D8A422',
    },
    progressText: {
        fontSize: 18,
        color: '#302ab0',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginTop: 10,
    },
});

export default MainLoad;
