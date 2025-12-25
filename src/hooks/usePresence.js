import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Custom hook to track user presence and count online users
 * Creates a heartbeat document in Firestore that gets updated every 2 minutes
 * Cleans up on unmount
 */
export const usePresence = (userId) => {
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const presenceRef = doc(db, 'presence', userId);
        let heartbeatInterval;

        // Set initial presence
        const setPresence = async () => {
            await setDoc(presenceRef, {
                userId,
                lastSeen: serverTimestamp(),
                online: true
            });
        };

        // Start heartbeat
        setPresence();
        heartbeatInterval = setInterval(setPresence, 120000); // Update every 2 minutes

        // Listen to all online users (active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const presenceQuery = query(
            collection(db, 'presence'),
            where('online', '==', true)
        );

        const unsubscribe = onSnapshot(presenceQuery, (snapshot) => {
            // Filter by lastSeen timestamp (client-side filtering for simplicity)
            const activeUsers = snapshot.docs.filter(doc => {
                const data = doc.data();
                if (!data.lastSeen) return false;
                const lastSeenDate = data.lastSeen.toDate();
                return lastSeenDate > fiveMinutesAgo;
            });
            setOnlineCount(activeUsers.length);
        });

        // Cleanup on unmount
        return () => {
            clearInterval(heartbeatInterval);
            deleteDoc(presenceRef).catch(console.error);
            unsubscribe();
        };
    }, [userId]);

    return onlineCount;
};

/**
 * Hook to track and increment global visit counter
 */
export const useVisitCounter = () => {
    const [visitCount, setVisitCount] = useState(0);

    useEffect(() => {
        const statsRef = doc(db, 'stats', 'global');

        // Listen to visit count
        const unsubscribe = onSnapshot(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                setVisitCount(snapshot.data().visits || 0);
            }
        });

        return unsubscribe;
    }, []);

    return visitCount;
};
