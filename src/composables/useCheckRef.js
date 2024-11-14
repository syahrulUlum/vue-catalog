import { ref } from "vue";
import { getDocs, collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const userRef = ref(null)

const useCheckRef = () => {

    const clearRef = () => {
        localStorage.removeItem('ref_id');
        userRef.value = null
    }

    const getRef = async (id = null) => {
        let refId;
        if (id) {
            refId = id;
        } else {
            refId = localStorage.getItem('ref_id');
        }

        if (!refId) {
            userRef.value = null
        } else {
            const linkRef = collection(db, 'user_referrals');
            const q = query(linkRef, where('link', '==', refId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnapshot = querySnapshot.docs[0];
                userRef.value = docSnapshot.data().link
                localStorage.setItem('ref_id', userRef.value);
            } else {
                clearRef()
                userRef.value = null
            }
        }
    }

    return { userRef, getRef }
}

export default useCheckRef