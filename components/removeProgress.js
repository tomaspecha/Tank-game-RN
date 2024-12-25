import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {clearAllGameData} from '../utils/async-storage';

/**
 * RemoveProgress is a React functional component that renders a confirmation dialog for clearing all game data.
 *
 * @param {Object} props
 * @param {Function} props.onCancel - Callback function to handle the cancellation of the action.
 * @param {Function} props.onConfirm - Callback function to confirm the clearing of game data.
 * @param {Function} props.onResetGameState - Callback function to reset the game state after clearing the data.
 *
 * The component contains buttons to either confirm or cancel the action. Upon confirmation, it attempts to clear
 * all game data and reset the game state.
 */
const RemoveProgress = ({ onCancel, onConfirm, onResetGameState }) => {
    const handleConfirmClear = async () => {
        try {
            console.log('Clearing all game data...');
            await clearAllGameData(onResetGameState);
            console.log('All game  data should be  cleared and game state reset.');
            onConfirm();
        } catch (error) {
            console.error('Failed to clear high scores and reset game state:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.warningText}>
                Are you sure you want to clear the score and level saved progress?
            </Text>
            <Text style={styles.warningText}>This action cannot be undone.</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.noButton]} onPress={onCancel}>
                    <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={handleConfirmClear}>
                    <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/**
 * An object containing styles for a React Native component.
 */
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(83,81,81,0.8)',
        padding: 20,
        borderRadius: 10,
    },
    warningText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#D8A422',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    noButton: {
        backgroundColor: '#91c65c',
    },
    yesButton: {
        backgroundColor: '#df0909',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default RemoveProgress;
