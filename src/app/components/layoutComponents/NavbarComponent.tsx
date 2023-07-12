"use client";
import React from 'react'
import Logo from '../../../../public/assets/logoAux.png';
import Image from 'next/image';
import { useState, useEffect, useCallback } from "react";

import { useRouter } from 'next/router';

export default function NavbarComponent() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [fullUrl , setFullUrl]=useState('');
  useEffect(() => {
    setFullUrl(window.location.pathname);
    console.log(fullUrl);
    localStorage.setItem('pathname' , fullUrl);
    const loginValue = localStorage.getItem('login');

    if (loginValue != null && loginValue != '') {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);

    }
  }, []);


  function updateActiveUrl(ch : any){
    localStorage.setItem('pathname' , ch);
    setFullUrl(ch);
  }


  return (
    <>
      <nav className="navbar">
        <div className="">
          {loggedIn && (
            <div className='linksDiv'>
              <ul>
               <li className={fullUrl ==="/" ? 'activeLink' : ''} ><a  onClick={()=> {
                  updateActiveUrl('/');
                }}  href="/"><span>Facturation</span></a></li>

                <li className={fullUrl ==="/mollie-users" ? 'activeLink' : ''}><a onClick={()=> {
                  updateActiveUrl('/mollie-users');
                }}  href="/mollie-users"><span>Paiement</span></a></li>
             
             <li  className={fullUrl ==="/statistiques" ? 'activeLink' : ''} ><a onClick={()=> {
                  updateActiveUrl('/statistiques');
                }} href="/statistiques"><span>Dashboard</span></a></li>
              
             
              </ul>
            </div>
           )} 
          <div>
            <a onClick={()=> {
                  updateActiveUrl('/');
                }} className="navbar-brand" href="/">
              <Image
                src={Logo}
                alt="Logo"
                width={200} // Adjust thewidth and height as needed
                height={50}
              />
            </a>
          </div>
        </div>
      </nav>

    </>
  )
}
