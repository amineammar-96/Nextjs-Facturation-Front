import '../../../../styles/loadingCompoentStyle.css'
export default function LoadingComponent({textChildren} : {textChildren:any}) {
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
            <span>
            {/* {textChildren} */}
            </span>
        </div>
        <h2 className="display-1 py-3 my-4">Veuillez patienter votre fichier est en cours de traitement...</h2>

      </div>
    </>
  );
}
