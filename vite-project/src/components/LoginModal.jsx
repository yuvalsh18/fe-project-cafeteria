import React, { useEffect, useRef } from 'react';
import { EmailAuthProvider /*, GoogleAuthProvider */ } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import { auth } from '../firebase';
import 'firebaseui/dist/firebaseui.css';

export default function LoginModal() {
    console.log('LoginModal: component rendered');
    const uiRef = useRef(null);
    
    useEffect(() => {
        console.log('LoginModal: useEffect running');
        if (!uiRef.current) {
            uiRef.current = new firebaseui.auth.AuthUI(auth);
        } else {
            uiRef.current.reset();
        }
        uiRef.current.start('#firebaseui-auth-container', {
            signInOptions: [
                {
                    provider: EmailAuthProvider.PROVIDER_ID,
                    disableSignUp: { status: true }
                }
                // GoogleAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
                signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                    console.log('LoginModal: signInSuccessWithAuthResult', { authResult, redirectUrl });
                    return false;
                },
                signInFailure: (error) => {
                    console.error('LoginModal: signInFailure', error);
                },
                uiShown: () => {
                    console.log('LoginModal: FirebaseUI shown');
                }
            },
        });
        return () => {
            if (uiRef.current) {
                console.log('LoginModal: cleaning up FirebaseUI instance');
                uiRef.current.reset();
            }
        };
    }, []);

    return <div id="firebaseui-auth-container" />;
}