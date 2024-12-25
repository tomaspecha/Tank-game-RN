import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

/**
 * Component for the game play menu.
 *
 * @param {Object} props - The props for the GamePlayMenu component.
 * @param {function} props.onResume - The function to be called when the Resume button is pressed.
 * @param {function} props.onMainMenu - The function to be called when the Main Menu button is pressed.
 * @param {function} props.onSettings - The function to be called when the Settings button is pressed.
 *
 * @returns {JSX.Element} The rendered GamePlayMenu component.
 */
const GamePlayMenu = ({ onResume, onMainMenu, onSettings }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Paused</Text>
            <TouchableOpacity style={styles.button} onPress={onResume}>
                <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onMainMenu}>
                <Text style={styles.buttonText}>Main Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onSettings}>
                <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
};

/**
 * The `styles` variable is an object that defines different styles using the `StyleSheet` API in React Native.
 *
 * @typedef {Object} Styles
 *
 * @property {Object} container - Style for a container element.
 * @property {number} container.flex - Flex value for the container element.
 * @property {string} container.justifyContent - Justify content value for the container element.
 * @property {string} container.alignItems - Align items value for the container element.
 * @property {string} container.backgroundColor - Background color value for the container element.
 * @property {number} container.padding - Padding value for the container element.
 *
 * @property {Object} title - Style for a title element.
 * @property {number} title.fontSize - Font size value for the title element.
 * @property {string} title.color - Color value for the title element.
 * @property {number} title.marginBottom - Bottom margin value for the title element.
 * @property {string} title.textShadowColor - Text shadow color value for the title element.
 * @property {Object} title.textShadowOffset - Text shadow offset value for the title element.
 * @property {number} title.textShadowOffset.width - Width value for the text shadow offset of the title element.
 * @property {number} title.textShadowOffset.height - Height value for the text shadow offset of the title element.
 * @property {number} title.textShadowRadius - Text shadow radius value for the title element.
 *
 * @property {Object} button - Style for a button element.
 * @property {string} button.backgroundColor - Background color value for the button element.
 * @property {number} button.paddingVertical - Vertical padding value for the button element.
 * @property {number} button.paddingHorizontal - Horizontal padding value for the button element.
 * @property {number} button.borderRadius - Border radius value for the button element.
 * @property {number} button.borderWidth - Border width value for the button element.
 * @property {string} button.borderColor - Border color value for the button element.
 * @property {number} button.margin - Margin value for the button element.
 * @property {number} button.width - Width value for the button element.
 * @property {string} button.alignItems - Align items value for the button element.
 * @property {string} button.shadowColor - Shadow color value for the button element.
 * @property {Object} button.shadowOffset - Shadow offset value for the button element.
 * @property {number} button.shadowOffset.width - Width value for the shadow offset of the button element.
 * @property {number} button.shadowOffset.height - Height value for the shadow offset of the button element.
 * @property {number} button.shadowOpacity - Shadow opacity value for the button element.
 * @property {number} button.shadowRadius - Shadow radius value for the button element.
 * @property {number} button.elevation - Elevation value for the button element.
 *
 * @property {Object} buttonText - Style for a text within a button element.
 * @property {string} buttonText.color - Color value for the text within a button element.
 * @property {number} buttonText.fontSize - Font size value for the text within a button element.
 * @property {string} buttonText.textShadowColor - Text shadow color value for the text within a button element.
 * @property {Object} buttonText.textShadowOffset - Text shadow offset value for the text within a button element.
 * @property {number} buttonText.textShadowOffset.width - Width value for the text shadow offset of the text within a button element.
 * @property {number} buttonText.textShadowOffset.height - Height value for the text shadow offset of the text within a button element.
 * @property {number} buttonText.textShadowRadius - Text shadow radius value for the text within a button element.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        padding: 10,
    },
    title: {
        fontSize: 32,
        color: '#D8A422',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    button: {
        backgroundColor: '#000000',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D8A422',
        margin: 10,
        width: 250,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default GamePlayMenu;
