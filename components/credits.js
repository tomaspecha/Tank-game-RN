import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

/**
 * Represents the Credits component.
 * @param {function} onClose - Callback function to be called when the component is closed.
 * @return {JSX.Element} - The rendered Credits component.
 */
const Credits = ({onClose}) => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setCredits([
                {
                    id: 1,
                    title: 'Project Developer',
                    name: 'Tomas Pecha',
                    description: 'BSc (Honours) Computing and IT',
                    link: 'https://github.com/users/tomaspecha/projects/1/views/1'
                },
                {
                    id: 2,
                    title: 'Mentorship and Guidance',
                    name: 'Ms Ju Tope',
                    description: 'Final Project for, Software Engineering in TM470 The computing and IT project'
                },
                {
                    id: 3,
                    title: 'Technical Resources',
                    name: 'Expo Documentation',
                    description: 'Getting started with Expo',
                    link: 'https://docs.expo.dev/get-started/start-developing/'
                },
                {
                    id: 4,
                    title: 'Technical Resources',
                    name: 'Matter.js Documentation',
                    description: 'Physics engine for realistic movements and collisions',
                    link: 'https://brm.io/matter-js/docs/'
                },
                {
                    id: 5,
                    title: 'Community Support',
                    name: 'Stack Overflow',
                    description: 'Solutions to specific coding challenges',
                    link: 'https://stackoverflow.com/questions/tagged/game-engine'
                },
                {
                    id: 6,
                    title: 'Practical Demonstrations',
                    name: 'YouTube Tutorials',
                    description: 'Practical demonstrations of React Native features',
                    link: 'https://www.youtube.com/watch?v=hXogPCM4FS8&t=3058s'
                },
                {
                    id: 7,
                    title: 'Code References',
                    name: 'GitHub Repositories',
                    description: 'Real-world examples of React Native projects',
                    link: 'https://github.com/bberak/react-native-game-engine'
                }
            ]);
            setLoading(false);
        }, 200);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007bff"/>
                <Text style={styles.loadingText}>Loading credits...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Credits</Text>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {credits.map((credit) => (
                    <View key={credit.id} style={styles.creditItem}>
                        <Text style={styles.creditTitle}>{credit.title}</Text>
                        {credit.link ? (
                            <Text style={styles.creditName} onPress={() => Linking.openURL(credit.link)}>
                                {credit.name}
                            </Text>
                        ) : (
                            <Text style={styles.creditName}>{credit.name}</Text>
                        )}
                        <Text style={styles.creditDescription}>{credit.description}</Text>
                    </View>
                ))}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryHeader}>Project Summary</Text>
                    <Text style={styles.summaryText}>
                        This Tank Game project is a cross-platform mobile game developed using React Native, targeting
                        Android and web platforms. It demonstrates the application of game development principles within
                        the React Native framework, showcasing both the potential and challenges of this approach.
                    </Text>
                    <Text style={styles.summaryText}>
                        Key features include responsive controls, real-time physics simulations, AI-driven enemy tanks,
                        and cross-platform compatibility. The project utilizes React Native game engine and Matter.js
                        for physics, overcoming various technical challenges in performance optimization and game
                        design.
                    </Text>
                    <Text style={styles.summaryText}>
                        While React Native proved capable for game development, it presented limitations in rendering
                        performance and physics documentation. Future game developers might consider more specialized
                        game development frameworks for complex projects.
                    </Text>
                </View>

                <View style={styles.finalNoteContainer}>
                    <Text style={styles.finalNoteHeader}>Important Note</Text>
                    <Text style={styles.finalNoteText}>
                        <Text style={styles.boldText}>For those considering creating a game using React Native, note
                            that there are better options available.</Text> React Native has limitations with rendering,
                        causing performance issues, and the documentation beyond basic physics is sparse, requiring
                        custom solutions.
                    </Text>
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
};

/**
 * Variable containing the styles for a component.
 *
 * @type {Object}
 * @property {Object} container - Style for the container.
 * @property {Object} scrollView - Style for the scroll view.
 * @property {Object} loadingText - Style for the loading text.
 * @property {Object} header - Style for the header.
 * @property {Object} creditItem - Style for the credit item.
 * @property {Object} creditTitle - Style for the credit title.
 * @property {Object} creditName - Style for the credit name.
 * @property {Object} creditDescription - Style for the credit description.
 * @property {Object} summaryContainer - Style for the summary container.
 * @property {Object} summaryHeader - Style for the summary header.
 * @property {Object} summaryText - Style for the summary text.
 * @property {Object} finalNoteContainer - Style for the final note container.
 * @property {Object} finalNoteHeader - Style for the final note header.
 * @property {Object} finalNoteText - Style for the final note text.
 * @property {Object} boldText - Style for bold text.
 * @property {Object} button - Style for the button.
 * @property {Object} buttonText - Style for the button text.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b1b1b',
        padding: 20,
    },
    scrollView: {
        paddingVertical: 20,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 20,
    },
    creditItem: {
        marginBottom: 20,
        padding: 15,
        borderWidth: 2,
        borderColor: '#D8A422',
        borderRadius: 10,
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    creditTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D8A422',
    },
    creditName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textDecorationLine: 'underline',
    },
    creditDescription: {
        fontSize: 16,
        color: '#fff',
    },
    summaryContainer: {
        marginTop: 20,
        padding: 15,
        borderWidth: 2,
        borderColor: '#D8A422',
        borderRadius: 10,
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    summaryHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
    },
    finalNoteContainer: {
        marginTop: 20,
        padding: 15,
        borderWidth: 2,
        borderColor: '#D8A422',
        borderRadius: 10,
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    finalNoteHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D8A422',
        marginBottom: 10,
    },
    finalNoteText: {
        fontSize: 16,
        color: '#fff',
    },
    boldText: {
        fontWeight: 'bold',
    },
    button: {
        width: 250,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 1,
        borderWidth: 2,
        borderColor: '#D8A422',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
});

export default Credits;
