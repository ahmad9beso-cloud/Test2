import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** All user data lives in on-device storage (Offline First). One place to swap the backend later. */
export const persistStorage = createJSONStorage(() => AsyncStorage);
