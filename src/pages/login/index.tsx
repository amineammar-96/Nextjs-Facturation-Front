import React from "react";
import "../../styles/LoginPageStyle.css";
import "../../app/globals.css";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import Image from "next/image";

import Img1 from "../../../public/assets/logoAux.png";
import Navbar from "../../app/components/layoutComponents/NavbarComponent";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser , faLock, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useRouter();

  useEffect(() => {
    
    const loginValue = localStorage.getItem('login');

    if (loginValue != null && loginValue != '') {
      push('/');
      console.log(loginValue);

    } 
  }, []);

  function login(e : any) {
    e.preventDefault();
    if (username == "david" && password == "azerty") {
      Swal.fire({
        icon: "success",
        showConfirmButton: false,
      });

      
      push('/');
      localStorage.setItem('login', 'true');


    } else {
      Swal.fire({
        icon: "error",
        title: "Veuillez vérifier vos indentifiants",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }

  function usernameHandleChange(event:any){
    const usernameAux = event.target.value;
    setUsername(usernameAux);
  }

  function passwordHandleChange(event:any){
    const passwordAux = event.target.value;
    setPassword(passwordAux);
  }

  return (
    <>
      <Navbar></Navbar>
      <div className="containerLoginBox">
        <div className="containerLoginDiv h-100 w-100">
          <div className="wrapper">
            <form  onSubmit={(e)=>{
login(e);
            }}
                      className="form-signin"
            >
              <h3 className="form-signin-heading">
                Authentification - SAPS
              </h3>
              <hr className="colorgraph" />
              <br />

              <div style={{ position: 'relative' }}>
              <span className="input-icons"> <FontAwesomeIcon
                onClick={() => {
                }}
                className="faUser"
                icon={faUser}
              /></span>

              <input
                value={username}
                type="text"
                className="form-control usernameLoginInput"
                name="Username"
                placeholder="Nom d'utilisateur"
                required
                autoFocus
                onChange={(e) =>{
                    usernameHandleChange(e);
                }}
                id="priceInput"

              />
              </div>

              <div style={{ position: 'relative' }}>
              <span className="input-icons"> <FontAwesomeIcon
                onClick={() => {
                }}
                className="faUser"
                icon={faLock}
              /></span>
              <input
                value={password}
                type="password"
                className="form-control"
                name="Password"
                placeholder="Mot de passe"
                required
                onChange={(e) =>{
                    passwordHandleChange(e);
                    
                }}
              />
              </div>
              <div  className="loginBtnDiv text-center">
                <button
                 style={{ position: 'relative' }}
                  className="btn loginBtn"
                  name="Submit"
                  value="Login"
                  type="submit"
                >
                  <span className="">Se connecter</span>
                  <span> <FontAwesomeIcon
                className="faRightToBracket"
                icon={faRightToBracket}
              /></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
