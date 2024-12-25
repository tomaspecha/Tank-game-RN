import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Adds a user's score to the high score list.
 *
 * This function retrieves the current list of high scores and the user's ID.
 * If the user already has a score in the list, it updates their score.
 * Otherwise, it adds a new entry for the user.
 * The list is sorted in descending order, and only the top 10 scores are retained.
 * The updated list is then saved to persistent storage.
 *
 * @param {number} score - The score to be added to the high score list.
 * @returns {Promise<void>} A promise that resolves when the score has been successfully added.
 */
export const addHighScore = async (score) => {
    try {
        let highScores = await getHighScores();
        // console.log('High scores before adding:', highScores);
        let user_id = await getUserID()

        const existingIndex = highScores.findIndex(entry => entry.user_id === user_id);

        if (existingIndex !== -1) {
            highScores[existingIndex].score = score;
        } else {
            highScores.push({user_id, score});
        }

        highScores = highScores.sort((a, b) => b.score - a.score).slice(0, 10);


        // Add the new score, sort the list, and keep only the top 10 scores
        await AsyncStorage.setItem('highScores', JSON.stringify(highScores));

        console.log(`Score of ${score} saved successfully. High scores list now:`, highScores);  // Debugging
    } catch (error) {
        console.error('Failed to add high score:', error);
    }
};

/**
 * Asynchronously retrieves high scores from storage.
 *
 * Fetches a JSON string of high scores from AsyncStorage, parses it,
 * and returns it as an array. If an error occurs during retrieval or
 * parsing, an empty array is returned instead.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of high scores.
 */
export const getHighScores = async () => {
    try {
        const highScoresString = await AsyncStorage.getItem('highScores');
        const highScores = highScoresString ? JSON.parse(highScoresString) : [];
        //console.log('Retrieved high scores:', highScores); // Debugging
        return highScores;
    } catch (error) {
        console.error('Failed to get high scores:', error);
        return [];
    }
};

/**
 * An asynchronous function that saves the latest score to AsyncStorage.
 *
 * This function takes a score value, converts it to a JSON string, and stores it in AsyncStorage under the key 'latestScore'.
 * If the operation is successful, the function silently completes.
 * If an error occurs during the save process, the error is caught and logged to the console.
 *
 * @param {number} score - The score to be saved.
 * @returns {Promise<void>} A promise that resolves when the score has been successfully saved or rejects if an error occurs.
 */
export const saveLatestScore = async (score) => {
    try {
        await AsyncStorage.setItem('latestScore', JSON.stringify(score));
        //console.log(`Latest score of ${score} has been saved successfully.`);
    } catch (error) {
        console.error('Failed to save latest score:', error);
    }
};

/**
 * Asynchronous function to retrieve the user ID from local storage.
 *
 * The function attempts to fetch the 'user_id' stored using AsyncStorage.
 * If successful, it returns the user ID. If there is an error during the process,
 * it logs the error to the console and returns null.
 *
 * @returns {Promise<string|null>} A promise that resolves to the user ID if successful,
 * or null if an error occurs.
 */
export const getUserID = async () => {
    try {
        const userID = await AsyncStorage.getItem('user_id');
        return userID;
    } catch (error) {
        console.error('Failed to get user ID:', error);
        return null;
    }
};

/**
 * Asynchronously generates a random user ID and stores it in persistent storage.
 *
 * This function performs the following operations:
 * - Generates a random user ID in the format 'user_<randomNumber>'.
 * - Resets the latest score to 0.
 * - Initializes the current level and score with level 1 and generated flag set to false.
 * - Logs the generated user ID to the console.
 * - Attempts to store the generated user ID in AsyncStorage.
 *
 * If saving to AsyncStorage fails, an error is logged to the console.
 *
 * @function
 * @returns {Promise<void>}
 */
export const setUserID = async () => {
    const randomUserID = `user_${Math.floor(Math.random() * 1000000)}`;
    saveLatestScore(0)
    saveCurrentLevelAndScore({level: 1, generated: false}, 0)
    console.log(randomUserID)
    try {
        await AsyncStorage.setItem('user_id', randomUserID);
    } catch (error) {
        console.error('Failed to set user ID:', error);
    }
};

/**
 * Asynchronously retrieves the latest score from AsyncStorage.
 *
 * @returns {Promise<number>} The latest score, or 0 if it doesn't exist or an error occurs.
 */
export const getLatestScore = async () => {
    try {
        const latestScoreString = await AsyncStorage.getItem('latestScore');
        const latestScore = latestScoreString ? JSON.parse(latestScoreString) : 0;
        //console.log(' latest score:', latestScore); // Debugging
        return latestScore;
    } catch (error) {
        console.error('Failed to get latest score:', error);
        return 0;
    }
};

