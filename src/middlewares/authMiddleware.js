import useAuth from '@/composables/useAuth';

export const requireAuth = async (to, from, next) => {
    const { user, checkSessionExpiration, checkAuthStatus } = useAuth();
    await checkSessionExpiration();
    await checkAuthStatus();
    console.log(user.value);
    

    if (!user.value) {
        next({ name: 'Login' });
    } else {
        next();
    }
};
