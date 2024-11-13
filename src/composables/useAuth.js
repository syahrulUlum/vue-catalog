import { ref } from 'vue';
import { auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const user = ref(null);
const sessionExpiration = ref(null);

const setSession = (token) => {
    const expirationTime = new Date(token.expirationTime);
    localStorage.setItem('user', JSON.stringify({
        expirationTime,
        email: token.claims.email,
    }));
    sessionExpiration.value = expirationTime;
};

const clearSession = () => {
    localStorage.removeItem('user');
    sessionExpiration.value = null;
    user.value = null;
};

const checkAuthStatus = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
        resolve(currentUser);
      });
    });
  };
  

const useAuth = () => {
    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const token = await result.user.getIdTokenResult();
        setSession(token);
        user.value = result.user;
    };

    const logout = async () => {
        await signOut(auth);
        clearSession();
    };

    const checkSessionExpiration = async() => {
        const session = JSON.parse(localStorage.getItem('user'));
        if (session) {
            const currentTime = new Date().getTime();
            if (currentTime > session.expirationTime) {
                await logout();
            } else {
                user.value = auth.currentUser;
            }
        }else{
            await logout();
        }
    };

    return { user, login, logout, checkAuthStatus, checkSessionExpiration };
};

export default useAuth;
