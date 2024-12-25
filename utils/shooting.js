import Matter from 'matter-js';
import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions} from 'react-native';
import {setUserID} from '../utils/async-storage';
import {isGameOver} from '../components/gameOverMenu';
import soundManager from '../utils/soundManager';

/**
 * Represents the height of the device's screen in pixels.
 *
 * This value is obtained dynamically by querying the device's window
 * dimensions, ensuring that it accurately reflects the current
 * screen height. This can be useful for layout calculations and
 * responsive designs.
 */
const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * Creates a new shot entity in the game.
 *
 * This function initializes a new shot (bullet) entity based on the provided parameters
 * such as position, angle, speed, and other game-specific configurations. If the game is
 * over, the function returns null without creating a shot.
 *
 * @param {Object} position - The initial position of the shot with x and y coordinates.
 * @param {number} angle - The angle at which the shot is fired.
 * @param {number} speed - The speed at which the shot moves.
 * @param {Object} engine - The physics engine instance.
 * @param {string} entityPrefix - A prefix for entity identification.
 * @param {number} currentTime - The current time in the game.
 * @param {Object} appDimensions - The dimensions of the application screen.
 * @param {Object} entities - All entities currently in the game.
 * @param {boolean} soundOn - A flag indicating whether sound is enabled.
 * @returns {Object|null} - The newly created bullet entity or null if the game is over.
 */
const createShot = (position, angle, speed, engine, entityPrefix, currentTime, appDimensions, entities, soundOn) => {
    if (isGameOver) return null;

    soundManager.playSound('shot');

    const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
    };

    const bullet = {
        body: Matter.Bodies.circle(position.x, position.y, 5, { label: 'bullet' }),
        velocity: velocity,
        renderer: <ShotRenderer angle={angle} speed={speed} engine={engine} entityPrefix={entityPrefix}
                                currentTime={currentTime} appDimensions={appDimensions} entities={entities}
                                soundOn={soundOn}/>
    };

    Matter.Body.setVelocity(bullet.body, velocity);

    return bullet;
};

/**
 * The timestamp of the last shot fired by the tank.
 * This value is represented as the number of milliseconds
 * since the Unix Epoch (January 1, 1970).
 *
 * @type {number}
 */
let lastTankShotTime = 0;
/**
 * An object that keeps track of the last shot times for each enemy.
 * The keys are enemy identifiers and the values are corresponding timestamps
 * when the enemy last fired a shot. This data structure is useful for managing
 * attack cooldowns and orchestrating enemy firing schedules in a game.
 */
let lastEnemyShotTimes = {};

/**
 * Manages the shooting mechanism for both player and enemy entities in the game.
 * Determines whether an entity can shoot based on the time elapsed since the last shot,
 * and updates the game state accordingly.
 *
 * @param {Object} entity - The entity attempting to shoot. Contains position and orientation data.
 * @param {Object} entities - The collection of all game entities.
 * @param {number} currentTime - The current timestamp to check shot timing.
 * @param {number} delay - The minimum delay required between consecutive shots.
 * @param {string} entityPrefix - Prefix to differentiate between player and enemy shots.
 * @param {number} angle - The angle at which to shoot.
 * @param {Object} engine - The physics engine managing the game world.
 * @param {boolean} soundOn - Flag indicating if sound effects are enabled.
 */
const handleShot = (entity, entities, currentTime, delay, entityPrefix, angle, engine, soundOn) => {
    if (isGameOver) return;

    const appDimensions = entities.getScreenDimension();

    if (!entity.lastShotTime) entity.lastShotTime = 0;

    let lastShotTime = entityPrefix === 'shot' ? lastTankShotTime : (lastEnemyShotTimes[entity.id] || 0);

    if (currentTime - lastShotTime >= delay) {
        const nozzleLength = 40;
        const shotPosition = {
            x: entity.body.position.x + Math.cos(entity.body.angle) * nozzleLength,
            y: entity.body.position.y + Math.sin(entity.body.angle) * nozzleLength,
        };

        const shot = createShot(shotPosition, entity.body.angle, 10, engine, entityPrefix, currentTime, appDimensions, entities, soundOn);
        shot.engine = engine;
        shot.angle = angle;
        shot.speed = 10;
        shot.entities = entities;
        shot.entityPrefix = entityPrefix;
        shot.currentTime = currentTime;
        shot.appDimensions = appDimensions;
        entities[`${entityPrefix}_${currentTime}`] = shot;

        if (entityPrefix === 'shot') {
            lastTankShotTime = currentTime;
        } else {
            lastEnemyShotTimes[entity.id] = currentTime;
        }
    }
};

