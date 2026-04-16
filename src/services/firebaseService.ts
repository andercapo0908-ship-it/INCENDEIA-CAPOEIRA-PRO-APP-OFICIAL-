import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Master, 
  TrainingLocation, 
  Event, 
  GalleryItem, 
  ChatMessage, 
  ForumPost, 
  User,
  NavItemConfig,
  Partner,
  Product,
  Payment
} from '../types';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Generic CRUD ---

export const getCollection = <T>(collectionName: string, callback: (data: T[]) => void, constraints: QueryConstraint[] = []) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, collectionName));
};

export const addDocument = async <T extends { id?: string }>(collectionName: string, data: T) => {
  const id = data.id || Date.now().toString();
  const docRef = doc(db, collectionName, id);
  try {
    await setDoc(docRef, { ...data, id });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionName}/${id}`);
  }
};

export const updateDocument = async <T extends { id?: string }>(collectionName: string, data: Partial<T>) => {
  if (!data.id) throw new Error("ID is required for update");
  const docRef = doc(db, collectionName, data.id);
  try {
    await updateDoc(docRef, data as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${data.id}`);
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
};

// --- Specific Services ---

export const userService = {
  getProfile: (userId: string, callback: (user: User | null) => void) => {
    const docRef = doc(db, 'users', userId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as User);
      } else {
        callback(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${userId}`));
  },
  getProfileAsync: async (userId: string): Promise<User | null> => {
    const docRef = doc(db, 'users', userId);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  },
  saveProfile: async (user: User) => {
    const docRef = doc(db, 'users', user.id);
    try {
      await setDoc(docRef, user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  }
};

export const configService = {
  getLayout: (callback: (config: any) => void) => {
    const docRef = doc(db, 'config', 'layout');
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) callback(doc.data());
    });
  },
  saveLayout: async (config: any) => {
    await setDoc(doc(db, 'config', 'layout'), config);
  },
  getNavigation: (callback: (config: NavItemConfig[]) => void) => {
    const docRef = doc(db, 'config', 'navigation');
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) callback(doc.data().items);
    });
  },
  saveNavigation: async (items: NavItemConfig[]) => {
    await setDoc(doc(db, 'config', 'navigation'), { items });
  },
  getHistory: (callback: (text: string) => void) => {
    const docRef = doc(db, 'config', 'history');
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) callback(doc.data().text);
    });
  },
  saveHistory: async (text: string) => {
    await setDoc(doc(db, 'config', 'history'), { text });
  }
};
