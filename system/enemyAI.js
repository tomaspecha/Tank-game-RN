import Matter from 'matter-js';
import {handleShot} from '../utils/shooting';
import soundManager from '../utils/soundManager';

// Calculate the squared distance between two points
/**
 * Calculates the squared distance between two points in a 2D space.
 *
 * This function takes the coordinates of two points and returns the squared
 * distance between them. If an error occurs during the calculation, the
 * function will log the error to the console and return Infinity.
 *
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} - The squared distance between the two points, or Infinity if an error occurs.
 */
const calculateSquaredDistance = (x1, y1, x2, y2) => {
    try {
        return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    } catch (error) {
        console.error('Error calculating squared distance:', error);
        return Infinity;
    }
};

// Check if the entity is near the boundary of the screen
/**
 * Determines if an entity is within a margin boundary of the application's dimensions.
 *
 * @param {Object} appDimensions - The dimensions of the application.
 * @param {number} appDimensions.width - The width of the application.
 * @param {number} appDimensions.height - The height of the application.
 * @param {Object} entity - The entity whose boundary is to be checked.
 * @param {Object} entity.body - The body of the entity.
 * @param {Object} entity.body.position - The position of the entity's body.
 * @param {number} entity.body.position.x - The x-coordinate of the entity's body.
 * @param {number} entity.body.position.y - The y-coordinate of the entity's body.
 * @returns {boolean} - True if the entity is within the margin boundary, otherwise false.
 */
const calculateBoundaryLimit = (appDimensions, entity) => {
    try {
        const margin = 50;
        const {x, y} = entity.body.position;
        return x < margin || x > appDimensions.width - margin || y < margin || y > appDimensions.height - margin;
    } catch (error) {
        console.error('Error calculating boundary limit:', error);
        return false;
    }
};

// Generate a random direction for the enemy
/**
 * Generates a random direction vector.
 *
 * This function returns an object containing the x and y components of a unit vector pointing
 * in a random direction. It calculates a random angle and computes the corresponding
 * x (cosine) and y (sine) values.
 *
 * @returns {Object} An object with the properties `x` and `y`, representing the coordinates
 *                   of the direction vector:
 *                   - `x`: The x component of the direction vector, a number between -1 and 1.
 *                   - `y`: The y component of the direction vector, a number between -1 and 1.
 */
const randomDirection = () => {
    try {
        const angle = Math.random() * 2 * Math.PI;
        return {x: Math.cos(angle), y: Math.sin(angle)};
    } catch (error) {
        console.error('Error generating random direction:', error);
        return {x: 1, y: 0};
    }
};

// Keep the enemy within the bounds of the screen
/**
 * Ensures that a Matter.js body remains within the specified application dimensions.
 *
 * If the body's position goes beyond a specified margin from the edges of the app's dimensions,
 * the function repositions and applies a force to nudge the body towards the center. Additionally,
 * it uses Matter.js plugin wrap to allow entities to wrap around the screen.
 *
 * @param {Object} body - The Matter.js body to be contained within bounds.
 * @param {Object} appDimensions - The dimensions of the application.
 * @param {number} appDimensions.width - The width of the application.
 * @param {number} appDimensions.height - The height of the application.
 */
const keepWithinBounds = (body, appDimensions) => {
    try {
        const margin = 20;
        const speed = 1.5;
        const {x, y} = body.position;
        if (x < margin || x > appDimensions.width - margin || y < margin || y > appDimensions.height - margin) {
            Matter.Body.setPosition(body, {
                x: Math.max(margin, Math.min(appDimensions.width - margin, x)),
                y: Math.max(margin, Math.min(appDimensions.height - margin, y)),
            });
            Matter.Body.applyForce(body, body.position, {
                x: x < margin || x > appDimensions.width - margin ? Math.sign(appDimensions.width / 2 - x) * speed : 0,
                y: y < margin || y > appDimensions.height - margin ? Math.sign(appDimensions.height / 2 - y) * speed : 0,
            });
        }

        // Apply matter-wrap to ensure entities wrap around the screen
        body.plugin.wrap = {
            min: {x: 0, y: 0},
            max: {x: appDimensions.width, y: appDimensions.height}
        };
    } catch (error) {
        console.error('Error keeping enemy within bounds:', error);
    }
};

/**
 * Stores the timestamp of the last update.
 * The value is represented as the number of milliseconds
 * elapsed since January 1, 1970, 00:00:00 UTC.
 * Initialized to 0, indicating no updates have been recorded.
 */
let lastUpdate = 0;

/**
 * Updates the AI behavior of enemies within the game.
 *
 * This function is responsible for managing enemy movements, interactions, and decision-making processes
 * based on the player's position, difficulty level, and other game parameters. It includes logic to avoid
 * frequent updates to reduce computational load, adjusts difficulty as levels progress, and ensures that
 * enemies behave in a manner consistent with the game's mechanics.
 *
 * @param {Object} entities - The game entities, including enemies and the player tank.
 * @param {Object} param1 - An object containing the current time.
 * @param {Object} engine - The physics engine for handling movements.
 * @param {number} total - The total number of enemy entities.
 * @param {number} currentLevel - The current level of the game, affecting difficulty.
 * @param {boolean} soundOn - Flag indicating whether sound effects are enabled.
 */
