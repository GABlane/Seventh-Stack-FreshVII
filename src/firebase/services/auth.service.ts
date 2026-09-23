import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config";

export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = credential.user;

    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      displayName: displayName ?? null,
      createdAt: serverTimestamp(),
    });

    return credential;
  } catch (error) {
    throw error;
  }
}

export async function login(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
