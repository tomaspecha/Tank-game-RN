import * as ScreenOrientation from 'expo-screen-orientation';
import Matter from 'matter-js';
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {GameEngine} from 'react-native-game-engine';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Credits from './components/credits';
import GameOverMenu from './components/gameOverMenu';
import GamePlayMenu from './components/gamePlayMenu';
import HighScoreMenu from './components/highScoreMenu';
import Joystick from './components/joystick';
import MainLoad from './components/mainLoad';
import MenuWithOrientation from './components/menuWithOrientation';
import {PauseIcon} from './components/MySvgComponent';
import Sounds from './components/sounds';
import WinMenu from './components/win';
import Tank from './entities/tank';
import Physics from './system/physics';
import {
    addHighScore,
    clearAllGameData,
    getCurrentLevelAndScore,
    getHighScores,
    getLatestScore,
    saveCurrentLevelAndScore,
    saveLatestScore,
    setUserID
} from './utils/async-storage';
import soundManager from './utils/soundManager';
import RemoveProgress from './components/removeProgress';

const heartIcon = require('./assets/icons/icons8-heart.gif');

/**
 * Main application component that initializes and manages the game state.
 *
 * @param {object} options - Configuration options for the App component.
 * @param {boolean} options.soundOn - Initial state of the sound.
 * @returns {JSX.Element} The rendered application component.
 */
