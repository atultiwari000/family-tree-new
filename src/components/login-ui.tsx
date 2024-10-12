import React, { useEffect } from 'react';
import {  signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';

import { auth} from '@/firebase';
import useFamilyStore from '@/store/globalFamily';




// Initialize Firebase
const provider = new GoogleAuthProvider();

const LoginUI: React.FC = () => {
  const user =  useFamilyStore((state) => state.user);
  const setUser = useFamilyStore((state) => state.setUser);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log("currentUser", currentUser);
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div className="absolute z-10 m-3 mt-32">
      {user ? (
        <div>
          <div className='flex items-center gap-3 mb-3'>
          <Avatar>
            <AvatarImage src={user.photoURL} alt="user avatar" />
            <AvatarFallback>
              {user.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <h6>{user.displayName}</h6>
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <Button onClick={handleLogin}>Login with Google</Button>
      )}
    </div>
  );
};

export default LoginUI;