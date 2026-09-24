import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config";
import { isValidPassword } from "../../lib/password";

export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  if (!isValidPassword(password)) throw new Error('Password must be at least 6 characters with a number and a capital letter.')

  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const { uid } = credential.user

  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName: displayName ?? null,
    createdAt: serverTimestamp(),
  })

  return credential
}

export async function login(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}