export default function App(options) {
    const [, setIsLoaded] = useState(false);
    const [showMainContent, setShowMainContent] = useState(false);
    const [running, setRunning] = useState(false);
    const [paused, setPaused] = useState(false);
    const score = useRef(0);
    const [highScores, setHighScores] = useState([]);
    const [, setLatestScore] = useState(0);
    const [showHighScores, setShowHighScores] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showWinMenu, setShowWinMenu] = useState(false);
    const [showCredits, setShowCredits] = useState(false);
    const [soundOn, setSoundOn] = useState(soundManager.soundOn);
    const [orientation, setOrientation] = useState('landscape');
    const appDimensions = useRef({width: Dimensions.get("window").width, height: Dimensions.get("window").height});
    const orientationChange = useRef(false);
    const gameEngineRef = useRef(null);
    const bulletRef = useRef(null);
    const enemies = useRef([]);
    const walls = useRef([]);
    const level = useRef({level: 1, generated: false, permanentRemoved: false});
    const userHealth = useRef(100);
    const [health, setHealth] = useState(userHealth.current);
    const [, setStageLevel] = useState(level.current.level);
    const isGameOverRef = useRef(false);
    const [showWarning, setShowWarning] = useState(false);

    // State variable to track if boost has been spawned
    const resetGameState = () => {
        score.current = 0;
        level.current = {level: 1, generated: false};
        userHealth.current = 100;
        setHealth(100);
        setStageLevel(1);
        enemies.current = [];
        walls.current = [];
        gameEngineRef.current = null;
        bulletRef.current = null;
        isGameOverRef.current = false;
        console.log('Game state has been fully reset to initial values.');
    };

    const handleClearScores = () => {
        setShowWarning(true);  // Show the warning dialog
    };

    const confirmClearScores = async () => {
        await clearAllGameData(resetGameState);
        setShowWarning(false);  // Hide the warning dialog after clearing data
        await loadHighScores();  // Reload high scores after clearing
        setShowHighScores(true);  // Return to High Score menu
    };

    useEffect(() => {
        setUserID()
    }, [])

    // Lock orientation to landscape
    useEffect(() => {
        const lockToLandscape = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        };
        lockToLandscape();
        return () => {
            ScreenOrientation.unlockAsync(); // Unlock orientation when the component unmounts
        };
    }, []);

    // Initialize the game
    useEffect(() => {
        const initializeGame = async () => {
            try {
                const highScoresData = await getHighScores();
                setHighScores(highScoresData);
                const latestScoreData = await getLatestScore();
                setLatestScore(latestScoreData);
            } catch (error) {
                console.error('Error initializing game:', error);
            }
        };
        initializeGame().then(() => {
            setIsLoaded(true);  // Show loading screen
            setTimeout(() => {
                setShowMainContent(true);  // Show main content after 4.5 seconds
            }, 4500);
        });
    }, []);

    const handleLayout = (event) => {
        const {width, height} = event.nativeEvent.layout;
        const newOrientation = width > height ? 'landscape' : 'portrait';
        setOrientation(newOrientation);
        appDimensions.current = {width, height};
        orientationChange.current = true;
    };

    const toggleSound = () => {
        setSoundOn(!soundOn);
        soundManager.setSoundOn(!soundOn);
    };

    const controlEngine = (action) => {
        gameEngineRef.current = action;
    };

    const controlBullet = (action) => {
        bulletRef.current = action;
    };

    const updateLevelAndScore = (data, newScore) => {
        console.log(data, newScore)
        level.current = data;
        setStageLevel(level.current.level);
        score.current = newScore;
        saveCurrentLevelAndScore(level.current, score.current);
    };

    const loadHighScores = async () => {
        try {
            const scores = await getHighScores();
            setHighScores(scores);
            console.log('High scores loaded:', scores);  // Debugging: Confirm scores are loaded
        } catch (error) {
            console.error('Failed to load high scores:', error);
        }
    };

    const updateScore = () => {
        const newScore = score.current + 100;
        score.current = newScore;
        saveLatestScore(newScore);
        handleAddHighScore();  // Add the latest score to high scores
    };

    const updateEnemies = (data) => {
        enemies.current = data;
    };
    const handleShowHighScores = () => {
        setShowHighScores(true);
    };

    const handleGoBack = () => {
        setShowHighScores(false);
        setShowCredits(false);
    };

    const handleAddHighScore = async () => {
        await addHighScore(score.current);
        await loadHighScores();  // Reload high scores after adding a new one
    };

    const setWalls = (data) => {
        walls.current = data;
    };

    const setOrientationChange = (data) => {
        orientationChange.current = data;
    };

    const handleContinue = () => {
        const nextLevel = level.current.level + 1;
        const newScore = score.current;
        updateLevelAndScore({level: nextLevel, generated: false}, newScore);
        const newHealth = Math.min(userHealth.current + 50, 400);
        updateHealth(newHealth);
        controlBullet(null);
        setShowWinMenu(false);
        setRunning(true);
        isGameOverRef.current = false;
    };

    const updateHealth = (newHealth) => {
        userHealth.current = newHealth;
        setHealth(newHealth);
    };

    const handleMainMenu = () => {
        setPaused(false);
        setRunning(false);
        setShowWinMenu(false);
        userHealth.current = 100;
        setHealth(userHealth.current);
        controlBullet(null);
        ScreenOrientation.unlockAsync(); // Unlock orientation when returning to the main menu
    };

    const handleWin = () => {
        setShowWinMenu(true);
        setRunning(false);
    };

    const handleRetry = () => {
        try {
            const currentLevel = level.current.level;
            const currentScore = score.current;
            updateLevelAndScore({level: currentLevel, generated: false}, currentScore);
            userHealth.current = 100;
            setHealth(userHealth.current);
            controlBullet(null);  // Reset the bullet state
            setRunning(true);  // Restart the game
            isGameOverRef.current = false;
        } catch (error) {
            console.error('Error handling retry:', error);
        }
    };

    const handleLoadingComplete = () => {
        setShowMainContent(true);
    };

    const handlePause = () => {
        setPaused(true);
        setRunning(false);
    };

    const handleResume = () => {
        setPaused(false);
        setRunning(true);
    };

    const onBoostCollected = () => {
        const newHealth = Math.min(userHealth.current + 50, 400);
        updateHealth(newHealth);
        if (soundOn) {
            soundManager.playSound('bonus');
        }
        console.log("Boost collected! New health:", newHealth);
    };

    if (!showMainContent) {
        return <MainLoad onLoadingComplete={handleLoadingComplete}/>;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <View style={styles.container} onLayout={handleLayout}>
                <StatusBar hidden={true}/>
                {showHighScores ? (
                    <HighScoreMenu
                        onGoBack={() => setShowHighScores(false)}
                        highScores={highScores}
                        onResetGameState={resetGameState}
                        clearAllGameData={handleClearScores}
                    />
                ) : showSettings ? (
                    <Sounds onToggleSound={toggleSound} soundOn={soundOn} onGoBack={() => setShowSettings(false)}/>
                ) : showWinMenu ? (
                    <WinMenu
                        onContinue={handleContinue}
                        onMainMenu={handleMainMenu}
                        isGameOver={isGameOverRef.current}
                        currentHealth={health}
                        currentScore={score.current}
                    />
                ) : showCredits ? (
                    <Credits onClose={handleGoBack}/>
                ) : paused ? (
                    <GamePlayMenu onResume={handleResume} onMainMenu={handleMainMenu}
                                  onSettings={() => setShowSettings(true)}/>
                ) : running && health > 0 ? (
                    <>
                        <Text style={styles.levelText}>Level: {level.current.level}</Text>
                        <Text style={styles.scoreText}>Score: {score.current}</Text>
                        <View style={styles.playerHealthContainer}>
                            <Image source={heartIcon} style={styles.heartIcon}/>
                            <Text style={styles.healthText}>{health}</Text>
                        </View>
                        <GameEngine
                            ref={gameEngineRef}
                            style={styles.gameEngine}
                            systems={[(entities, time) => Physics(entities, time, soundOn)]}
                            entities={{
                                getOrientationChange: () => orientationChange.current,
                                setOrientationChange: (data) => setOrientationChange(data),
                                physics: {engine: Matter.Engine.create(), world: Matter.World.create(options)},
                                tank: {
                                    body: Matter.Bodies.rectangle(100, 100, 64, 46),
                                    color: 'blue',
                                    renderer: Tank,
                                    health: userHealth.current,
                                    ai: false
                                },
                                getControlState: () => gameEngineRef.current,
                                getBulletState: () => bulletRef.current,
                                getScreenDimension: () => appDimensions.current,
                                getCurrentLevel: () => level.current,
                                setCurrentLevel: (data) => updateLevelAndScore(data, score.current),
                                getCurrentEnemies: () => enemies.current,
                                setCurrentEnemies: (data) => updateEnemies(data),
                                setBoundaryWalls: (data) => setWalls(data),
                                getBoundaryWalls: () => walls.current,
                                getUserHealth: () => userHealth.current,
                                setUserHealth: (data) => updateHealth(data),
                                updateScore: () => updateScore(),
                                setWin: handleWin,
                                onBoostCollected: onBoostCollected,
                                soundOn: soundOn
                            }}
                        />

                        <TouchableOpacity onPress={handlePause} style={styles.pauseButton}>
                            <PauseIcon name="pause" size={30} color="black"/>
                        </TouchableOpacity>
                        <Joystick controlEngine={controlEngine} controlBullet={controlBullet}/>
                    </>
                ) : health <= 0 ? (
                    <GameOverMenu
                        onRetry={handleRetry}
                        onMainMenu={() => {
                            setUserID()
                            setRunning(false);
                            userHealth.current = 100;
                            setHealth(userHealth.current);
                            controlBullet(null);
                            ScreenOrientation.unlockAsync();
                        }}
                        isGameOver={isGameOverRef.current}
                        currentScore={score.current}
                        currentLevel={level.current.level}
                    />
                ) : (
                    <MenuWithOrientation
                        onStartGame={async () => {
                            const {level, score} = await getCurrentLevelAndScore();
                            updateLevelAndScore({level: level.level, generated: false}, score);
                            userHealth.current = 100;
                            setHealth(userHealth.current);
                            controlBullet(null);
                            setRunning(true);
                            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                        }}
                        onSettings={() => setShowSettings(true)}
                        onCredits={() => setShowCredits(true)}
                        onShowHighScores={handleShowHighScores}
                    />
                )}

                {showWarning && (
                    <RemoveProgress
                        onCancel={() => setShowWarning(false)}
                        onConfirm={confirmClearScores}
                        onResetGameState={resetGameState}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
}

/**
 * An object containing predefined styles for various UI components.
 *
 * @type {object}
 * @property {object} container - Style for the main container component.
 * @property {number} container.flex - Flexbox property to define how this component grows/shrinks.
 * @property {string} container.backgroundColor - Background color of the container.
 *
 * @property {object} levelText - Style for the level text display.
 * @property {string} levelText.position - Defines the positioning method used for this element.
 * @property {number} levelText.top - Distance from the top of the container.
 * @property {number} levelText.left - Distance from the left of the container.
 * @property {number} levelText.fontSize - Font size for the level text.
 * @property {string} levelText.fontWeight - Font weight for the level text.
 * @property {string} levelText.color - Text color for the level text.
 * @property {number} levelText.zIndex - Z-index to ensure the text appears on top.
 *
 * @property {object} scoreText - Style for the score text display.
 * @property {string} scoreText.position - Defines the positioning method used for this element.
 * @property {number} scoreText.top - Distance from the top of the container.
 * @property {number} scoreText.right - Distance from the right of the container.
 * @property {number} scoreText.fontSize - Font size for the score text.
 * @property {string} scoreText.fontWeight - Font weight for the score text.
 * @property {string} scoreText.color - Text color for the score text.
 * @property {number} scoreText.zIndex - Z-index to ensure the text appears on top.
 *
 * @property {object} playerHealthContainer - Style for the player health container.
 * @property {string} playerHealthContainer.position - Defines the positioning method used for this element.
 * @property {number} playerHealthContainer.top - Distance from the top of the container.
 * @property {string} playerHealthContainer.left - Distance from the left of the container.
 * @property {Array} playerHealthContainer.transform - Transform properties to apply layout adjustments.
 * @property {string} playerHealthContainer.flexDirection - Align items in a row.
 * @property {string} playerHealthContainer.alignItems - Alignment setting for child components.
 * @property {number} playerHealthContainer.zIndex - Z-index to ensure it appears on top.
 *
 * @property {object} heartIcon - Style for the heart icon representing player health.
 * @property {number} heartIcon.width - Width of the heart icon.
 * @property {number} heartIcon.height - Height of the heart icon.
 * @property {number} heartIcon.marginRight - Right margin space for the icon.
 *
 * @property {object} healthText - Style for the health text display.
 * @property {number} healthText.fontSize - Font size for the health text.
 * @property {string} healthText.fontWeight - Font weight for the health text.
 * @property {string} healthText.color - Text color for the health text.
 *
 * @property {object} pauseButton - Style for the pause button.
 * @property {string} pauseButton.position - Defines the positioning method used for this element.
 * @property {number} pauseButton.top - Distance from the top of the container.
 * @property {number} pauseButton.left - Distance from the left of the container.
 * @property {string} pauseButton.backgroundColor - Background color of the pause button.
 * @property {number} pauseButton.padding - Padding inside the pause button.
 * @property {number} pauseButton.borderRadius - Border radius for rounded corners.
 * @property {number} pauseButton.zIndex - Z-index to ensure the button appears on top.
 *
 * @property {undefined} gameEngine - Placeholder for the game engine instance, currently undefined.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'green',
    },
    levelText: {
        position: 'absolute',
        top: 20,
        left: 105,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        zIndex: 10, // Ensure text is on top
    },
    scoreText: {
        position: 'absolute',
        top: 20,
        right: 25,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        zIndex: 10, // Ensure text is on top
    },
    playerHealthContainer: {
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: [{translateX: -50}],
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10, // Ensure health is on top
    },
    heartIcon: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
    healthText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'red',
    },
    pauseButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'yellow',
        padding: 10,
        borderRadius: 0,
        zIndex: 10, // Ensure button is on top
    }, gameEngine: undefined

});


/*


// import Matter from 'matter-js';
// import React, { useEffect, useRef, useState } from 'react';
// import { Dimensions, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
// import { GameEngine } from 'react-native-game-engine';
// import MenuWithOrientation from './components/menuWithOrientation';
// import GameOverMenu from './components/gameOverMenu';
// import HighScoreMenu from './components/highScoreMenu';
// import WinMenu from './components/win';
// import Tank from './entities/tank';
// import Wall from './entities/wall';
// import Physics from './system/physics';
// import { addHighScore, getHighScores, saveLatestScore, getLatestScore, saveCurrentLevelAndScore, getCurrentLevelAndScore } from './utils/async-storage';
// import Joystick from './components/joystick';
// import Sounds from './components/sounds';
// import * as ScreenOrientation from 'expo-screen-orientation';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import 'react-native-gesture-handler';
// import { isGameOver } from './components/gameOverMenu';
// import Credits from './components/credits';
// import MainLoad from './components/mainLoad';
// import GamePlayMenu from './components/gamePlayMenu';
// import { PauseIcon } from './components/MySvgComponent';
// import SoundManager from './utils/soundManager';
// import {optimizeForDevice} from './system/optimization';
//
// import { HeartIcon } from './components/MySvgComponent';
// import { SoundOnIcon } from './components/MySvgComponent';
// import { SoundOffIcon } from './components/MySvgComponent';
// /!*import Boost from './utils/boost';*!/
//
//
// const heartIcon = require('./assets/icons/icons8-heart.gif');
//
// /!**
//  * App function handles the main logic of the application.
//  * It takes options object as parameter and initializes various state variables which control the application flow and data management.
//  * @param {object} options - The options object containing configuration for the App.
//  * @return {undefined}
//  *!/
// export default function App(options) {
//     const [isLoaded, setIsLoaded] = useState(false);
//     const [running, setRunning] = useState(false);
//     const [paused, setPaused] = useState(false);
//     const score = useRef(0);
//     const [highScores, setHighScores] = useState([]);
//     const [latestScore, setLatestScore] = useState(0);
//     const [showHighScores, setShowHighScores] = useState(false);
//     const [showSettings, setShowSettings] = useState(false);
//     const [showWinMenu, setShowWinMenu] = useState(false);
//     const [showCredits, setShowCredits] = useState(false);
//     const [soundOn, setSoundOn] = useState(true);
//     const [orientation, setOrientation] = useState('landscape');
//     const appDimensions = useRef({
//         width: Dimensions.get("window").width,
//         height: Dimensions.get("window").height
//     });
//     const orientationChange = useRef(false);
//     const gameEngineRef = useRef(null);
//     const bulletRef = useRef(null);
//     const enemies = useRef(null);
//     const walls = useRef(null);
//     const level = useRef({
//         level: 1,
//         generated: false
//     });
//     const userHealth = useRef(100);
//     const [health, setHealth] = useState(userHealth.current);
//     const [stageLevel, setStageLevel] = useState(level.current.level);
//     const isGameOverRef = useRef(false);
//     // const [voumes, setVolumes] = useState({
//     //     shot: 1,
//     //     explosion: 1,
//     //     collision: 1,
//     //     lose : 1,
//     //     bonus : 1,
//     //     win : 1,
//     // })
//
//     useEffect(() => {
//         const initializeGame = async () => {
//             try {
//                 const highScoresData = await getHighScores();
//                 setHighScores(highScoresData);
//                 const latestScoreData = await getLatestScore();
//                 setLatestScore(latestScoreData);
//                 setIsLoaded(true);
//             } catch (error) {
//                 console.error('Error initializing game:', error);
//             }
//         };
//
//         initializeGame();
//     }, []);
//     const controlEngine = (action) => {
//         try {
//             gameEngineRef.current = action;
//         } catch (error) {
//             console.error('Error controlling engine:', error);
//         }
//     };
//
//     const controlBullet = (action) => {
//         try {
//             bulletRef.current = action;
//         } catch (error) {
//             console.error('Error controlling bullet:', error);
//         }
//     };
//
//     /!**
//      * Update the level and score.
//      * @param {Object} data - The data object holding the current level.
//      * @param {number} newScore - The new score to be set.
//      * @returns {void}
//      * @throws {Error} Throws an error if an error occurs while updating.
//      *!/
//     const updateLevelAndScore = (data, newScore) => {
//         try {
//             level.current = data;
//             setStageLevel(level.current.level);
//             score.current = newScore;
//             saveCurrentLevelAndScore(level.current, score.current); // Save current level and score
//         } catch (error) {
//             console.error('Error updating level and score:', error);
//         }
//     };
//
//     /!**
//      * Updates the user's health data and sets the health state.
//      *
//      * @param {number} data - The new health value to update.
//      * @throws {Error} If there is an error updating the health.
//      *!/
//     const updateHealth = (data) => {
//         try {
//             userHealth.current = data;
//             setHealth(userHealth.current);
//         } catch (error) {
//             console.error('Error updating health:', error);
//         }
//     };
//
//     useEffect(() => {
//         SoundManager.initializeSounds(); // Ensure sounds are initialized on app load
//     }, []);
//
//     const playExplosionSound = (soundOn) => {
//         if (soundOn) {
//             SoundManager.playSound('explosion');
//         }
//     };
//
//     const playShotSound = (soundOn) => {
//         if (soundOn) {
//             SoundManager.playSound('shot');
//         }
//     };
//     const playCollisionSound = (soundOn) => {
//         if (soundOn) {
//             SoundManager.playSound('collision');
//         }
//     };
//     const playLoseSound = (soundOn) => {
//         if (soundOn) {
//             SoundManager.playSound('lose');
//         }
//     };
//     const playBonusSound = (soundOn) => {
//         if (soundOn) {
//             SoundManager.playSound('bonus');
//         }
//     };
//     const playWinSound = (soundOn) => {
//         if (soundOn) {
//             SoundManager.playSound('win');
//         }
//     };
//
//
//
//     useEffect(() => {
//         const loadInitialData = async () => {
//             try {
//                 console.log('Loading initial data');
//                 await loadHighScores();
//                 await loadLatestScore();
//                 await loadCurrentLevelAndScore();
//                 await unlockOrientation();
//             } catch (error) {
//                 console.error('Error loading initial data:', error);
//             }
//         };
//         loadInitialData().then(() => {
//             // Ensure the loading screen shows for at least 4.5 seconds
//             setTimeout(() => {
//                 setIsLoaded(true);
//                 console.log('Loading complete, switching to main app');
//             }, 4500);
//         });
//     }, []);
//
//     /!**
//      * Asynchronously loads high scores.
//      *
//      * @function loadHighScores
//      * @async
//      * @returns {Promise<void>} - A Promise that resolves when high scores are loaded.
//      * @throws {Error} - If there is an error loading high scores.
//      *!/
//         // Function to load high scores on app initialization
//     const loadHighScores = async () => {
//             try {
//                 // Fetch high scores from AsyncStorage
//                 const scores = await getHighScores();
//                 console.log('Loaded high scores:', scores);
//
//                 // Update state with fetched scores
//                 setHighScores(scores);
//             } catch (error) {
//                 console.error('Failed to load high scores:', error);
//             }
//         };
//
//
//     /!**
//      * Loads the latest score asynchronously.
//      *
//      * @async
//      * @function loadLatestScore
//      * @returns {Promise<void>} A Promise that resolves when the latest score is loaded.
//      *
//      * @throws {Error} If failed to load the latest score.
//      *
//      * @example
//      * loadLatestScore()
//      *     .then(() => {
//      *         console.log('Latest score loaded');
//      *     })
//      *     .catch((error) => {
//      *         console.error('Failed to load latest score', error);
//      *     });
//      *!/
//     const loadLatestScore = async () => {
//         try {
//             const score = await getLatestScore();
//             setLatestScore(score);
//             console.log('Latest score loaded');
//         } catch (error) {
//             console.error('Failed to load latest score', error);
//         }
//     };
//
//     /!**
//      * Loads the current level and score.
//      *
//      * @async
//      * @function loadCurrentLevelAndScore
//      * @returns {Promise<void>} - A Promise that resolves with no value when the current level and score are loaded successfully.
//      * @throws {Error} - If an error occurs while loading the current level and score.
//      *
//      * @example
//      * // usage example:
//      *
//      * try {
//      *    await loadCurrentLevelAndScore();
//      * } catch (error) {
//      *    console.error(error);
//      * }
//      *!/
//     const loadCurrentLevelAndScore = async () => {
//         try {
//             const { level, score } = await getCurrentLevelAndScore();
//             level.current = level;
//             setStageLevel(level.level);
//             score.current = score;
//             console.log('Loaded current level and score:', level, score);
//         } catch (error) {
//             console.error('Failed to load current level and score', error);
//         }
//     };
//
//     /!**
//      * Updates the score by adding 100 points to the current score.
//      * Saves the latest score and loads the high scores.
//      * If an error occurs, logs an error message.
//      *
//      * @function updateScore
//      *!/
//     const updateScore = () => {
//         try {
//             const newScore = score.current + 100;
//             score.current = newScore;
//             saveLatestScore(newScore);
//             loadHighScores();
//         } catch (error) {
//             console.error('Error updating score:', error);
//         }
//     };
//
//     /!**
//      * Updates the enemies data.
//      *
//      * @param {Array} data - The new enemy data.
//      * @returns {void}
//      *
//      * @example
//      * updateEnemies(['enemy1', 'enemy2']);
//      *!/
//     const updateEnemies = (data) => {
//         try {
//             enemies.current = data;
//         } catch (error) {
//             console.error('Error updating enemies:', error);
//         }
//     };
//
//     /!**
//      * Updates the walls with the given data.
//      *
//      * @param {any} data - The data to update the walls with.
//      * @returns {void}
//      *!/
//     const updateWalls = (data) => {
//         try {
//             walls.current = data;
//         } catch (error) {
//             console.error('Error updating walls:', error);
//         }
//     };
//
//     /!**
//      * Handles the action to show high scores.
//      *
//      * @function
//      * @name handleShowHighScores
//      *
//      * @returns {void}
//      *
//      * @throws {Error} If an error occurs while handling the action to show high scores.
//      *!/
//     const handleShowHighScores = () => {
//         try {
//             setShowHighScores(true);
//         } catch (error) {
//             console.error('Error handling show high scores:', error);
//         }
//     };
//
//     /!**
//      * Handles the action of going back in the application.
//      * This function is responsible for resetting the state of ShowHighScores and ShowCredits to false.
//      * If an error occurs, it logs the error message to the console.
//      *!/
//     const handleGoBack = () => {
//         try {
//             setShowHighScores(false);
//             setShowCredits(false);
//         } catch (error) {
//             console.error('Error handling go back:', error);
//         }
//     };
//
//     /!**
//      * Function to handle adding high scores.
//      *
//      * @async
//      * @function handleAddHighScore
//      * @returns {Promise<void>} - A promise that resolves when the high score is successfully added.
//      *!/
//     const handleAddHighScore = async () => {
//         try {
//             await addHighScore(score.current);
//         } catch (error) {
//             console.error('Failed to add high score', error);
//         }
//     };
//
//     /!**
//      * Sets the value of walls.current with the given data.
//      *
//      * @param {any} data - The data to set as walls.current value.
//      * @returns {void}
//      *!/
//     const setWalls = (data) => {
//         try {
//             walls.current = data;
//         } catch (error) {
//             console.error('Error setting walls:', error);
//         }
//     };
//
//     /!**
//      * Sets the value of the orientationChange variable.
//      *
//      * @param {any} data - The new value for orientationChange.
//      * @returns {void}
//      *!/
//     const setOrientationChange = (data) => {
//         try {
//             orientationChange.current = data;
//         } catch (error) {
//             console.error('Error setting orientation change:', error);
//         }
//     };
//
//     /!**
//      * Toggles the sound on/off.
//      *
//      * @function
//      * @name toggleSound
//      * @returns {void}
//      *
//      * @description
//      * The toggleSound function is responsible for toggling the sound on/off.
//      *
//      * It attempts to call the setSoundOn function with the opposite value of soundOn variable.
//      * If an error occurs during the toggle, it logs an error message to the console.
//      *!/
//     const toggleSound = () => {
//         try {
//             setSoundOn(!soundOn);
//         } catch (error) {
//             console.error('Error toggling sound:', error);
//         }
//     };
//
//     /!**
//      * Handles the layout change event by updating the orientation and application dimensions.
//      *
//      * @function handleLayout
//      * @returns {void}
//      * @throws {Error} If there is an error handling the layout.
//      *!/
//     const handleLayout = () => {
//         try {
//             const { width, height } = Dimensions.get("window");
//             const newOrientation = width > height ? 'landscape' : 'portrait';
//             setOrientation(newOrientation);
//             appDimensions.current = { width, height };
//             orientationChange.current = true;
//         } catch (error) {
//             console.error('Error handling layout:', error);
//         }
//     };
//
//     /!**
//      * Handles the continue action when the user chooses to continue the game.
//      *
//      * This function updates the level, score, health, bullet control, and game state.
//      * It also handles any errors that occur during the continue action.
//      *!/
//     const handleContinue = () => {
//         try {
//             const nextLevel = level.current.level + 1;
//             const newScore = score.current; // Keep the current score
//             updateLevelAndScore({
//                 level: nextLevel,
//                 generated: false
//             }, newScore);
//             const newHealth = Math.min(userHealth.current + 50, 400); // Add 50 health on level up, max 400
//             updateHealth(newHealth);
//             controlBullet(null); // Reset bullet control
//             setShowWinMenu(false);
//             setRunning(true);
//             isGameOverRef.current = false;
//         } catch (error) {
//             console.error('Error handling continue:', error);
//         }
//     };
//
//     /!**
//      * Handles the main menu functionality.
//      * It resets game settings, user health, bullet control, and unlocks orientation.
//      *
//      * @function handleMainMenu
//      * @throws {Error} If an error occurs while handling the main menu functionality.
//      *!/
//     const handleMainMenu = () => {
//         setPaused(false)
//         setRunning(false);
//         setShowWinMenu(false);
//         userHealth.current = 100;
//         setHealth(userHealth.current);
//         controlBullet(null); // Reset bullet control
//         unlockOrientation();
//     };
//
//     /!**
//      * Handles the win event and performs necessary actions.
//      * @function
//      * @returns {void}
//      *!/
//     const handleWin = () => {
//         try {
//             setShowWinMenu(true);
//             setRunning(false);
//         } catch (error) {
//             console.error('Error handling win:', error);
//         }
//     };
//
//     /!**
//      * Lock the orientation of the screen to landscape mode.
//      *
//      * @async*!/
//     const lockOrientation = async () => {
//         try {
//             await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
//         } catch (error) {
//             console.error('Error locking orientation:', error);
//         }
//     };
//
//     /!**
//      * Unlocks the orientation of the screen.
//      *
//      * This function uses the ScreenOrientation*!/
//     const unlockOrientation = async () => {
//         try {
//             await ScreenOrientation.unlockAsync();
//         } catch (error) {
//             console.error('Error unlocking orientation:', error);
//         }
//     };
//
//     /!**
//      * Handles the retry functionality.
//      * Resets the game state to the beginning of the current level and score,
//      *!/
//     const handleRetry = () => {
//         try {
//             const currentLevel = level.current.level; // Keep the current level
//             const currentScore = score.current; // Keep the current score
//             updateLevelAndScore({
//                 level: currentLevel,
//                 generated: false
//             }, currentScore);
//             userHealth.current = 100;
//             setHealth(userHealth.current);
//             controlBullet(null); // Reset bullet control
//             setRunning(true);
//             isGameOverRef.current = false;
//         } catch (error) {
//             console.error('Error handling retry:', error);
//         }
//     };
//
//     /!**
//      * Function to handle loading completion.
//      * Set isLoaded state to true and*!/
//     const handleLoadingComplete = () => {
//         setIsLoaded(true);
//         console.log('Loading complete, switching to main app');
//     };
//
//     /!**
//      * Function to handle pausing a process.
//      *
//      * @function
//      * @name handle*!/
//     const handlePause = () => {
//         setPaused(true);
//         setRunning(false);
//     };
//     // Create refs for joystick and shoot button
//     const joystickRef = useRef(); // No initial value
//     const shootButtonRef = useRef(); // No initial value
//
//
//     /!**
//      * Function to handle resuming a task or process.
//      * It sets the paused status to false*!/
//     const handleResume = () => {
//         setPaused(false);
//         setRunning(true);
//     };
//
//     if (!isLoaded) {
//         console.log('Displaying loading screen');
//         return <MainLoad onLoadingComplete={handleLoadingComplete} />;
//     }
//
//
//     console.log('Displaying main app content');
//     console.log(paused)
//     return (
//         <GestureHandlerRootView style={{ flex: 1 }}>
//             <View style={styles.container} onLayout={handleLayout}>
//                 <StatusBar hidden={true} />
//                 {showHighScores ? (
//                     <HighScoreMenu onGoBack={handleGoBack} />
//                 ) : showSettings ? (
//                     <Sounds onToggleSound={toggleSound} soundOn={soundOn} onGoBack={() => setShowSettings(false)} />
//                 ) : showWinMenu ? (
//                     <WinMenu
//                         onContinue={handleContinue}
//                         onMainMenu={handleMainMenu}
//                         isGameOver={isGameOverRef.current}
//                         currentHealth={health}
//                         currentScore={score.current}
//                     />
//                 ) : showCredits ? (
//                     <Credits onClose={handleGoBack} />
//                 ) : paused ? (
//                     <GamePlayMenu onResume={handleResume} onMainMenu={handleMainMenu} onSettings={() => setShowSettings(true)} />
//                 ) : running && health > 0 ? (
//                     <>
//                         <Text style={styles.levelText}>Level: {stageLevel}</Text>
//                         <Text style={styles.scoreText}>Score: {score.current}</Text>
//                         <View style={styles.playerHealthContainer}>
//                             <Image source={heartIcon} style={styles.heartIcon} />
//                             <Text style={styles.healthText}>{health}</Text>
//                         </View>
//                         <GameEngine
//                             ref={gameEngineRef}
//                             style={styles.gameEngine}
//                             systems={[
//                                 (entities, time) => Physics(entities, time, soundOn)
//                             ]}
//                             entities={{
//                                 getOrientationChange: () => orientationChange.current,
//                                 setOrientationChange: (data) => setOrientationChange(data),
//                                 physics: { engine: Matter.Engine.create(), world: Matter.World.create(options) },
//                                 tank: { body: Matter.Bodies.rectangle(100, 100, 64, 46), color: 'blue', renderer: Tank, health: userHealth.current, ai: false },
//                                 getControlState: () => gameEngineRef.current,
//                                 getBulletState: () => bulletRef.current,
//                                 getScreenDimension: () => appDimensions.current,
//                                 getCurrentLevel: () => level.current,
//                                 setCurrentLevel: (data) => updateLevelAndScore(data, score.current),
//                                 getCurrentEnemies: () => enemies.current,
//                                 setCurrentEnemies: (data) => updateEnemies(data),
//                                 setBoundaryWalls: (data) => setWalls(data),
//                                 getBoundaryWalls: () => walls.current,
//                                 getUserHealth: () => userHealth.current,
//                                 setUserHealth: (data) => updateHealth(data),
//                                 updateScore: () => updateScore(),
//                                 setHighScore: () => handleAddHighScore(),
//                                 getCurrentWalls: () => walls.current,
//                                 setCurrentWalls: (data) => updateWalls(data),
//                                 getGameOver: () => isGameOverRef.current,
//                                 setWin: handleWin,
//                                 onBoostCollected: () => updateScore(),  // Ensure this is passed
//                                 soundOn: soundOn,
//                             }}
//                         />
//
//                         <TouchableOpacity onPress={handlePause} style={styles.pauseButton}>
//                             <PauseIcon name="pause" size={30} color="black" />
//                         </TouchableOpacity>
//                         <Joystick
//                             controlEngine={controlEngine}
//                             controlBullet={controlBullet}
//                             joystickRef={joystickRef}
//                             shootButtonRef={shootButtonRef}
//                         />
//                     </>
//                 ) : health <= 0 ? (
//                     <GameOverMenu
//                         onRetry={handleRetry}
//                         onMainMenu={() => {
//                             try {
//                                 setRunning(false);
//                                 userHealth.current = 100;
//                                 setHealth(userHealth.current);
//                                 controlBullet(null); // Reset bullet control
//                                 unlockOrientation();
//                             } catch (error) {
//                                 console.error('Error handling main menu from game over:', error);
//                             }
//                         }}
//                         isGameOver={isGameOverRef.current}
//                     />
//                 ) : (
//                     <MenuWithOrientation
//                         onStartGame={async () => {
//                             try {
//                                 const { level, score } = await getCurrentLevelAndScore();
//                                 updateLevelAndScore({
//                                     level: level.level,
//                                     generated: false
//                                 }, score);
//                                 userHealth.current = 100;
//                                 setHealth(userHealth.current);
//                                 controlBullet(null); // Reset bullet control
//                                 setRunning(true);
//                                 await lockOrientation();
//                             } catch (error) {
//                                 console.error('Error starting game:', error);
//                             }
//                         }}
//                         onSettings={() => setShowSettings(true)}
//                         onCredits={() => setShowCredits(true)}
//                         onShowHighScores={handleShowHighScores}
//                     />
//                 )}
//             </View>
//         </GestureHandlerRootView>
//     );
// }
//
// /!**
//  * The styles object contains the following CSS-in-JS styles for a React Native application:
//  *
//  *
//  * - `container`: Styling for the container element.
//  * - `levelText`: Styling for the level text element.
//  * - `scoreText`: Styling for the score text element.
//  * - `playerHealthContainer`: Styling for the player health container element.
//  * - `heartIcon`: Styling for the heart icon element.
//  * - `healthText`: Styling for the health text element.
//  * - `controls`: Styling for the controls container element.
//  * - `control`: Styling for each control element.
//  * - `controlText`: Styling for the text within each control element.
//  * - `pauseButton`: Styling for the pause button element.
//  * - `pauseButtonText`: Styling for the text within the pause button element.
//  *
//  * @typedef {Object} Styles
//  * @property {object} container - Flex styles and background color for the container element.
//  * @property {object} levelText - Styling for the level text element including position, font size, and color.
//  * @property {object} scoreText - Styling for the score text element including position, font size, and color.
//  * @property {object} playerHealthContainer - Styling for the player health container element including position, flexDirection, and alignItems.
//  * @property {object} heartIcon - Styling for the heart icon element including width, height, and margin.
//  * @property {object} healthText - Styling for the health text element including font size, font weight, and color.
//  * @property {object} controls - Styling for the controls container element including flex, flexDirection, and justifyContent.
//  * @property {object} control - Styling for each control element including flex, alignItems, justifyContent, width, height, and background color.
//  * @property {object} controlText - Styling for the text within each control element including color.
//  * @property {object} pauseButton - Styling for the pause button element including position, backgroundColor, padding, border radius, and zIndex.
//  * @property {object} pauseButtonText - Styling for the text within the pause button element including font size, font weight, and color.
//  *!/
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'green',
//     },
//     levelText: {
//         position: 'absolute',
//         top: 20,
//         left: 105,
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: 'black',
//         zIndex: 10, // Ensure text is on top
//     },
//     scoreText: {
//         position: 'absolute',
//         top: 20,
//         right: 25,
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: 'black',
//         zIndex: 10, // Ensure text is on top
//     },
//     playerHealthContainer: {
//         position: 'absolute',
//         top: 20,
//         left: '50%',
//         transform: [{ translateX: -50 }],
//         flexDirection: 'row',
//         alignItems: 'center',
//         zIndex: 10, // Ensure health is on top
//     },
//     heartIcon: {
//         width: 30,
//         height: 30,
//         marginRight: 5,
//     },
//     healthText: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: 'red',
//     },
//     controls: {
//         flex: 0,
//         flexDirection: "row",
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: "absolute",
//         bottom: 0,
//         left: 0,
//         width: '100%'
//     },
//     control: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: 100,
//         height: 50,
//         backgroundColor: 'black',
//     },
//     controlText: {
//         color: 'white'
//     },
//     pauseButton: {
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         backgroundColor: 'yellow',
//         padding: 10,
//         borderRadius: 0,
//         zIndex: 10, // Ensure button is on top
//     },
//     pauseButtonText: {
//         fontSize: 10,
//         fontWeight: 'bold',
//         color: 'black',
//     }
//
*/
