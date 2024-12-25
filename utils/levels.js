import Matter from 'matter-js';
import Tank from '../entities/tank';

/**
 * Calculates the Euclidean distance between two points in a 2D plane.
 *
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} The distance between the two points.
 */
const calculateDistance = (x1, y1, x2, y2) => {
    try {
        return Math.sqrt((x2 - x1) ** 2 + (y1 - y2) ** 2);
    } catch (error) {
        console.error('Error in calculateDistance:', error);
        return 0;
    }
};

// Constants for minimum distance calculations
/**
 * Specifies the initial minimum distance as a percentage.
 * This value is used to determine the minimum distance between elements at the start of a calculation or process.
 * The percentage is represented as a decimal number between 0 and 1.
 * For example, a value of 0.85 represents 85%.
 */
const initialMinDistancePercentage = 0.85;  // Start with 75% of screen size
/**
 * Represents the minimum distance percentage threshold used to determine
 * the allowable proximity between points, elements, or objects in a given context.
 * This value is typically used to ensure that entities do not become too close
 * to one another, maintaining a specific minimum distance expressed as a percentage.
 *
 * @type {number}
 */
const minDistancePercentage = 0.45;  // Minimum 35% of screen size
/**
 * Specifies the rate at which a certain level decreases over time or interactions.
 * This rate is expressed as a decimal representing a percentage.
 *
 * Example:
 * A value of 0.02 indicates a 2% reduction rate per specified interaction or time unit.
 */
const levelReductionRate = 0.02;  // Reduce by 2% every 3rd level
/**
 * Represents the minimum distance that must be maintained between enemy entities in the game.
 * This value is used to ensure that enemies do not overlap or collide with each other,
 * providing a smoother gameplay experience.
 *
 * @type {number}
 */
const minDistanceBetweenEnemies = 50;  // Increased distance between enemies

/**
 * Checks if a specific position is valid within the game boundaries,
 * considering the distance to the tank and other enemies.
 *
 * @param {number} x - The x-coordinate of the position to be checked.
 * @param {number} y - The y-coordinate of the position to be checked.
 * @param {Object} existingEnemies - The dictionary of existing enemy entities.
 * @param {Object} tankPosition - The current position of the tank.
 * @param {Object} appDimensions - The dimensions of the application/game area.
 * @param {number} minDistanceToTank - The minimum allowed distance from the position to the tank.
 * @returns {boolean} - Returns true if the position is valid, otherwise false.
 */
const isValidPosition = (x, y, existingEnemies, tankPosition, appDimensions, minDistanceToTank) => {
    // Check if the position is within the game boundaries
    if (x < 0 || x > appDimensions.width || y < 0 || y > appDimensions.height) {
        return false;
    }

    // Check distance from tank
    if (calculateDistance(x, y, tankPosition.x, tankPosition.y) < minDistanceToTank) {
        return false;
    }

    // Check distance from other enemies
    for (let key in existingEnemies) {
        const enemy = existingEnemies[key];
        if (calculateDistance(x, y, enemy.body.position.x, enemy.body.position.y) < minDistanceBetweenEnemies) {
            return false;
        }
    }

    return true;
};

/**
 * Generates a set of enemy entities for a given level.
 *
 * @param {number} level - The current level of the game.
 * @param {object} appDimensions - An object defining the dimensions of the application window (width and height).
 * @param {object} engine - The physics engine used for simulating the game world.
 * @param {object} tankPosition - The current position of the player's tank.
 * @returns {object} An object containing the generated enemy entities.
 *
 * @throws {Error} Throws an error if the enemy generation process fails.
 */
export const generateEnemies = (level, appDimensions, engine, tankPosition) => {
    try {
        let enemies = {};
        const baseEnemyCount = 1;
        const maxEnemies = 3;
        const enemyIncreaseRate = 1;
        const numberOfEnemies = Math.min(baseEnemyCount + Math.floor((level - 1) / 2) * enemyIncreaseRate, maxEnemies);

        const baseHealth = 100;
        const healthIncreaseRate = 2;
        const enemyHealth = baseHealth + Math.floor((level - 1) / 1) * healthIncreaseRate;

        const maxAttempts = 10;

        // Calculate dynamic minimum distance based on screen size and level
        const maxDistanceFromTank = Math.min(appDimensions.width, appDimensions.height) * initialMinDistancePercentage;
        const distanceReduction = Math.floor((level - 1) / 3) * levelReductionRate * Math.min(appDimensions.width, appDimensions.height);
        let minDistanceToTank = maxDistanceFromTank - distanceReduction;
        minDistanceToTank = Math.max(minDistanceToTank, minDistancePercentage * Math.min(appDimensions.width, appDimensions.height));

        // Log the calculated minimum distance
        const minDistancePercentage = (minDistanceToTank / Math.min(appDimensions.width, appDimensions.height)) * 100;
        console.log(`Level ${level}: Minimum distance from tank is set to ${minDistanceToTank} pixels (${minDistancePercentage.toFixed(2)}% of screen size).`);

        for (let i = 0; i < numberOfEnemies; i++) {
            let validPosition = false;
            let attempts = 0;
            let coordinateX, coordinateY;

            while (!validPosition && attempts < maxAttempts) {
                coordinateX = Math.floor(Math.random() * appDimensions.width);
                coordinateY = Math.floor(Math.random() * appDimensions.height);

                validPosition = isValidPosition(coordinateX, coordinateY, enemies, tankPosition, appDimensions, minDistanceToTank);
                attempts++;
            }

            if (validPosition) {
                enemies[`enemy_${i}`] = {
                    body: Matter.Bodies.rectangle(coordinateX, coordinateY, 64, 46),
                    color: 'red',
                    isStatic: true,
                    ai: true,
                    health: enemyHealth,
                    renderer: Tank,
                    lastBoundaryDirectionChangeTime: new Date().getTime()
                };
            } else {
                console.warn(`Failed to find a valid position for enemy ${i} after ${maxAttempts} attempts`);
            }
        }

        return enemies;
    } catch (error) {
        console.error('Error in generateEnemies:', error);
        return {};
    }
};

export default generateEnemies;
