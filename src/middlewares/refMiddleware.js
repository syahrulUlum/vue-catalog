import useCheckRef from "@/composables/useCheckRef";

export const requireRef = async (to, from, next) => {
    if (to.name == "Home") {
        return next({ name: "Catalogs" });
    }

    const { userRef, getRef } = useCheckRef();
    await getRef();
    if (userRef.value) {
        next();
    } else {
        next('/not-found');
    }
};