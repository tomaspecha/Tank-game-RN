import * as ScreenOrientation from 'expo-screen-orientation';
import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

/**
 * Represents a loading screen component that displays a message and an image for a certain duration.
 *
 * @component
 *
 * @param {{ onLoadingComplete: Function }} props - The props for the component.
 * @param {Function} props.onLoadingComplete - The callback function to be called when the loading is complete.
 *
 * @returns {JSX.Element} The rendered loading screen component.
 */
const WinLoadingScreen = ({onLoadingComplete}) => {
    useEffect(() => {
        // Lock screen orientation to landscape
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        };
        lockOrientation();

        const timer = setTimeout(() => {
            onLoadingComplete();
        }, 3000); // Display the loading screen for 3 seconds

        return () => {
            clearTimeout(timer); // Cleanup the timer on component unmount
            // Unlock screen orientation when this screen is unmounted
            ScreenOrientation.unlockAsync();
        };
    }, [onLoadingComplete]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Congratulations Well Done!</Text>
            <Image source={require('../assets/icons/icons8-heart.gif')} style={styles.heartIcon}/>
            <Text style={styles.text}> Well Done ! Added + 50 of health to your tank.</Text>
        </View>
    );
};

/**
 * An object containing styles for different components.
 *
 * @typedef {Object} Styles
 * @property {Object} container - Style for the container component.
 * @property {Object} title - Style for the title component.
 * @property {Object} heartIcon - Style for the heartIcon component.
 * @property {Object} text - Style for the text component.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 30,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
        textAlign: 'center',
    },
    heartIcon: {
        width: 70,
        height: 70,
        marginBottom: 20,
    },
    text: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
});

export default WinLoadingScreen;
