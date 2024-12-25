import Matter from 'matter-js';
import {Dimensions} from 'react-native';
import Sound from 'react-native-sound';
import {spawnBoost} from '../utils/boost';
import {generateBoundaryWalls} from '../utils/boundaries_walls';
import generateEnemies from '../utils/levels';
import {handleShot} from '../utils/shooting';
import collisionSystem from '../utils/wallColision';
import {updateEnemyAI} from './enemyAI';

// Initialize screen dimensions
const {width, height} = Dimensions.get('window');

// Initialize sounds
/**
 * A collection of sound effects used in the application.
 * Each sound is loaded from the specified path and logs an error if loading fails.
 *
 * @type {Object}
 * @property {Sound} explosion - The sound effect triggered by explosions.
 * @property {Sound} collision - The sound effect triggered by collisions.
 */
const sounds = {
    explosion: new Sound(require('../assets/sounds/explode.wav'), (error) => {
        if (error) {
            console.error('Failed to load explosion sound:', error);
        }
    }),
    collision: new Sound(require('../assets/sounds/hit.wav'), (error) => {
        if (error) {
            console.error('Failed to load collision sound:', error);
        }
    }),
};

// Setup screen dimensions for the game world
/**
 * Configures the screen dimensions based on the provided entities object.
 *
 * This function attempts to retrieve screen dimensions from the `entities` object
 * using the `getScreenDimension` method. If the `entities` object is not provided
 * or if it lacks the `getScreenDimension` method, or if the retrieved dimensions
 * are invalid, default screen dimensions are returned.
 *
 * @param {Object} entities - An object potentially containing the method to get screen dimensions.
 * @returns {Object} An object with `min` and `max` properties representing screen boundaries.
 */
const setupScreenDimensions = (entities) => {
    if (!entities || typeof entities.getScreenDimension !== 'function') {
        console.warn("Entities object or getScreenDimension method is missing. Using default dimensions.");
        return {min: {x: 10, y: 10}, max: {x: width - 10, y: height - 10}};
    }

    const screenDimension = entities.getScreenDimension();
    if (screenDimension && screenDimension.width && screenDimension.height) {
        return {
            min: {x: 10, y: 10},
            max: {x: screenDimension.width - 10, y: screenDimension.height - 10}
        };
    } else {
        console.warn("Invalid screen dimensions, using default values.");
        return {min: {x: 10, y: 10}, max: {x: width - 10, y: height - 10}};
    }
};

// Setup collision events for the physics engine
/**
 * Initializes collision events for the given physics engine and associated entities.
 *
 * This function sets up a collision start event listener on the provided engine using the
 * Matter.js physics library. It ensures that the collision event listener is only initialized once.
 * Upon detecting a collision, it triggers the handleCollision function to process the event.
 *
 * @param {Object} engine - The physics engine instance to attach the collision event.
 * @param {Array} entities - The array of game entities involved in the collision detection.
 */
const setupCollisionEvents = (engine, entities) => {
    if (!engine.collisionInitialized) {
        engine.collisionInitialized = true;
        Matter.Events.on(engine, 'collisionStart', (event) => {
            try {
                handleCollision(event, entities, engine);
            } catch (error) {
                console.error("Error handling collision:", error);
            }
        });
    }
};

// Handle collision logic between entities
/**
 * Handles collision events between entities within the engine.
 *
 * @param {object} event - The collision event containing pairs of colliding bodies.
 * @param {object} entities - The entities involved in the collision, which also includes helper functions and game state.
 * @param {object} engine - The physics engine handling the entities and collision events.
 *
 * The function specifically looks for collisions between objects labeled as 'boost' and 'tank'.
 * When such a collision is detected, it invokes the `onBoostCollected` method (if defined)
 * and performs necessary cleanup actions including removal of the 'boost' object from the world,
 * clearing timers, and resetting necessary flags in the game state.
 *
 * If `onBoostCollected` is not a function, it logs an error.
 */
