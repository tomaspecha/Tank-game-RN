import Matter from 'matter-js';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

/**
 * Boost component that renders an animated heart SVG graphic.
 * The heart animates with a fade-in and fade-out effect in a continuous loop.
 *
 * @param {Object} props
 * @param {Object} props.position - The position of the Boost component on the screen.
 * @param {number} props.position.x - The x-coordinate for the Boost component.
 * @param {number} props.position.y - The y-coordinate for the Boost component.
 * @param {number} props.size - The size of the Boost component.
 */
const Boost = ({ position, size }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeAnim]);

    return (
        <Animated.View
            style={[
                styles.boostContainer,
                { left: position.x - size / 2, top: position.y - size / 2, opacity: fadeAnim },
            ]}
        >
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="heartGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                        <Stop offset="0%" stopColor="#FF6F61" />
                        <Stop offset="100%" stopColor="#FF3E3E" />
                    </LinearGradient>
                </Defs>
                <Path
                    d="M50 90
                       C25 70, 0 40, 0 20
                       C0 10, 10 0, 25 0
                       C40 0, 50 15, 50 15
                       C50 15, 60 0, 75 0
                       C90 0, 100 10, 100 20
                       C100 40, 75 70, 50 90
                       Z"
                    fill="url(#heartGradient)"
                    stroke="#FF0000"
                    strokeWidth="2"
                />
            </Svg>
        </Animated.View>
    );
};

/**
 * Checks if a given position is far enough from all walls in the provided entities.
 *
 * @param {Object} position - The position to check, containing x and y coordinates.
 * @param {number} size - The size of the object for which the position is being checked.
 * @param {Object} entities - The collection of entities that includes walls to check against.
 * @param {number} [minDistance=40] - The minimum distance required from the walls.
 * @returns {boolean} - True if the position is far enough from all walls, false otherwise.
 */
const isFarEnoughFromWalls = (position, size, entities, minDistance = 40) => {
    for (const key in entities) {
        if (key.startsWith('random_wall_') || key.startsWith('wall_')) {
            const wall = entities[key].body;
            const dx = position.x - wall.position.x;
            const dy = position.y - wall.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance + size / 2) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Spawns a boost in the game at a valid position within the provided dimensions and entity constraints.
 *
 * @param {object} engine - The game's physics engine.
 * @param {object} appDimensions - The dimensions of the game application.
 * @param {array} entities - The current entities in the game to avoid collisions when placing the boost.
 * @returns {object|null} A boost object containing its body, size, position, and renderer, or null if a valid position could not be found.
 */
export const spawnBoost = (engine, appDimensions, entities) => {
    const boostSize = 50;
    let position;
    let isValidPosition = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isValidPosition && attempts < maxAttempts) {
        position = {
            x: Math.random() * (appDimensions.width - boostSize) + boostSize / 2,
            y: Math.random() * (appDimensions.height - boostSize) + boostSize / 2,
        };

        isValidPosition = isFarEnoughFromWalls(position, boostSize, entities);
        attempts++;
    }

    if (!isValidPosition) {
        console.warn("Could not find a valid position for boost after", maxAttempts, "attempts");
        return null;
    }

    const boostBody = Matter.Bodies.rectangle(position.x, position.y, boostSize, boostSize, {
        isStatic: true,
        isSensor: true,
        label: 'boost',
    });

    return {
        body: boostBody,
        size: boostSize,
        position,
        renderer: <Boost position={position} size={boostSize} />,
    };
};

/**
 * A collection of styles used for styling components.
 * @typedef {Object} Styles
 * @property {Object} boostContainer - Style for the container providing a boost.
 * @property {string} boostContainer.position - CSS position property set to 'absolute'.
 */
const styles = StyleSheet.create({
    boostContainer: {
        position: 'absolute',
    },
});

export { Boost };

/**
 * The `handleBoostEffect` class is responsible for managing and applying boost effects
 * within the application. This includes updating the state and effects of boosts
 * when applied to entities.
 *
 * The class currently serves as a framework for boost management and can be expanded
 * to include more complex handling logic as the application's requirements evolve.
 */
export class handleBoostEffect {
    // This class can be expanded in the future if more complex boost handling logic is required.
}
