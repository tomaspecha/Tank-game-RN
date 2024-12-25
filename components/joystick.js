import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PanGestureHandler, State, TouchableOpacity} from 'react-native-gesture-handler';
import * as ScreenOrientation from 'expo-screen-orientation';


/**
 * Joystick functional component responsible for handling user input
 * through a joystick and shoot button interface.
 *
 * @param {Object} props - Props passed to the component.
 * @param {function} props.controlEngine - Function to control the engine movement based on joystick input.
 * @param {function} props.controlBullet - Function to control bullet actions like shooting.
 * @param {Object} props.joystickRef - Reference to the joystick handler for gesture events.
 * @param {Object} props.shootButtonRef - Reference to the shoot button for press events.
 */
const Joystick = ({controlEngine, controlBullet, joystickRef, shootButtonRef}) => {
    const [position, setPosition] = useState({x: 0, y: 0});

    useEffect(() => {
        // Lock orientation to landscape
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        };
        lockOrientation();

        return () => {
            try {
                controlBullet(null);
            } catch (error) {
                console.error('Error resetting bullet control on unmount:', error);
            }
        };
    }, []);

    const handlePanGestureEvent = (event) => {
        try {
            const {translationX, translationY} = event.nativeEvent;
            const newX = Math.max(-50, Math.min(translationX, 50));
            const newY = Math.max(-50, Math.min(translationY, 50));
            setPosition({x: newX, y: newY});
            handleMovement(newX, newY);
        } catch (error) {
            console.error('Error handling pan gesture event:', error);
        }
    };

    const handlePanStateChange = (event) => {
        try {
            if (event.nativeEvent.state === State.END) {
                setPosition({x: 0, y: 0});
                controlEngine(null);
            }
        } catch (error) {
            console.error('Error handling pan state change:', error);
        }
    };

    const handleMovement = (dx, dy) => {
        try {
            const threshold = 10; // Sensitivity
            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                const angle = Math.atan2(dy, dx);
                controlEngine({type: 'move', angle});
            } else {
                controlEngine(null);
            }
        } catch (error) {
            console.error('Error handling movement:', error);
        }
    };

    const handleShootPressIn = () => {
        try {
            controlBullet("create-bullet");
        } catch (error) {
            console.error('Error handling shoot press in:', error);
        }
    };

    const handleShootPressOut = () => {
        try {
            controlBullet(null);
        } catch (error) {
            console.error('Error handling shoot press out:', error);
        }
    };

    return (
        <View style={styles.container}>
            <PanGestureHandler
                onGestureEvent={handlePanGestureEvent}
                onHandlerStateChange={handlePanStateChange}
                ref={joystickRef}
                simultaneousHandlers={shootButtonRef}
            >
                <View style={styles.joystickContainer}>
                    <View style={styles.joystickBase}>
                        <View
                            style={[styles.joystickHandle, {transform: [{translateX: position.x}, {translateY: position.y}]}]}
                        />
                    </View>
                </View>
            </PanGestureHandler>

            <TouchableOpacity
                style={styles.shootButton}
                onPressIn={handleShootPressIn}
                onPressOut={handleShootPressOut}
                ref={shootButtonRef}
                simultaneousHandlers={joystickRef}
            >
                <Text style={styles.shootButtonText}>Shoot</Text>
            </TouchableOpacity>
        </View>
    );
};

/**
 * Style configuration for the application.
 * Contains different style objects for various UI components.
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    joystickContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    joystickBase: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(200, 200, 200, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    joystickHandle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
        position: 'absolute',
    },
    shootButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20, // Adds space between joystick and shoot button
    },
    shootButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Joystick;
