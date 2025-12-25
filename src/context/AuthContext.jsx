import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase/firebaseConfig';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
    const loginAnonymously = () => signInAnonymously(auth);
    const logout = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Fetch additional profile data (like roles) from Firestore
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                } else {
                    // Create a default profile for new users
                    const newProfile = {
                        email: user.email,
                        role: 'subscriber', // default role
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        createdAt: new Date().toISOString(),
                        permissions: {
                            canPublishResearch: false,
                            canPublishNews: false,
                            canPublishDevelopment: false
                        }
                    };
                    await setDoc(docRef, newProfile);
                    setUserProfile(newProfile);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Permission helper functions
    const canPublishResearch = () => {
        return userProfile?.role === 'admin' || userProfile?.permissions?.canPublishResearch === true;
    };

    const canPublishNews = () => {
        return userProfile?.role === 'admin' || userProfile?.permissions?.canPublishNews === true;
    };

    const canPublishDevelopment = () => {
        return userProfile?.role === 'admin' || userProfile?.permissions?.canPublishDevelopment === true;
    };

    const value = {
        currentUser,
        userProfile,
        loginWithGoogle,
        loginAnonymously,
        logout,
        isAdmin: userProfile?.role === 'admin',
        isModerator: userProfile?.role === 'admin' || userProfile?.role === 'moderator',
        canPublishResearch,
        canPublishNews,
        canPublishDevelopment
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
