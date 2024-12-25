import Matter from 'matter-js';
import { Dimensions } from 'react-native';
import Wall from '../entities/wall';

/**
 * Holds the dimensions for an application.
 *
 * @type {object}
 * @property {number} width - The width of the application.
 * @property {number} height - The height of the application.
 * @property {string} unit - The unit of measurement for dimensions (e.g., 'px', 'em', 'rem').
 */
let appDimensions;
try {
    /**
     * Contains the width and height dimensions of the application.
     *
     * @typedef {Object} appDimensions
     * @property {number} width - The width of the application in pixels.
     * @property {number} height - The height of the application in pixels.
     */
    appDimensions = Dimensions.get('window');
} catch (error) {
    console.error("Error getting window dimensions:", error);
    /**
     * Calculates and returns the dimensions of the application layout.
     *
     * @param {number} width - The width of the application layout.
     * @param {number} height - The height of the application layout.
     * @param {number} margin - The margin size around the application layout.
     * @returns {{width: number, height: number, margin: number}} An object containing the width, height, and margin of the application.
     */
    appDimensions = { width: 800, height: 600 };
}

// Function to generate boundary walls, considering distance from tank, other walls, and boosts
/**
 * Function to generate boundary walls and random positioned walls within the application window.
 *
 * @param {Object} appDimensions - The dimensions of the application window.
 * @param {Object} tank - The tank object which should be considered for distance checks.
 * @param {Object} boost - The boost object which should be considered for distance checks.
 * @returns {Object} A collection of wall entities, including boundary walls and randomly placed walls.
 */
const generateBoundaryWalls = (appDimensions, tank, boost) => {
    try {
        const width = appDimensions.width;
        const height = appDimensions.height;

        // Helper function to create a wall entity
        const createWallEntity = (x, y, w, h, color = 'green', health = 100) => {
            try {
                return {
                    body: Matter.Bodies.rectangle(x, y, w, h, { isStatic: true, label: `random_wall_${x}_${y}` }),
                    color: color,
                    health: health,
                    renderer: Wall,
                };
            } catch (error) {
                console.error("Error creating wall entity:", error);
                return null;
            }
        };

        const randomWalls = {};

        // Function to check if a new wall is far enough from existing entities (tank, walls, boost)
        const isFarEnough = (newEntity, existingEntities, boost, minDistanceFromTank) => {
            try {
                const minDistance = 70; // Minimum distance from other walls

                // Check distance from the tank
                if (tank && tank.body) {
                    const dxTank = newEntity.position.x - tank.body.position.x;
                    const dyTank = newEntity.position.y - tank.body.position.y;
                    const distanceToTank = Math.sqrt(dxTank * dxTank + dyTank * dyTank);
                    if (distanceToTank < minDistanceFromTank) {
                        return false;
                    }
                }

                // Check distance from other walls
                for (const key in existingEntities) {
                    const entity = existingEntities[key].body;
                    const dx = newEntity.position.x - entity.position.x;
                    const dy = newEntity.position.y - entity.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minDistance) {
                        return false;
                    }
                }

                // Check distance from the boost
                if (boost && boost.body) {
                    const dxBoost = newEntity.position.x - boost.body.position.x;
                    const dyBoost = newEntity.position.y - boost.body.position.y;
                    const distanceToBoost = Math.sqrt(dxBoost * dxBoost + dyBoost * dyBoost);
                    if (distanceToBoost < minDistance + 80) {  // Adjusted distance for boost
                        return false;
                    }
                }

                return true;
            } catch (error) {
                console.error("Error checking distance:", error);
                return true;
            }
        };

        // Generate random walls within the screen dimensions
        for (let i = 0; i < 5; i++) {
            try {
                let randomX, randomY, newWall;
                let isValid = false;

                while (!isValid) {
                    randomX = Math.floor(Math.random() * (width - 64)) + 32;
                    randomY = Math.floor(Math.random() * (height - 46)) + 23;

                    newWall = Matter.Bodies.rectangle(randomX, randomY, 64, 46, { isStatic: true });
                    isValid = isFarEnough(newWall, randomWalls, boost, 160) &&  // Ensure minimum distance of 160 units from tank
                        randomX > 32 && randomX < width - 32 &&
                        randomY > 23 && randomY < height - 23;
                }

                randomWalls[`random_wall_${i}`] = createWallEntity(randomX, randomY, 64, 46, 'red');
            } catch (error) {
                console.error(`Error generating random wall ${i}:`, error);
            }
        }

        // Create boundary walls around the edges of the screen
        return {
            "wall_1": createWallEntity(width / 2, 5, width, 15, 'green'),
            "wall_2": createWallEntity(width / 2, height - 5, width, 15, 'green'),
            "wall_3": createWallEntity(5, height / 2, 15, height, 'green'),
            "wall_4": createWallEntity(width - 5, height / 2, 15, height, 'green'),
            ...randomWalls
        };
    } catch (error) {
        console.error("Error in generateBoundaryWalls:", error);
        return {};
    }
};

export { generateBoundaryWalls };
