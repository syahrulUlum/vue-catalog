import useAuth from '@/composables/useAuth';

export const requireGuest = async(to, from, next) => {
    const { user, checkSessionExpiration, checkAuthStatus } = useAuth();
    await checkSessionExpiration();
    await checkAuthStatus();

    if (user.value) {
        next({ name: 'Dashboard' });
    } else {
        next();
    }
};