/**
 * Asynchronously saves the current level and score to AsyncStorage.
 *
 * @param {Object} level - The current level object to be saved.
 * @param {number} score - The current score to be saved.
 * @return {Promise<void>} A promise that resolves when the level and score have been saved, or rejects with an error if the save operation fails.
 */
export const saveCurrentLevelAndScore = async (level, score) => {
    try {
        await AsyncStorage.setItem('currentLevel', JSON.stringify(level));
        await AsyncStorage.setItem('currentScore', JSON.stringify(score));
        //console.log(`Level ${level.level} and score ${score}  saved successfully.`);
    } catch (error) {
        console.error('Failed to save current level and score:', error);
    }
};

/**
 * Asynchronously retrieves the current level and score from AsyncStorage.
 *
 * This function attempts to read the 'currentLevel' and 'currentScore' values from AsyncStorage and parse them into objects.
 * If the values do not exist or there is an error during retrieval, default values are returned.
 *
 * @return {Promise<{ level: { level: number, generated: boolean }, score: number }>} An object containing the current level and score.
 * If retrieval fails, it returns default values: level as an object with `level: 1` and `generated: false`, and score as 0.
 */
export const getCurrentLevelAndScore = async () => {
    try {
        const currentLevelString = await AsyncStorage.getItem('currentLevel');
        const currentScoreString = await AsyncStorage.getItem('currentScore');
        const currentLevel = currentLevelString ? JSON.parse(currentLevelString) : {level: 1, generated: false};
        const currentScore = currentScoreString ? JSON.parse(currentScoreString) : 0;
        //console.log('Obtained current level and score:', { level: currentLevel, score: currentScore }); // Debugging
        return {level: currentLevel, score: currentScore};
    } catch (error) {
        console.error('Failed to get current level and score:', error);
        return {level: {level: 1, generated: false}, score: 0};
    }
};

/**
 * Asynchronous function to clear stored scores.
 *
 * This function removes both the 'highScores' and 'latestScore' items from
 * AsyncStorage. If the operation fails, an error message is logged to the console.
 *
 * @async
 * @function clearScores
 * @returns {Promise<void>} A promise that resolves when the items are removed, or rejects if an error occurs.
 */
export const clearScores = async () => {
    try {
        await AsyncStorage.removeItem('highScores');
        await AsyncStorage.removeItem('latestScore');
        // console.log('High scores and latest score have been cleared.');
    } catch (error) {
        console.error('Failed to clear scores:', error);
    }
};

/**
 * Asynchronously clears all game-related data from AsyncStorage.
 *
 * This function removes specific keys from AsyncStorage which include
 * 'highScores', 'latestScore', 'currentLevel', 'currentScore', 'userHealth',
 * and 'gameState'. If a key is found and removed, it is logged in the console.
 * Optionally, a function can be passed to reset the game's state after the
 * data has been cleared.
 *
 * @param {function} [resetGameState] - Optional function to reset the game's state.
 * @returns {Promise<void>} - A promise that resolves when all specified data has been cleared.
 *
 * @throws {Error} - Logs an error message if there is a failure in clearing any of the data.
 */
export const clearAllGameData = async (resetGameState) => {
    try {
        const keysToRemove = ['highScores', 'latestScore', 'currentLevel', 'currentScore', 'userHealth', 'gameState'];
        const removedKeys = [];

        for (const key of keysToRemove) {
            const item = await AsyncStorage.getItem(key);
            if (item !== null) {
                await AsyncStorage.removeItem(key);
                removedKeys.push(key);
            }
        }

        console.log('Removed keys:', removedKeys);
        if (removedKeys.includes('highScores'))
            // console.log('High scores been cleared.');
            if (removedKeys.includes('latestScore'))
                // console.log('Latest score  been cleared.');
                if (removedKeys.includes('currentLevel'))
                    //console.log('Current level  been cleared.');
                    if (removedKeys.includes('currentScore'))
                        //console.log('Current score  been cleared.');
                        if (removedKeys.includes('userHealth'))
                            //console.log('User health cleared.');
                            if (removedKeys.includes('gameState'))
                                //console.log('Game state  been cleared.');

                                // Reset all local state and variables in the game
                                if (resetGameState) {
                                    resetGameState(); // Execute the reset if the function is passed
                                    // console.log('Game state reset.');
                                }

    } catch (error) {
        console.error('Failed to clear all game data:', error);
    }
};
