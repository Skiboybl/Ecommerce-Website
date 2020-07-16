import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
    apiKey: "AIzaSyA36n9pW0IWzVs3uRkALQq3pxChhLrUrw8",
    authDomain: "crown-db-10911.firebaseapp.com",
    databaseURL: "https://crown-db-10911.firebaseio.com",
    projectId: "crown-db-10911",
    storageBucket: "crown-db-10911.appspot.com",
    messagingSenderId: "410094600829",
    appId: "1:410094600829:web:ae8a8f5c7d4572d4582714",
    measurementId: "G-C84VQTF2YW"
};

export const createUserProfileDocument = async (userAuth, additionalData) => {
    if (!userAuth) return;
    const userRef = firestore.doc(`users/${userAuth.uid}`);

    const snapShot = await userRef.get();

    if (!snapShot.exists) {
        const { displayName, email } = userAuth;
        const createdAt = new Date();

        try {
            await userRef.set({
                displayName,
                email,
                createdAt,
                ...additionalData
            })
        } catch (error) {
            console.log('error creating a user', error.message);
        }
    }

    return userRef;

};

export const addCollectionAndDocuments = async (collectionKey, objectsToAdd) => {
    const collectionRef = firestore.collection(collectionKey);

    const batch = firestore.batch();
    objectsToAdd.forEach(obj => {
        // set up unique keys 
        const newDocRef = collectionRef.doc();
        // set up new value
        batch.set(newDocRef, obj);
    });
    // fire off our batch request, returns us a Promise
    return await batch.commit()
};

// covert to an object, and add new properties
export const convertCollectionSnapshotToMap = (collections) => {
    const transformedCollection = collections.docs.map(doc => {
        const { title, items } = doc.data();
        return {
            // convert symbols URL can read
            routeName: encodeURI(title.toLowerCase()),
            id: doc.id,
            title,
            items
        }
    });
    // console.log(transformedCollection);

    return transformedCollection.reduce((accumulator, collection) => {
        accumulator[collection.title.toLowerCase()] = collection;
        return accumulator;
    }, {})
}


firebase.initializeApp(config);

// write new method to check on the user session
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(userAuth => {
            unsubscribe();
            resolve(userAuth);
        }, reject)
    })
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => auth.signInWithPopup(googleProvider);