const handleCollision = (event, entities, engine) => {
    const pairs = event.pairs;

    pairs.forEach((pair) => {
        const {bodyA, bodyB} = pair;

        if ((bodyA.label === 'boost' && bodyB.label === 'tank') ||
            (bodyA.label === 'tank' && bodyB.label === 'boost')) {
            const boostBody = bodyA.label === 'boost' ? bodyA : bodyB;
            const tankBody = bodyA.label === 'tank' ? bodyA : bodyB;
            const tankEntity = entities[tankBody.id];

            console.log("Boost collision detected!");

            if (typeof entities.onBoostCollected === 'function') {
                entities.onBoostCollected(tankEntity);
                Matter.World.remove(engine.world, boostBody);
                delete entities['boost'];
                // Clear the boost removal timer when collected
                if (entities.boostRemoveTimer) {
                    clearTimeout(entities.boostRemoveTimer);
                    delete entities.boostRemoveTimer;
                }
                // Reset the boostSpawned flag
                entities.setCurrentLevel({...entities.getCurrentLevel(), boostSpawned: false});
            } else {
                console.error("onBoostCollected is not a function");
            }
        }
    });
};

// Main physics loop for the game
/**
 * Applies the physics logic and updates the state of various entities within the game.
 * This function handles the game state updates related to physics, boundaries,
 * entity generation, collision, and user controls.
 *
 * @param {Object} entities - The current state of all game entities.
 * @param {Object} param1 - Time-related information.
 * @param {boolean} soundOn - Flag indicating if sound effects should be enabled.
 * @returns {Object} - The updated state of all game entities.
 *
 * Updates included:
 * - Physics engine updates.
 * - Boundary and screen dimension handling.
 * - Orientation change handling.
 * - Enemy and boost generation logic.
 * - Boost removal after a specific time.
 * - Enemy AI update.
 * - Control state handling for tank movement and actions.
 * - Collision event setup.
 * - Boundary checks for tanks and enemies.
 * - Collision system integration.
 */
const Physics = (entities, {time}, soundOn) => {
    try {
        if (!entities || !entities.physics || !entities.physics.engine) {
            console.warn("Entities or physics engine is missing.");
            return entities;
        }

        const engine = entities.physics.engine;
        const bounds = entities.bounds || setupScreenDimensions(entities);
        entities.bounds = bounds;

        if (entities.getOrientationChange && entities.getOrientationChange()) {
            const generatedBoundaryWalls = generateBoundaryWalls(entities.getScreenDimension());
            entities.setOrientationChange(false);
            if (generatedBoundaryWalls) {
                entities.setBoundaryWalls(generatedBoundaryWalls, entities?.tank);
                entities = {...entities, ...entities.getBoundaryWalls()};
            }
        }


        const currentLevel = entities.getCurrentLevel ? entities.getCurrentLevel() : null;
        if (currentLevel && !currentLevel.generated) {
            const generatedEnemies = generateEnemies(currentLevel.level, entities.getScreenDimension(), engine, entities.onBoostCollected);
            if (generatedEnemies) {
                entities.setCurrentEnemies(generatedEnemies);
                const generatedBoundaryWalls = generateBoundaryWalls(entities.getScreenDimension(), entities?.tank);
                if (generatedBoundaryWalls) {
                    entities.setBoundaryWalls(generatedBoundaryWalls);
                    entities.setCurrentLevel({...currentLevel, generated: true, boostSpawned: false});
                }
            }
        }

        // Spawn boost only once per level
        if (currentLevel && currentLevel.generated && !currentLevel.boostSpawned && !currentLevel.permanentRemoved) {
            const boost = spawnBoost(engine, entities.getScreenDimension(), entities);
            if (boost) {
                entities['boost'] = boost;
                entities['boost'].spawnTime = time.current;
                entities.setCurrentLevel({...currentLevel, boostSpawned: true, permanentRemoved: false});
                console.log("Boost spawned:", boost);
            }
        }

        // remove booost ater given time
        if (entities['boost'] && time.current - entities['boost'].spawnTime > 20000) { // 20 seconds
            Matter.World.remove(engine.world, entities['boost'].body);
            delete entities['boost'];
            entities.setCurrentLevel({...entities.getCurrentLevel(), boostSpawned: false, permanentRemoved: true});
            console.log("Boost removed due to time");
        }


        Matter.Engine.update(engine, time.delta);

        entities = {...entities, ...entities.getCurrentEnemies(), ...entities.getBoundaryWalls()};

        if (checkAllEnemiesDefeated(entities)) {
            entities.setWin(true);
        }

        checkAndRemoveDepletedEnemies(entities);
        checkAndRemoveDepletedWalls(entities);

        updateEnemyAI(entities, {time}, engine, currentLevel ? currentLevel.level : 0, currentLevel ? currentLevel.level : 0, soundOn);

        const controlState = entities.getControlState ? entities.getControlState() : null;
        const bulletState = entities.getBulletState ? entities.getBulletState() : null;
        const tank = entities.tank;

        const moveSpeed = 1.3;
        const rotationSpeed = Math.PI / 60;

        if (controlState && tank) {
            if (controlState.type === 'move') {
                const {angle} = controlState;
                Matter.Body.setAngle(tank.body, angle);
                Matter.Body.translate(tank.body, {
                    x: moveSpeed * Math.cos(angle),
                    y: moveSpeed * Math.sin(angle)
                });
            } else {
                switch (controlState) {
                    case "move-forward":
                        Matter.Body.translate(tank.body, {
                            x: moveSpeed * Math.cos(tank.body.angle),
                            y: moveSpeed * Math.sin(tank.body.angle)
                        });
                        break;
                    case "move-backward":
                        Matter.Body.translate(tank.body, {
                            x: -moveSpeed * Math.cos(tank.body.angle),
                            y: -moveSpeed * Math.sin(tank.body.angle)
                        });
                        break;
                    case "move-left":
                        Matter.Body.rotate(tank.body, -rotationSpeed);
                        break;
                    case "move-right":
                        Matter.Body.rotate(tank.body, rotationSpeed);
                        break;
                }
            }
        }

        if (bulletState === "create-bullet" && tank) {
            const angle = tank.body.angle;
            handleShot(tank, entities, new Date().getTime(), 500, 'shot', angle, engine, soundOn);
        }

        setupCollisionEvents(engine, entities);

        Object.keys(entities).forEach((key) => {
            if (key.startsWith('tank')) {
                checkBoundaries(entities[key], bounds, false);
                checkBoundariesObject(entities[key], entities, controlState);
            }
            if (key.startsWith('enemy')) {
                checkBoundaries(entities[key], bounds, false);
                checkBoundariesObject(entities[key], entities, controlState, true);
            }
        });

        entities = collisionSystem(entities);


        return entities;
    } catch (error) {
        console.error("Error in Physics update:", error);
        return entities;
    }
};

