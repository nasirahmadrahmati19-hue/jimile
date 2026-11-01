// ---------- Firebase Auth — the entry gate of the app ----------
// Every person registers with their Gmail address (@gmail.com) + a password
// through Firebase Authentication (createUserWithEmailAndPassword), and only
// after that can they enter the app. There is NO localStorage involved:
// sessions are kept by Firebase itself (browser session persistence).

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function isGmail(email) {
  return /^[a-z0-9](?:[a-z0-9._+-]*[a-z0-9])?@gmail\.com$/i.test((email || '').trim())
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

// Human-readable Persian messages for Firebase error codes.
function friendlyError(err) {
  const code = err && (err.code || '')
  switch (code) {
    case 'auth/invalid-email':
      return 'نشانی ایمیل معتبر نیست.'
    case 'auth/email-already-in-use':
      return 'این جیمیل قبلاً ثبت شده است — با همان رمز عبور دوباره تلاش کنید (همین فرم هم ورود و هم ثبت‌نام را انجام می‌دهد).'
    case 'auth/weak-password':
      return 'رمز عبور باید حداقل ۶ رقم باشد.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      // Never surfaced to the user anymore: a missing/deleted account is
      // auto-created silently by signInOrSignUp below.
      return 'حساب شما ساخته شد — وارد شوید.'
    case 'auth/wrong-password':
      return 'رمز عبور اشتباه است.'
    case 'auth/too-many-requests':
      return 'چند بار تلاش کردید — کمی صبر کنید و دوباره امتحان کنید.'
    case 'auth/network-request-failed':
      return 'اتصال اینترنتی برقرار نیست — برای ورود به سرور نیاز به اینترنت دارید.'
    case 'auth/configuration-not-found':
      return 'ورود با ایمیل در کنسول Firebase فعال نیست — بخش Authentication → Sign-in method را باز کنید.'
    default:
      if (/network/i.test(err && err.message)) {
        return 'اتصال اینترنتی برقرار نیست — برای ورود به سرور نیاز به اینترنت دارید.'
      }
      return (err && err.message) || 'مشکلی پیش آمد — دوباره تلاش کنید.'
  }
}

// Build the returned user object and best-effort sync the Firestore profile.
async function finalizeUser(user, cleanName, cleanEmail) {
  try {
    if (cleanName && user.displayName !== cleanName) {
      await updateProfile(user, { displayName: cleanName })
    }
  } catch {
    /* non-fatal */
  }
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      { name: cleanName || user.displayName || cleanEmail.split('@')[0], email: cleanEmail },
      { merge: true },
    )
  } catch {
    /* non-fatal: rules may not allow it yet; session still valid */
  }
  return { uid: user.uid, name: cleanName || user.displayName || cleanEmail.split('@')[0], email: cleanEmail }
}

// ---------- one-click sign in OR auto sign-up (email + password ONLY) ----------
// The form has exactly two fields: Gmail address and password. The logic is
// smart: we first TRY to sign in. If Firebase says the account does not exist
// (e.g. it was deleted from the console after a forgotten password), we create
// it on the spot with the typed password — no error, no extra steps. If the
// email exists but the password is wrong, we clearly say so and offer reset.
export async function signInOrSignUp({ email, password }) {
  const cleanEmail = normalizeEmail(email)

  if (!cleanEmail) throw new Error('جیمیل خود را وارد کنید.')
  if (!isGmail(cleanEmail))
    throw new Error('برای ورود باید نشانی جیمیل (…@gmail.com) داشته باشید.')
  if ((password || '').length < 6)
    throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')

  // 1) Try to sign in first.
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password)
    console.log('[auth] ✅ signed in existing account:', cleanEmail)
    const user = await finalizeUser(cred.user, '', cleanEmail)
    return { ok: true, created: false, user }
  } catch (err) {
    const code = err && err.code
    console.error('[auth] sign-in failed:', code)

    // 2) Account missing/deleted → create it silently and sign in.
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      try {
        const ncred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
        console.log('[auth] ✅ account auto-created for', cleanEmail, '| project:', auth?.app?.options?.projectId)
        const user = await finalizeUser(ncred.user, '', cleanEmail)
        return { ok: true, created: true, user }
      } catch (err2) {
        const code2 = err2 && err2.code
        if (code2 === 'auth/email-already-in-use') {
          // Race: account appeared between the two calls — password differs.
          throw new Error(
            'این جیمیل ثبت شده است اما رمز عبور درست نیست. رمز صحیح را وارد کنید یا از «فراموشی رمز عبور» استفاده نمایید.',
          )
        }
        if (code2 === 'auth/weak-password') {
          throw new Error('رمز عبور باید حداقل ۶ رقم باشد.')
        }
        throw new Error(friendlyError(err2))
      }
    }

    // 3) Other failures (wrong password handled above by invalid-credential on
    // newer Firebase; keep explicit branch for older behavior).
    if (code === 'auth/wrong-password') {
      throw new Error(
        'رمز عبور اشتباه است — رمز صحیح را وارد کنید یا از «فراموشی رمز عبور» استفاده نمایید.',
      )
    }
    throw new Error(friendlyError(err))
  }
}

// ---------- kept for API compatibility ----------
export async function registerOrSignIn(params) {
  return signInOrSignUp(params)
}

export async function registerUser(params) {
  return signInOrSignUp(params)
}

export async function loginUser(params) {
  return signInOrSignUp(params)
}

// ---------- password reset ----------

export async function resetPassword(email) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) throw new Error('ابتدا جیمیل خود را وارد کنید.')
  try {
    await sendPasswordResetEmail(auth, cleanEmail)
  } catch (err) {
    if (err && err.code === 'auth/user-not-found') {
      throw new Error('این جیمیل هنوز در برنامه حساب ندارد — کافی است یک بار با یک رمز عبور وارد شوید تا حساب شما ساخته شود.')
    }
    throw new Error(friendlyError(err))
  }
}

// ---------- logout ----------
export async function logout() {
  await signOut(auth)
}

// ---------- live session listener (replaces getSession/currentUser) ----------
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, (fu) => {
    callback(
      fu
        ? {
            uid: fu.uid,
            email: (fu.email || '').toLowerCase(),
            name: fu.displayName || (fu.email || '').split('@')[0],
          }
        : null,
    )
  })
}

// Read the stored Firestore profile (name may be missing on old accounts).
export async function fetchProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}
