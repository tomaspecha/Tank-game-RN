import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {getCurrentLevelAndScore, getHighScores} from '../utils/async-storage';

/**
 * MenuWithOrientation is a functional component designed for a game menu interface with restricted orientation to portrait mode.
 * It includes options to start or continue a game, view high scores, access settings, and view credits.
 *
 * @param {Function} onStartGame - Callback function to start or continue the game.
 * @param {Function} onSettings - Callback function to open the settings menu.
 * @param {Function} onCredits - Callback function to view the credits section.
 * @param {Function} onShowHighScores - Callback function executed when showing high scores.
 */
const MenuWithOrientation = ({onStartGame, onSettings, onCredits, onShowHighScores}) => {
    const [highScores, setHighScores] = useState([]);
    const [showHighScores, setShowHighScores] = useState(false);
    const [hasSavedGame, setHasSavedGame] = useState(false);
    const {width, height} = useWindowDimensions();

    useEffect(() => {
        // Lock orientation to portrait permanently
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        };
        lockOrientation();
        const checkSavedGame = async () => {
            try {
                const savedGame = await getCurrentLevelAndScore();
                const savedHealth = await AsyncStorage.getItem('userHealth');

                // Check if there is a saved game with a level greater than 1 or a score greater than 0
                if ((savedGame.level && savedGame.level > 1) || (savedGame.score && savedGame.score > 0) || (savedHealth && savedHealth > 100)) {
                    setHasSavedGame(true);
                } else {
                    setHasSavedGame(false);
                }
            } catch (error) {
                console.error('Error checking saved game:', error);
            }
        };

        checkSavedGame();
    }, []);

    const handleHighScore = async () => {
        try {
            const scores = await getHighScores();
            setHighScores(scores);
            setShowHighScores(true);
            onShowHighScores();
        } catch (error) {
            console.error('Error loading high scores:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onStartGame}>
                    <Text style={styles.buttonText}>{hasSavedGame ? 'Continue' : 'Start Game'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleHighScore}>
                    <Text style={styles.buttonText}>High Score</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onSettings}>
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onCredits}>
                    <Text style={styles.buttonText}>Credits</Text>
                </TouchableOpacity>
            </View>

            {showHighScores && highScores.length > 0 && (
                <View style={styles.highScoreContainer}>
                    <Text style={styles.highScoreTitle}>Top 10 High Scores</Text>
                    {highScores.map((score, index) => (
                        <Text key={index} style={styles.highScoreText}>{score.user_id}. {score.score}</Text>
                    ))}
                </View>
            )}
        </View>
    );
};

/**
 * A collection of styles used in the application.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        padding: 20,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        width: 250,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#D8A422',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    highScoreContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    highScoreTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#D8A422',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    highScoreText: {
        fontSize: 18,
        color: '#fff',
    },
});

export default MenuWithOrientation;