// Check and remove depleted enemies from the game world
/**
 * Checks and removes enemies with depleted health from the game entities.
 *
 * This function iterates through the given entities and identifies those
 * that represent enemies based on their keys starting with 'enemy_'. If
 * an enemy's health is found to be zero or less, it is removed from the
 * physics engine world and deleted from the entities object.
 *
 * @param {Object} entities - The collection of game entities, where each key is a unique identifier
 *                            for an entity, and the value is an object representing the entity's properties.
 */
const checkAndRemoveDepletedEnemies = (entities) => {
    try {
        if (!entities) return;

        Object.keys(entities).forEach(key => {
            if (key.startsWith('enemy_') && entities[key].health <= 0) {
                Matter.Composite.remove(entities.physics.engine.world, entities[key].body);
                delete entities[key];
            }
        });
    } catch (error) {
        console.error("Error in checkAndRemoveDepletedEnemies:", error);
    }
};

// Check and remove depleted walls from the game world
/**
 * Function to check and remove walls with depleted health from the game entities.
 *
 * Iterates through the provided entities object, identifies keys that start with
 * 'random_wall' and removes the corresponding entity from the physics engine and
 * the entities object if their health is less than or equal to zero.
 *
 * @param {Object} entities - An object containing all game entities.
 * @throws Will log an error message if an exception is encountered during the process.
 */
const checkAndRemoveDepletedWalls = (entities) => {
    try {
        if (!entities) return;

        Object.keys(entities).forEach(key => {
            if (key.startsWith('random_wall') && entities[key].health <= 0) {
                Matter.Composite.remove(entities.physics.engine.world, entities[key].body);
                delete entities[key];
            }
        });
    } catch (error) {
        console.error("Error in checkAndRemoveDepletedWalls:", error);
    }
};

// Check if all enemies are defeated
/**
 * Check if all enemies in a given set of entities have been defeated.
 *
 * This function checks if any entity within the provided collection has a key
 * that starts with 'enemy_' and a health value greater than 0. If such an entity
 * is found, the function returns false indicating not all enemies are defeated.
 * If no such entity is found, it returns true indicating all enemies are defeated.
 *
 * @param {Object} entities - The collection of entities to check. Each entity is expected to have a key and a health property.
 * @returns {boolean} - Returns true if all enemies have been defeated, false otherwise.
 */
