import React from 'react'
import Logo from '../../../../public/assets/logoAux.png';
import Image from 'next/image';

export default function AuxNavbarComponent() {
  return (
    <>
      <nav className="navbar">
        <div className="">
         
          <div>
          <a className="navbar-brand" href="/">
          <Image
            src={Logo}
            alt="Logo"
            width={200} 
            height={50}
          />
          </a>
          </div>
        </div>
      </nav>
      
    </>
  )
}
