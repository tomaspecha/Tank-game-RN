import React from 'react';
import Svg, {G, Path} from 'react-native-svg';

/**
 * Represents a pause icon SVG component.
 * @param {number} width - The width of the pause icon. Default is 24.
 * @param {number} height - The height of the pause icon. Default is 24.
 * @param {string} color - The color of the pause icon. Default is 'black'.
 * @returns {JSX.Element} - Returns the pause icon SVG component.
 */
const PauseIcon = ({ width = 24, height = 24, color = 'black' }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24">
        <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill={color} />
    </Svg>
);

/**
 * Represents an icon component from UIKit library.
 * @typedef {Object} UIKitIcon
 * @property {number} [width=24] - The width of the icon.
 * @property {number} [height=24] - The height of the icon.
 * @property {string} [color='#534434'] - The color of the icon.
 */
const UIKitIcon = ({ width = 24, height = 24, color = '#534434' }) => (
    <Svg width={width} height={height} viewBox="0 0 1500 1000">
        <G>
            <Path
                d="M1465.643,852.467c-3.867,0-7.003-3.135-7.003-7.003c0-39.838-32.41-72.247-72.246-72.247        c-39.838,0-72.248,32.41-72.248,72.247c0,3.867-3.135,7.003-7.003,7.003c-3.867,0-7.003-3.135-7.003-7.003        c0-47.56,38.693-86.253,86.253-86.253c47.559,0,86.251,38.692,86.251,86.253        C1472.646,849.332,1469.51,852.467,1465.643,852.467z"
                fill={color}
            />
        </G>
    </Svg>
);

export { PauseIcon, UIKitIcon };
