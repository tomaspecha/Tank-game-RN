import Matter from 'matter-js';

/**
 * Handles the collision and removal logic for various entities in the game.
 *
 * @param {object} entities - The collection of game entities.
 * Entity keys that start with 'bullet_' or 'enemyShot_' represent bullets and enemy shots,
 * 'wall' or 'random_wall' represent walls, and 'enemy_' represent enemies.
 * There is also a special entity 'tank' representing the player's tank
 * and optionally a 'boost' item that the tank can collide with.
 *
 * @returns {object} The updated collection of game entities after processing collisions.
 */
const collisionSystem = (entities) => {
    const tank = entities.tank;
    const bounds = entities.bounds;

    // Handle bullet removal and out-of-bounds check
    Object.keys(entities).forEach(key => {
        if (key.startsWith('bullet_') || key.startsWith('enemyShot_')) {
            let bullet = entities[key];
            if (isOutOfBounds(bullet.body, bounds)) {
                Matter.World.remove(entities.physics.engine.world, bullet.body);
                delete entities[key];
            }
        }
    });

    // Handle wall collisions
    Object.keys(entities).forEach(key => {
        if (key.startsWith('wall') || key.startsWith('random_wall')) {
            let wall = entities[key];

            // Check collision with the tank
            if (isColliding(tank.body, wall.body)) {
                Matter.Body.setVelocity(tank.body, {
                    x: -tank.body.velocity.x,
                    y: -tank.body.velocity.y
                });
            }

            // Check collision with enemies
            Object.keys(entities).forEach(enemyKey => {
                if (enemyKey.startsWith('enemy_')) {
                    let enemy = entities[enemyKey];
                    if (isColliding(enemy.body, wall.body)) {
                        Matter.Body.setVelocity(enemy.body, {
                            x: -enemy.body.velocity.x,
                            y: -enemy.body.velocity.y
                        });
                    }
                }
            });

            // Check collision with bullets
            Object.keys(entities).forEach(bulletKey => {
                if (bulletKey.startsWith('bullet_')) {
                    let bullet = entities[bulletKey];
                    if (isColliding(bullet.body, wall.body)) {
                        Matter.World.remove(entities.physics.engine.world, bullet.body);
                        delete entities[bulletKey]; // Remove from entities

                        wall.health -= 50;
                        if (wall.health <= 0) {
                            Matter.World.remove(entities.physics.engine.world, wall.body);
                            delete entities[key];
                        }
                    }
                }
            });
        }
    });

    // Handle boost collisions with the tank
    if (entities.boost && isColliding(tank.body, entities.boost.body)) {
        console.log("Boost collision detected in wallCollision.js");
        if (typeof entities.onBoostCollected === 'function') {
            entities.onBoostCollected(tank);
            //Matter.World.remove(entities.physics.engine.world, entities.boost.body);
            delete entities.boost;
        } else {
            console.error("onBoostCollected is not a function");
        }
    }

    return entities;
};

/**
 * Determines if two objects are colliding based on their bounds.
 *
 * @param {Object} a - The first object to check for collision. It must have a `bounds` property.
 * @param {Object} b - The second object to check for collision. It must have a `bounds` property.
 * @returns {boolean} - Returns true if the objects are colliding, otherwise false.
 */
const isColliding = (a, b) => {
    return Matter.Bounds.overlaps(a.bounds, b.bounds);
};

/**
 * Determines if a given object's position is out of defined bounds.
 *
 * @param {Object} body - The object containing the position to check.
 * @param {Object} body.position - The position of the object.
 * @param {number} body.position.x - The x-coordinate of the position.
 * @param {number} body.position.y - The y-coordinate of the position.
 * @param {Object} bounds - The bounds against which to check the position.
 * @param {Object} bounds.min - The minimum boundaries.
 * @param {number} bounds.min.x - The minimum x-coordinate.
 * @param {number} bounds.min.y - The minimum y-coordinate.
 * @param {Object} bounds.max - The maximum boundaries.
 * @param {number} bounds.max.x - The maximum x-coordinate.
 * @param {number} bounds.max.y - The maximum y-coordinate.
 * @returns {boolean} `true` if the position is out of bounds, `false` otherwise.
 */
const isOutOfBounds = (body, bounds) => {
    const {x, y} = body.position;
    return x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y;
};

export default collisionSystem;
