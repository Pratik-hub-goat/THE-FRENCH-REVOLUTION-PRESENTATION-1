/* =========================================================
   THE FRENCH REVOLUTION
   FIREBASE / FIRESTORE
   Shared media + MCQ system
   ========================================================= */

"use strict";


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCNB8UkawDNBXjwnxcPf5a74ODQ9NaRGvM",
    authDomain: "the-french-revolution-f7b52.firebaseapp.com",
    projectId: "the-french-revolution-f7b52",
    storageBucket: "the-french-revolution-f7b52.firebasestorage.app",
    messagingSenderId: "795251506165",
    appId: "1:795251506165:web:473957440cf9173900bebc"
};


/* =========================================================
   FIREBASE SDK
   ========================================================= */

const FIREBASE_SDK_VERSION = "12.19.0";

let firebaseApp = null;
let firestoreDb = null;
let firestoreReady = false;
let firestoreLoading = null;

function firebaseConfigIsReady() {
    return Boolean(
        FIREBASE_CONFIG.apiKey &&
        FIREBASE_CONFIG.projectId &&
        FIREBASE_CONFIG.appId
    );
}


/* =========================================================
   LOAD FIRESTORE
   ========================================================= */

async function loadFirestore() {

    if (firestoreReady && firestoreDb) {
        return firestoreDb;
    }

    if (!firebaseConfigIsReady()) {
        return null;
    }

    if (firestoreLoading) {
        return firestoreLoading;
    }

    firestoreLoading = (async () => {

        try {

            const appModule =
                await import(
                    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
                );

            const firestoreModule =
                await import(
                    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
                );

            firebaseApp =
                appModule.getApps().length
                    ? appModule.getApps()[0]
                    : appModule.initializeApp(
                        FIREBASE_CONFIG
                    );

            firestoreDb =
                firestoreModule.getFirestore(
                    firebaseApp
                );

            firestoreReady = true;

            return firestoreDb;

        } catch (error) {

            firestoreLoading = null;

            console.warn(
                "Firebase/Firestore unavailable. Local presentation mode remains active.",
                error
            );

            return null;
        }

    })();

    return firestoreLoading;
}


/* =========================================================
   SAVE MCQ ATTEMPT
   ========================================================= */

async function saveMCQAttempt(attempt) {

    const db = await loadFirestore();

    if (!db) {
        return {
            saved: false,
            reason:
                "firebase-not-configured-or-unavailable"
        };
    }

    try {

        const firestoreModule =
            await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
            );

        const {
            collection,
            addDoc,
            serverTimestamp
        } = firestoreModule;

        const docRef =
            await addDoc(
                collection(
                    db,
                    "frenchRevolutionMCQAttempts"
                ),
                {
                    questionId:
                        attempt?.questionId || null,

                    selectedOption:
                        attempt?.selectedOption || null,

                    correctOption:
                        attempt?.correctOption || null,

                    correct:
                        Boolean(attempt?.correct),

                    createdAt:
                        serverTimestamp()
                }
            );

        return {
            saved: true,
            id: docRef.id
        };

    } catch (error) {

        console.warn(
            "Firestore MCQ attempt save failed:",
            error
        );

        return {
            saved: false,
            reason:
                "firestore-write-failed"
        };
    }
}


/* =========================================================
   LOAD REMOTE MCQs
   ========================================================= */

async function loadRemoteMCQs() {

    const db = await loadFirestore();

    if (!db) {
        return [];
    }

    try {

        const firestoreModule =
            await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
            );

        const {
            collection,
            getDocs,
            orderBy,
            query
        } = firestoreModule;

        const questionsRef =
            collection(
                db,
                "frenchRevolutionQuestions"
            );

        let snapshot;

        try {

            snapshot =
                await getDocs(
                    query(
                        questionsRef,
                        orderBy(
                            "order",
                            "asc"
                        )
                    )
                );

        } catch (orderedQueryError) {

            snapshot =
                await getDocs(
                    questionsRef
                );
        }

        return snapshot.docs.map(
            (doc) => ({
                id: doc.id,
                ...doc.data()
            })
        );

    } catch (error) {

        console.warn(
            "Remote MCQ loading failed:",
            error
        );

        return [];
    }
}


/* =========================================================
   SAVE SHARED MEDIA STATE
   Cloudinary stores the image.
   Firestore stores which image belongs to which slot.
   ========================================================= */

async function saveMediaState(
    mediaId,
    imageUrl
) {

    const db = await loadFirestore();

    if (!db || !mediaId || !imageUrl) {

        return {
            saved: false,
            reason:
                "firebase-not-configured-or-invalid-media"
        };
    }

    try {

        const firestoreModule =
            await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
            );

        const {
            doc,
            setDoc,
            serverTimestamp
        } = firestoreModule;

        await setDoc(
            doc(
                db,
                "frenchRevolutionMedia",
                mediaId
            ),
            {
                mediaId: mediaId,
                imageUrl: imageUrl,
                active: true,
                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        return {
            saved: true,
            mediaId: mediaId
        };

    } catch (error) {

        console.warn(
            "Firestore media save failed:",
            error
        );

        return {
            saved: false,
            reason:
                "firestore-media-write-failed"
        };
    }
}


/* =========================================================
   REAL-TIME MEDIA LISTENER
   Smart-board/device listens for changes.
   ========================================================= */

function watchMediaState(
    mediaId,
    callback
) {

    if (
        !mediaId ||
        typeof callback !== "function"
    ) {
        return () => {};
    }

    let unsubscribe = () => {};

    loadFirestore().then(
        async (db) => {

            if (!db) {
                return;
            }

            try {

                const firestoreModule =
                    await import(
                        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
                    );

                const {
                    doc,
                    onSnapshot
                } = firestoreModule;

                unsubscribe =
                    onSnapshot(
                        doc(
                            db,
                            "frenchRevolutionMedia",
                            mediaId
                        ),
                        (snapshot) => {

                            if (!snapshot.exists()) {
                                return;
                            }

                            callback({
                                id: snapshot.id,
                                ...snapshot.data()
                            });
                        },
                        (error) => {

                            console.warn(
                                "Firestore media listener failed:",
                                error
                            );
                        }
                    );

            } catch (error) {

                console.warn(
                    "Could not start Firestore media listener:",
                    error
                );
            }
        }
    );

    return () => unsubscribe();
}


/* =========================================================
   PUBLIC FIREBASE BRIDGE
   ========================================================= */

window.frenchRevolutionFirebase = {

    config: FIREBASE_CONFIG,

    isConfigured:
        firebaseConfigIsReady,

    loadFirestore,

    saveMCQAttempt,

    loadRemoteMCQs,

    saveMediaState,

    watchMediaState,

    get status() {

        return {
            configured:
                firebaseConfigIsReady(),

            ready:
                firestoreReady
        };
    }
};


/* =========================================================
   CLOUDINARY STATUS
   ========================================================= */

window.frenchRevolutionCloudinary = {

    configured: true,

    cloudName: "skeq3cvt",

    uploadPreset: "THE FRENCH REVOLUTION",

    isConfigured() {

        return Boolean(
            this.cloudName &&
            this.uploadPreset
        );
    }
};


console.info(
    "French Revolution Firebase + Firestore foundation loaded."
);


