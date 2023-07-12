"use client";
import React from 'react'
import Logo from '../../../../public/assets/logoAux.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback } from "react";

export default function FooterComponent() {
  const { push } = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const loginValue = localStorage.getItem('login');

    if (loginValue == null || loginValue == '') {
      setLoggedIn(false);
    }else {
      setLoggedIn(true);
    }
  }, []);

  function logout() {
    localStorage.removeItem('login');
    push('/login');

  }
  return (
    <>
    {loggedIn && (
   <footer>
   <div className="d-flex justify-content-between mx-auto px-5">
     <div>
       <p>


         <Image
           src={Logo}
           alt="Logo"
         
         />
        
       </p>
     </div>

     <div className='logoutBtnDiv d-flex'>
       <p className="logoutBtn d-flex">
         <span onClick={() => {
           logout()
         }} >
           Se déconnecter
           <FontAwesomeIcon
             className="text-white faDoorOpen"
             icon={faDoorOpen}
            
           />
         </span>
        
       </p>
     </div>
   </div>



 </footer>
    )}
   
    </>
  )
}
