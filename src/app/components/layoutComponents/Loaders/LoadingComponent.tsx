import { useEffect, useState } from 'react';
import '../../../../styles/loadingCompoentStyle.css';

export default function LoadingComponent({textChildren} : {textChildren:any}) {

  const [incrementVariable , setIncrementVariable] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIncrementVariable((prevValue) => prevValue + 1);
    }, 315);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <>
      <div className="loaderDiv">
        <h1>
          Chargement<span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </h1>
        <div id="container">
          <div id="bar"></div>
        </div>
        <div className="textContainer">
            <span style={{ color:"red" }}>
            {incrementVariable} sur {textChildren}
            </span>
        </div>
        <h2 className="display-1 py-3 my-4">Veuillez patienter votre fichier est en cours de traitement...</h2>

      </div>
    </>
  );
}