/**
 * ShotRenderer is a functional component responsible for rendering and managing the behavior of a shot entity
 * in a game. It handles the shot's movement, collision detection with various entities such as AI entities,
 * walls, and the player tank, and removal of the shot entity when it goes out of bounds.
 *
 * @param {Object} props - The properties object
 * @param {Object} props.body - The Matter.js body instance representing the physical body of the shot
 * @param {number} props.angle - The angle at which the shot is fired
 * @param {number} props.speed - The speed of the shot
 * @param {Object} props.engine - The Matter.js engine instance managing the game physics
 * @param {string} props.entityPrefix - The prefix string used to identify the shot entity
 * @param {number} props.currentTime - The current time, used to generate a unique entity ID
 * @param {Object} props.appDimensions - The dimensions of the application viewport
 * @param {Object} props.entities - The collection of all game entities
 * @param {boolean} props.soundOn - Flag indicating whether sound is enabled
 * @returns {JSX.Element|null} Returns an animated view representing the shot if the entity exists; otherwise, returns null.
 */
const ShotRenderer = ({body, angle, speed, engine, entityPrefix, currentTime, appDimensions, entities, soundOn}) => {
    const shotSize = 10;
    const entityId = `${entityPrefix}_${currentTime}`;

    const position = useRef({
        x: body.position.x,
        y: body.position.y,
    });

    const removeEntity = (entities, entityId) => {
        const entity = entities[entityId];
        if (entity) {
            if (entity.body && engine.world.bodies.includes(entity.body)) {
                Matter.World.remove(engine.world, entity.body);
            }
            delete entities[entityId];
        }
    };

    useEffect(() => {
        const update = () => {
            if (!entities[entityId]) {
                Matter.Events.off(engine, 'afterUpdate', update);
                return;
            }

            const nextX = position.current.x + body.velocity.x;
            const nextY = position.current.y + body.velocity.y;

            position.current = {
                x: nextX,
                y: nextY,
            };

            entities[entityId].body.position = position.current;

            const futurePosition = {
                x: position.current.x + body.velocity.x * 2,
                y: position.current.y + body.velocity.y * 2,
            };

            const projectedCollisionArea = Matter.Bodies.rectangle(
                (position.current.x + futurePosition.x) / 2,
                (position.current.y + futurePosition.y) / 2,
                Math.abs(body.velocity.x) || 1,
                Math.abs(body.velocity.y) || 1,
                { isSensor: true, density: 0.001 }
            );

            const aiEntities = Object.values(entities).filter(entity => entity.ai);

            aiEntities.forEach(entity => {
                if (entityPrefix === 'shot' && Matter.Collision.collides(projectedCollisionArea, entity.body) != null) {

                    if (entity.health > 0) {
                        soundManager.playSound('collision');
                        entity.health -= 50; // -25, 0, -10
                        removeEntity(entities, `${entityPrefix}_${currentTime}`);

                        if (entity.health <= 0) {
                            entities.updateScore();
                            soundManager.playSound('explosion');
                        }
                    }
                }
            });

            Object.keys(entities).forEach(key => {
                if (key.startsWith('random_wall')) {
                    const wall = entities[key];
                    if (Matter.Collision.collides(projectedCollisionArea, wall.body) != null) {
                        wall.health -= 50;
                        if (wall.health <= 0) {
                            Matter.World.remove(engine.world, wall.body);
                            delete entities[key];
                            soundManager.playSound('explosion');
                        }
                        removeEntity(entities, `${entityPrefix}_${currentTime}`);
                    }
                }
            });

            if (entityPrefix === 'enemyShot' && entities?.[`tank`]?.body && Matter.Collision.collides(projectedCollisionArea, entities[`tank`].body) != null) {
                if (entities.getUserHealth() > 0) {
                    soundManager.playSound('collision');
                    entities.setUserHealth(entities.getUserHealth() - 25);
                    entities[`tank`].health -= 25;
                } else if (entities.getUserHealth() <= 0) {
                    soundManager.playSound('explosion');
                    setUserID()
                }
                removeEntity(entities, `${entityPrefix}_${currentTime}`);
            }

            if (position.current.x < 0 || position.current.x > appDimensions.width || position.current.y < 0 || position.current.y > appDimensions.height) {
                removeEntity(entities, `${entityPrefix}_${currentTime}`);
            }
        };

        Matter.Events.on(engine, 'afterUpdate', update);

        return () => {
            Matter.Events.off(engine, 'afterUpdate', update);
        };
    }, [entities, entityId]);

    if (!entities[entityId]) {
        return null;
    }

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: position.current.x,
                top: position.current.y,
                width: shotSize,
                height: shotSize,
                borderRadius: shotSize / 2,
                backgroundColor: 'black',
            }}
        />
    );
};

export { ShotRenderer, createShot, handleShot };
