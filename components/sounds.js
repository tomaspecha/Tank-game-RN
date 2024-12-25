import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import soundManager from '../utils/soundManager';

const Sounds = ({onGoBack}) => {
    const [isSoundOn, setIsSoundOn] = useState(soundManager.soundOn);

    // useEffect to handle sound toggle
    useEffect(() => {
        soundManager.setSoundOn(isSoundOn);
        console.log(`Sound is now ${isSoundOn ? 'On' : 'Off'}`);
    }, [isSoundOn]);

    const toggleSound = () => {
        setIsSoundOn(prevState => !prevState);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sound Settings</Text>
            <TouchableOpacity onPress={toggleSound}
                              style={[styles.button, isSoundOn ? styles.buttonOff : styles.buttonOn]}>
                <Text style={styles.buttonText}>{isSoundOn ? 'Sound Off' : 'Sound On'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 50,
        textShadowColor: '#000',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 5,
    },
    button: {
        width: '80%',
        maxWidth: 300,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#D8A422',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonOn: {
        backgroundColor: '#4caf50',
    },
    buttonOff: {
        backgroundColor: '#ff4c4c',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    backButton: {
        backgroundColor: '#3b3b3b',
        width: '80%',
        maxWidth: 300,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 2,
        borderColor: '#D8A422',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    }
});

export default Sounds;