const checkAllEnemiesDefeated = (entities) => {
    try {
        if (!entities) return false;

        return !Object.keys(entities).some(key => key.startsWith('enemy_') && entities[key].health > 0);
    } catch (error) {
        console.error("Error in checkAllEnemiesDefeated:", error);
        return false;
    }
};

// Check boundaries for entities to keep them within the game world
/**
 * Checks and manages the entity's position and movement within specified boundaries and handles collisions
 * with optional random walls and enemy tanks.
 *
 * @param {object} entity - The entity whose boundaries are to be checked. Must have a `body` property.
 * @param {object} bounds - The boundary limits for the entity. May include `min` and `max` properties for bounds checking.
 * @param {boolean} randomWalls - A flag indicating whether random walls should be checked for collisions.
 * @param {string} controlState - The control state of the entity, affects movement if random walls are present ("move-backward").
 * @param {boolean} enemyTank - A flag indicating whether the entity is colliding with an enemy tank.
 */
const checkBoundaries = (entity, bounds, randomWalls, controlState, enemyTank) => {
    try {
        if (!entity || !entity.body || !bounds) return;

        const {min, max} = entity.body.bounds;
        if (!randomWalls && bounds.min && bounds.max && (min.x < bounds.min.x || max.x > bounds.max.x || min.y < bounds.min.y || max.y > bounds.max.y)) {
            Matter.Body.setVelocity(entity.body, {x: 0, y: 0});
            if (min.x < bounds.min.x) Matter.Body.setPosition(entity.body, {
                x: bounds.min.x + (max.x - min.x) / 2,
                y: entity.body.position.y
            });
            if (max.x > bounds.max.x) Matter.Body.setPosition(entity.body, {
                x: bounds.max.x - (max.x - min.x) / 2,
                y: entity.body.position.y
            });
            if (min.y < bounds.min.y) Matter.Body.setPosition(entity.body, {
                x: entity.body.position.x,
                y: bounds.min.y + (max.y - min.y) / 2
            });
            if (max.y > bounds.max.y) Matter.Body.setPosition(entity.body, {
                x: entity.body.position.x,
                y: bounds.max.y - (max.y - min.y) / 2
            });
        }

        if (randomWalls && !enemyTank && bounds.body && Matter.Collision.collides(bounds.body, entity.body) !== null) {
            if (controlState === 'move-backward') {
                Matter.Body.translate(entity.body, {
                    x: 2 * Math.cos(entity.body.angle),
                    y: 2 * Math.sin(entity.body.angle)
                });
            } else {
                Matter.Body.translate(entity.body, {
                    x: -2 * Math.cos(entity.body.angle),
                    y: -2 * Math.sin(entity.body.angle)
                });
            }
        }

        if (randomWalls && enemyTank && bounds.body && entity.body) {
            const collision = Matter.Collision.collides(bounds.body, entity.body);
            if (collision !== null) {
                const currentVelocity = entity.body.velocity;
                Matter.Body.setVelocity(entity.body, {
                    x: -currentVelocity.x - 9,
                    y: -currentVelocity.y - 3,
                });
                Matter.Body.setPosition(entity.body, {
                    x: entity.body.position.x - currentVelocity.x * 0.2,
                    y: entity.body.position.y - currentVelocity.y * 0.2,
                });
            }
        }
    } catch (error) {
        console.error("Error in checkBoundaries:", error);
    }
};

// Check boundaries for all relevant objects in the game world
/**
 * Checks the boundaries of a given entity against other entities and handles collisions.
 *
 * @param {Object} entity - The entity to check.
 * @param {Object} entities - A collection of all entities in the environment.
 * @param {Object} controlState - The control state of the entity.
 * @param {Object} enemyTank - The enemy tank object.
 */
const checkBoundariesObject = (entity, entities, controlState, enemyTank) => {
    try {
        if (!entity || !entities) return;

        Object.keys(entities).forEach((key) => {
            if (key.startsWith('random_wall')) {
                checkBoundaries(entity, entities[key], true, controlState, enemyTank);
            }
        });
    } catch (error) {
        console.error("Error in checkBoundariesObject:", error);
    }
};

export default Physics;