const updateEnemyAI = (entities, {time}, engine, total, currentLevel, soundOn) => {
    try {
        const currentTime = time ? time.current : Date.now();

        // Debounce logic (adjust DEBOUNCE_INTERVAL directly here if needed)
        const DEBOUNCE_INTERVAL = 150;
        if (currentTime - lastUpdate < DEBOUNCE_INTERVAL) {
            return;
        }
        lastUpdate = currentTime;

        if (!entities || !entities.tank || typeof entities.getScreenDimension !== 'function') {
            console.error('Invalid entities object or required properties are missing');
            return;
        }

        const tank = entities.tank;
        const appDimensions = entities.getScreenDimension();

        // Dynamic minimum distance calculation
        const maxDistanceFromTank = Math.min(appDimensions.width, appDimensions.height) * 0.95;
        const distanceReduction = Math.floor((currentLevel - 1) / 3) * 0.02 * Math.min(appDimensions.width, appDimensions.height);
        let minDistanceFromTank = maxDistanceFromTank - distanceReduction;
        minDistanceFromTank = Math.max(minDistanceFromTank, 0.55 * Math.min(appDimensions.width, appDimensions.height));
        const minDistanceFromTankSquared = minDistanceFromTank * minDistanceFromTank;

        // Log the calculated minimum distance
        const minDistancePercentage = (minDistanceFromTank / Math.min(appDimensions.width, appDimensions.height)) * 100;
        console.log(`Level ${currentLevel}: Minimum distance for AI is set to ${minDistanceFromTank} pixels (${minDistancePercentage.toFixed(2)}% of screen size).`);

        // Difficulty scaling factors
        const baseSpeed = 0.95 * 0.5;
        const baseDetectionRadius = 200;
        const baseShootingRadius = 200;
        const baseShotDelay = 3000;

        const difficultyFactor = Math.floor((currentLevel - 1) / 3);
        const speed = baseSpeed * (1 + difficultyFactor * 0.31);
        const detectionRadius = baseDetectionRadius * (1 + difficultyFactor * 0.33);
        const shootingRadius = baseShootingRadius * (1 + difficultyFactor * 0.31);
        const shotDelay = baseShotDelay / (1 + difficultyFactor * 1.31);

        const detectionRadiusSquared = detectionRadius * detectionRadius;
        const shootingRadiusSquared = shootingRadius * shootingRadius;

        // List to keep track of entities to remove
        let entitiesToRemove = [];

        for (let i = 0; i <= total; i++) {
            try {
                let enemy = entities[`enemy_${i}`];

                if (!enemy || !enemy.body || !enemy.body.position) continue;

                if (enemy.health <= 0) {
                    entitiesToRemove.push(`enemy_${i}`);
                    soundManager.playSound('explosion');  // Play explosion sound when enemy is removed
                    continue;
                }

                const squaredDistanceToTank = calculateSquaredDistance(
                    tank.body.position.x, tank.body.position.y,
                    enemy.body.position.x, enemy.body.position.y
                );

                if (!enemy.lastShotTime) enemy.lastShotTime = 0;

                if (squaredDistanceToTank <= detectionRadiusSquared) {
                    const dx = tank.body.position.x - enemy.body.position.x;
                    const dy = tank.body.position.y - enemy.body.position.y;
                    const angle = Math.atan2(dy, dx);

                    const cosAngle = Math.cos(angle);
                    const sinAngle = Math.sin(angle);

                    Matter.Body.setAngle(enemy.body, angle);

                    if (squaredDistanceToTank <= shootingRadiusSquared && currentTime - enemy.lastShotTime > shotDelay) {
                        enemy.lastShotTime = currentTime;
                        handleShot(enemy, entities, currentTime, shotDelay, 'enemyShot', angle, engine, soundOn);
                    }

                    // Move towards the tank if distance is greater than minDistanceFromTank
                    const movementDirection = squaredDistanceToTank > minDistanceFromTankSquared ? 1 : 0;
                    Matter.Body.translate(enemy.body, {
                        x: movementDirection * speed * cosAngle,
                        y: movementDirection * speed * sinAngle
                    });
                } else {
                    if (!enemy.direction || calculateBoundaryLimit(appDimensions, enemy) || currentTime - (enemy.lastDirectionChangeTime || 0) > 5000) {
                        enemy.direction = randomDirection();
                        enemy.lastDirectionChangeTime = currentTime;
                    }

                    if (enemy.direction) {
                        const angle = Math.atan2(enemy.direction.y, enemy.direction.x);
                        const cosAngle = Math.cos(angle);
                        const sinAngle = Math.sin(angle);

                        Matter.Body.setAngle(enemy.body, angle);
                        Matter.Body.translate(enemy.body, {
                            x: speed * cosAngle,
                            y: speed * sinAngle
                        });
                    }
                }

                keepWithinBounds(enemy.body, appDimensions);
            } catch (error) {
                console.error(`Error updating enemy ${i}:`, error);
            }
        }

        // Remove entities marked for deletion
        entitiesToRemove.forEach(entityKey => {
            Matter.World.remove(engine.world, entities[entityKey].body);
            delete entities[entityKey];
        });

    } catch (error) {
        console.error('Error in updateEnemyAI:', error);
    }
};

export {keepWithinBounds, updateEnemyAI};
