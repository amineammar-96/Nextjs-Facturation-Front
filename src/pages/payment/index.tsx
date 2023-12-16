import React, { useRef } from "react";
import "../../styles/PaymentPageStyle.css";
import "../../app/globals.css";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

import Navbar from "../../app/components/layoutComponents/AuxNavbarComponent";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useRouter } from "next/router";
export default function PaymentPage() {
  const router = useRouter();
  const urlApi = "https://api.facturation.editeur-dentaire.fr/api";
  const [invoiceDetails, setInvoiceDetails] = useState<any>({});
  const [mollieUsersArray, setMollieUsersArray] = useState([]);
  const [mollieUserId, setMollieUserId] = useState("");
  const [mandateExists, setMandateExists] = useState(false);
  const { push } = useRouter();
  const priceInputRef = useRef<HTMLInputElement>(null);
  const [totalPaymentPrice, setTotalPaymentPrice] = useState(0);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);


  const [newPaymentAmount, setNewPaymentAmount] = useState(0);




  function handleTotalPaymentPriceChange(e: any) {
    let value = e.target.value;
    setNewPaymentAmount(value);
  }
  const handlePriceInput = () => {
    const price = parseFloat(priceInputRef.current?.value || '');
    let totalAux = invoiceDetails.total.replace("€", "");
    totalAux = totalAux.replace(" ", "");
    totalAux = totalAux.replace(",", "");

    if (!isNaN(price) && priceInputRef.current
    ) {
      priceInputRef.current.value = price.toFixed(2);
    }

    if (priceInputRef.current
    &&
    price < 0
    ) {
      priceInputRef.current.value = "0.00";
    }

    if ((price > ((totalInvoiceAmount - invoiceDetails.totalPaid)))  && priceInputRef.current) {
      priceInputRef.current.value = (totalInvoiceAmount - invoiceDetails.totalPaid).toFixed(2);
    }
  };

  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    getAllPayments();
  }, []);

  useEffect(() => {
    console.log('newPaymentAmountnewPaymentAmountnewPaymentAmountnewPaymentAmount : ', newPaymentAmount);
    console.log("totalInvoiceAmounttotalInvoiceAmounttotalInvoiceAmounttotalInvoiceAmount: ", totalInvoiceAmount );
    console.log('totalPaymentPricetotalPaymentPricetotalPaymentPricetotalPaymentPrice : ', totalPaymentPrice);


    
  }, [invoiceDetails, totalInvoiceAmount, totalPaymentPrice, newPaymentAmount]);


  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (mollieUserId != "") {
      getMandatByCustomerId();
    }
  }, [mollieUserId]);

  useEffect(() => {
    getAllMollieUsers();

    if (router.query.id) {
      console.log("id:", router.query.id);
      getInvoiceDetailsForPayment(router.query.id);
    }
  }, [router.query.id]);

  function getInvoiceDetailsForPayment(id: any) {
    axios
      .post(`${urlApi}/invoice_retreive_payment?id=` + id)
      .then((response) => {
        console.log("response: ", response.data.jsonInvoice);
        if (response.data.jsonInvoice.totalPaid == null) {
          response.data.jsonInvoice.totalPaid = 0;
        }else {
          
          setTotalPaymentPrice(response.data.jsonInvoice.totalPaid);
        }
        if (response.data.jsonInvoice.paymentStatus == null) {
          response.data.jsonInvoice.paymentStatus = "";
        }



        let totalAux = response.data.jsonInvoice.total.replace("€", "");
        totalAux = totalAux.replace(" ", "");
        totalAux = totalAux.replace(",", ".");
        totalAux=(parseFloat(totalAux.replace(" ", "").replace(/\s/g, '')));
        totalAux = totalAux.toFixed(2); 
        
        setTotalInvoiceAmount(totalAux);






        let totalAuxNewOne = response.data.jsonInvoice.totalPaid.replace("€", "");
        totalAuxNewOne = totalAuxNewOne.replace(" ", "");
        totalAuxNewOne = totalAuxNewOne.replace(",", ".");
        totalAuxNewOne=(parseFloat(totalAuxNewOne.replace(" ", "").replace(/\s/g, '')));
        totalAuxNewOne = totalAuxNewOne.toFixed(2); 

        let diffAux = (parseFloat(totalAux) - parseFloat(totalAuxNewOne)).toFixed(2)

        

        setInvoiceDetails(response.data.jsonInvoice);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  }

  function convertDateFormat(dateString: any) {
    if (dateString) {
      const [month, day, year] = dateString.split("/");
      const date = new Date(`${month}/${day}/${year}`);

      const formattedDay = String(date.getDate()).padStart(2, "0");
      const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
      const formattedYear = String(date.getFullYear());

      return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    } else {
      console.error("Invalid dateString");
    }
  }

  function getAllMollieUsers() {
    let mollieUsersArrayAux: any = [];
    axios
      .get(`${urlApi}/mollie_users`)
      .then((response) => {
        console.log(response.data.mollieUsers);
        response.data.mollieUsers.forEach((element: any) => {
          mollieUsersArrayAux.push(element);
        });

        setMollieUsersArray(mollieUsersArrayAux);
      })
      .catch((err) => { });
  }

  function mollieUserIdSelect(event: any) {
    setMollieUserId('');
    let value = event.target.value;
    setMollieUserId(value);

  }

  function createNewPayment() {
    if (invoiceDetails) {

      let invoiceDate = invoiceDetails.invoiceDate;
      let invoiceNumber = invoiceDetails.invoiceNumber;
      let amount = (newPaymentAmount);
      let company_name = invoiceDetails.companyName;
      if (mollieUserId != "" && amount > 0) {



        const formData = new FormData();
        formData.append("amount", (newPaymentAmount).toString());
        formData.append("invoiceDate", invoiceDate);
        formData.append("invoiceNumber", invoiceNumber);
        formData.append("customerId", mollieUserId);
        formData.append("description",  "services "+company_name);
        formData.append("companyName", company_name);

        Swal.fire({
          showCloseButton: true,
          showCancelButton: true,
          icon: "info",
          html:
            "Voulez-vous vraiment effecter ce paiement <br> <br>  Montant transaction:  " + newPaymentAmount + " €<br> <br>  Bénéficiaire:  " + company_name + "<br> <br>  Numéro facture:  " + invoiceNumber + "<br><br>Total facture reste à payer: " + (totalInvoiceAmount - totalPaymentPrice).toFixed(2) + " € <br>",

          confirmButtonColor: "black",
          confirmButtonText: "Oui",
          cancelButtonText: "Non",
          cancelButtonColor: "#dd333d",
        }).then((result) => {
          if (result.isConfirmed) {
            axios
              .post(`${urlApi}/mollie_user_create_payment`, formData)
              .then((response) => {
                getAllPayments();
                Swal.fire({
                  position: "center",
                  icon: "success",
                  html: "Paiement à été bien ajouté ",
                  showConfirmButton: false,
                  timer: 2500,
                });


                setTimeout(function() {
                 window.location.reload();
                }, 2000); 
              })
              .catch((err) => {
                Swal.fire({
                  position: "center",
                  icon: "error",
                  html: "informations invalides",
                  showConfirmButton: false,
                  timer: 2500,
                });
              });
          }
        });


      }
    }
  }

  function getMandatByCustomerId() {
    const formData = new FormData();
    formData.append("customerId", mollieUserId);

    axios
      .post(`${urlApi}/getMandatByCustomerId`, formData)
      .then((response) => {
        console.log("length : ", response.data.mandates);
        if (Object.keys(response.data.mandates).length !== 0) {
          setMandateExists(true);
        } else {
          setMandateExists(false);
        }
      })
      .catch((err) => {
        console.log("err getMa, ", err);
      });
  }


  function addNewMandateForMollieUser(id: any) {
    let username = '';
    mollieUsersArray.forEach(element => {
      if (element['id'] == id) {
        username = element['name'];
      }
    });
    Swal.fire({
      // title: "Assosier un nouveau mandat pour le client :"+username,
      html:
        "Assosier un nouveau mandat pour le client <br>" + username
        + '<br><input type="text" id="input1" class="swal2-input" placeholder="IBAN">' +
        '<input type="text" id="input2" class="swal2-input" placeholder="BIC">',
      showCancelButton: true,
      confirmButtonText: "Ajouter",
      confirmButtonColor: "black",
      cancelButtonText: "Annuler",
      cancelButtonColor: "#dd333d",
      preConfirm: () => {
        const input1 =
          (Swal.getPopup()?.querySelector("#input1") as HTMLInputElement)
            ?.value || "";
        const input2 =
          (Swal.getPopup()?.querySelector("#input2") as HTMLInputElement)
            ?.value || "";
        console.log(input1, input2);
        return { input1, input2 };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value) {
          const { input1, input2 } = result.value;
          addNewMandate(id, input1, input2);


        }
      }
    });
  }


  function addNewMandate(id: any, iban: any, bic: any) {
    if (iban != "" && bic != "" && id != "") {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html:
          "Voulez-vous vraiment revoquer le mandat <br><br> IBAN:  " +
          iban +
          "<br><br> BIC:  " +
          bic,

        confirmButtonColor: "black",
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          const formData = new FormData();
          formData.append("customerId", id);
          formData.append("consumerAccount", iban);
          formData.append("consumerBic", bic);
          formData.append("method", "directdebit");


          axios
            .post(`${urlApi}/mollie_user_create_mandat`, formData)
            .then((response) => {
              console.log(response);
              getMandatByCustomerId();
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Mandat ajouté",
                showConfirmButton: false,
                timer: 2500,
              });
            })
            .catch((err) => {
              console.log(err);
              Swal.fire({
                position: "center",
                icon: "error",
                title: "Mandat invalid",
                showConfirmButton: false,
                timer: 2500,
              });
            });

          console.log("response");

        }
      });
    } else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Mandat incomplét",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  function createNewUser() {
    Swal.fire({
      title: "Créer un nouveau client",
      html:
        '<input type="text" id="input1" class="swal2-input" placeholder="Nom">' +
        '<input type="email" id="input2" class="swal2-input" placeholder="E-mail">',
      showCancelButton: true,
      confirmButtonText: "Ajouter",
      confirmButtonColor: "black",
      cancelButtonText: "Annuler",
      cancelButtonColor: "#dd333d",
      preConfirm: () => {
        const input1 =
          (Swal.getPopup()?.querySelector("#input1") as HTMLInputElement)
            ?.value || "";
        const input2 =
          (Swal.getPopup()?.querySelector("#input2") as HTMLInputElement)
            ?.value || "";
        console.log(input1, input2);
        return { input1, input2 };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value) {
          const { input1, input2 } = result.value;
          addNewMollieUser(input1, input2);


        }
      }
    });
  }


  function addNewMollieUser(name: any, email: any) {
    console.log(name != "" && email != "");
    if (name != "" && email != "") {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("locale", "fr_FR");

      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        text:
          "Voulez-vous vraiment ajouter ce nouveau client " + email,
        confirmButtonColor: "black",
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post(`${urlApi}/mollie_user_create`, formData)
            .then((response) => {
              if (response.data.status == "success") {
                getAllMollieUsers();

                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Client ajouté",
                  showConfirmButton: false,
                  timer: 2500,
                });
              } else if (response.data.status == "exists already") {
                Swal.fire({
                  position: "center",
                  icon: "error",
                  title: "Client existe déja",
                  showConfirmButton: false,
                  timer: 2500,
                });
              }
            })
            .catch((err) => {
              console.log("response");
              Swal.fire({
                position: "center",
                icon: "error",
                title: "informations invalides",
                showConfirmButton: false,
                timer: 2500,
              });
            });
        }
      });
    } else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "informations invalides",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }


  const [paymentsArray, setPaymentsArray] = useState<any[]>([]);

  useEffect(() => {
    // paymentsArray.reverse().forEach(element => {
      // console.log('hahahaha : ', element)
       if(totalInvoiceAmount-totalPaymentPrice==0 && invoiceDetails.length>0 ){
        Swal.fire({
          showCloseButton: true,
          icon: "info",
          html:
            "La facture à été payé <br/> Veuillez vérifier avec l'historique de paiement  <br/>  <br/> Status de paiement: " + invoiceDetails.paymentStatus ,
          confirmButtonColor: "black",
          confirmButtonText: "D'accord",
          showCancelButton: false,
        }).then((result) => {
          if (result.isConfirmed) {
            push('/');
          } else {
            push('/');
          }
  
        });
       }
      

      // else {
      //   console.log('element : ', element.metadata['invoice_reference']);
      //   Swal.fire({
      //     showCloseButton: true,
      //     showCancelButton: false,
      //     icon: "info",
      //     html:
      //       "Cette facture a déja un paiement en cours <br/>  <br/> Status de paiement: " + element.status + '',
      //     confirmButtonColor: "black",
      //     confirmButtonText: "D'accord",
      //   }).then((result) => {
      //     if (result.isConfirmed) {
      //       push('/');
      //     } else {
      //       push('/');

      //     }

      //   });
      // }
      // }
      // }
    // });
  }, [paymentsArray])

  async function getAllPayments() {
    const options = {
      method: 'GET',
      url: `${urlApi}/getAllPayments`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'withCredentials': 'true',
      },
    };
    await axios(options)
      .then((response) => {
        let paymentsArrayAux: any = [];

        response.data.payments.forEach((element: any, index: any) => {
          paymentsArrayAux.push(element);
        });

        setPaymentsArray(paymentsArrayAux);
      })
      .catch((err) => {
        console.log(err);
      });
  }



  return (
    <>
      <Navbar></Navbar>
      <h3 className="text-dark text-center my-2">
          Page de règlement de facture, effectuez votre paiement en toute
          simplicité
        </h3>
      <div className="mainBox">
       
        <div className="card-basic mt-4">
          <div className="card-header header-basic">
            <h1>SAPS - Paiement</h1>
          </div>
          <div className="card-body">
            <div className="card-element-hidden-basic">
              <ul className="card-element-container">
                <li className="select-card-element card-element text-center pb-2 ">
                  <select
                    onChange={(event) => {
                      mollieUserIdSelect(event);
                    }}
                    value={mollieUserId}
                    name=""
                    id=""
                    className="select-input"
                  >
                    <option value="">Veuillez choisir un client</option>
                    {mollieUsersArray.map((element, index) => {
                      return (
                        <option
                          key={`${index}-${element["id"]}`}
                          value={element["id"]}
                        >
                          {element["name"]}
                        </option>
                      );
                    })}
                  </select>
                  <FontAwesomeIcon
                    onClick={() => {
                      createNewUser();
                    }}
                    icon={faPlus}
                    className="mx-1 px-1 text-success addIcon"
                  />
                </li>
                <li className="card-element">
                  <strong>Entreprise: </strong> {invoiceDetails.companyName}{" "}
                </li>
                <li className="card-element">
                  {" "}
                  <strong>Client: </strong> {invoiceDetails.client}{" "}
                </li>
                <li className="card-element">
                  <small>Date de facturation: </small>{" "}
                  {((invoiceDetails.invoiceDate))}
                </li>
                <li className="card-element">
                  {" "}
                  <small>Numéro facture : </small>{" "}
                  {invoiceDetails.invoiceNumber}
                </li>
                <li className="card-element">
                  {" "}
                  <small> {invoiceDetails.invoicePeriode}</small>
                </li>
                <li className="card-element">
                  {" "}
                  <strong>Total facture: {invoiceDetails.total}</strong>
                </li>

                <li className="card-element">
                  {" "}
                  <strong>Reste à payer : {((totalInvoiceAmount - totalPaymentPrice)).toFixed(2) || 0} €</strong>
                </li>
                {invoiceDetails.totalPaid > 0 && <li className="card-element">

                  <strong>Montant déjà payé : {parseFloat(invoiceDetails.totalPaid).toFixed(2) || 0} €</strong>
                </li>}



                <li className="card-element">
                  {" "}
                  <small>Status de paiement: {invoiceDetails.paymentStatus == "" ? 'Non Payé' : invoiceDetails.paymentStatus}</small>
                </li>

              </ul>


              <div className="priceText px-5 mx-5">
                <small className="pb-3">Montant du paiement souhaité {newPaymentAmount} €</small>
                <div className="text-center d-flex justify-content-center align-items-center" style={{ position: 'relative' }}>
                  <span className="euro-symbolPaymentPage">€</span>

                  <input ref={priceInputRef}
                    onInput={handlePriceInput}
                    value={newPaymentAmount}
                    onChange={(e) => {
                      handleTotalPaymentPriceChange(e);
                    }}
                    id="priceInput"
                    type="number" name="" className="text-center form-control my-3 py-2 w-50 PaymentPageInput " placeholder="montant..." />
                </div>
              </div>

              {mandateExists && mollieUserId && (
                <button
                  onClick={() => {
                    createNewPayment();
                  }}
                  className="btn text-white btn-basic"
                >
                  Faites le paiement
                </button>
              )}

              {!mandateExists && mollieUserId && (
                <button
                  onClick={() => {
                    addNewMandateForMollieUser(mollieUserId,);
                  }}
                  className="btn errorBtn btn-danger bg-danger text-white btn-basic"
                >
                  Veuillez associer un mandat pour le client
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-dark mt-2 pt-1 text-center">
        {" "}
        <FontAwesomeIcon icon={faLock} className="mx-1 px-1 text-danger" />
        Sécurisez votre paiement en ligne
      </p>
    </>
  );
}
