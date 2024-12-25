import React, {useEffect} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

/**
 * HighScoreMenu is a React functional component that displays a list of high scores.
 *
 * @param {function} onGoBack - Callback function to be executed when the "Back" button is pressed.
 * @param {Array<Object>} highScores - Array of high score objects, each containing user_id and score.
 * @param {function} clearAllGameData - Callback function to be executed when the "Clear Scores" button is pressed.
 *
 * This component uses a FlatList to render the high scores, with each score displayed along with its rank.
 * It also locks the orientation to portrait mode upon mounting.
 *
 * The component's UI includes:
 * - A title indicating the high scores section.
 * - A list of high scores, showing a "No high scores yet!" message when the list is empty.
 * - Two buttons: "Back" to go back and "Clear Scores" to clear the high score records.
 */
const HighScoreMenu = ({onGoBack, highScores, clearAllGameData}) => {
    useEffect(() => {
        // Lock orientation to portrait permanently
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        };
        lockOrientation();

        // No cleanup function to unlock orientation on unmount
    }, []); // Empty dependency array to run only once on component mount

    const renderItem = ({item, index}) => (
        <View style={styles.scoreItem}>
            <Text style={styles.rank}>{item.user_id}.</Text>
            <Text style={styles.score}>{item.score}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>High Scores</Text>
            <FlatList
                data={highScores}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => <Text style={styles.noScores}>No high scores yet!</Text>}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onGoBack}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={clearAllGameData}>
                    <Text style={styles.buttonText}>Clear Scores</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/**
 * Object containing styling properties used throughout the application.
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
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#D8A422',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
        textAlign: 'center',
    },
    scoreItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        padding: 10,
        backgroundColor: '#000',
        borderRadius: 8,
        marginVertical: 5,
        borderWidth: 2,
        borderColor: '#D8A422',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    rank: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D8A422',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    score: {
        fontSize: 18,
        color: '#fff',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    noScores: {
        fontSize: 18,
        color: '#aaa',
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
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
});

export default HighScoreMenu;
