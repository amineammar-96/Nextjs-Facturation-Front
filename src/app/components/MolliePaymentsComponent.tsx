"use client"
import React from "react";
import "../../styles/mollieUsersStyle.css";
import "../../app/globals.css";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faBuilding, faBuildingColumns, faFileEdit, faLock, faPenAlt, faTextSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useRef } from 'react';
import AuxNavbarComponent from "@/app/components/layoutComponents/NavbarComponent";
import Navbar from "../../app/components/layoutComponents/NavbarComponent";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useRouter } from "next/router";

import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import {
  faSearch,
  faEnvelope,
  faEdit,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";

export default function MolliePaymentsComponent() {
//   const router = useRouter();
  const urlApi = "https://api.facturation.editeur-dentaire.fr/api";

  const [mollieUsersArray, setMollieUsersArray] = useState<any[]>([]);
  const [mandatesArray, setMandatesArray] = useState([]);
  const [paymentsArray, setPaymentsArray] = useState<any[]>([]);
  const [filteredPaymentsArray, setFilteredPaymentsArray] = useState<any[]>([]);
  const [filteredMollieUsersArray, setFilteredMollieUsersArray] = useState<any[]>([]);

  const [windowStep, setWindowStep] = useState(1);

  const [customerMandatId, setCustomerMandatId] = useState("");

  const [mollieUserName, setMollieUserName] = useState("");
  const [mollieUserEmail, setMollieUserEmail] = useState("");

  const [customerPaymentId, setCustomerPaymentId] = useState("");

  const [mandatId, setMandatId] = useState("");
  const [userMandatBic, setUserMandatBic] = useState("");
  const [userMandatIban, setUserMandatIban] = useState("");

  const [descriptionPayment, setDescriptionPayment] = useState("");
  const [totalPaymentPrice, setTotalPaymentPrice] = useState("");

  const [mandatUserSelectedId, setMandatUserSelectedId] = useState("");


  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;


  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const limitUsers = 8;


  const [mandateExists, setMandateExists] = useState(false);


  const priceInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');

  const [userMandatIbanSelectedOne, setUserMandatIbanSelectedOne] = useState('');
  const [userMandatBicSelectedOne, setUserMandatBicSelectedOne] = useState('');

  const [mollieUserSearchInput, setMollieUserSearchInput] = useState('');



  useEffect(() => {
    if (mandateExists) {
      const visibleStartDigits = userMandatIban.substring(0, 8);
      const visibleEndDigits = userMandatIban.substring(userMandatIban.length - 4);
      const hashedDigits = userMandatIban.substring(8, userMandatIban.length - 4).replace(/\d/g, '#');
      const maskedIban = visibleStartDigits + hashedDigits + visibleEndDigits;

      setUserMandatIban(maskedIban);
    }
  }, [mandateExists, userMandatIban]);

  useEffect(() => {
    getAllMollieUsers();
    // getAllMandats();
    getAllPayments();
  }, [sortOption]);

  useEffect(() => {
    renderTablePayments();
    console.log("paymexxxxxxxxxxxxxntsArray : ", paymentsArray);
  }, [paymentsArray]);

  useEffect(() => { }, [customerPaymentId]);

  useEffect(() => {
    setUserMandatBicSelectedOne("");
    setUserMandatIbanSelectedOne("");
    if (mandatUserSelectedId != "") {

      const formData = new FormData();
      formData.append("customerId", mandatUserSelectedId);


      axios
        .post(`${urlApi}/getMandatByCustomerId`, formData)
        .then((response) => {
          console.log("length : ", response.data.mandates);
          if (Object.keys(response.data.mandates).length !== 0) {
            setUserMandatBicSelectedOne(response.data.mandates[0].details.consumerBic);
            setUserMandatIbanSelectedOne(response.data.mandates[0].details.consumerAccount);
            let chAux = response.data.mandates[0].details.consumerAccount;



            const visibleStartDigits = chAux.substring(0, 8);
            const visibleEndDigits = chAux.substring(chAux.length - 4);
            const hashedDigits = chAux.substring(8, chAux.length - 4).replace(/\d/g, '#');
            const maskedIban = visibleStartDigits + hashedDigits + visibleEndDigits;

            setUserMandatIbanSelectedOne(maskedIban);


          } else {
            setUserMandatBicSelectedOne("");
            setUserMandatIbanSelectedOne("");

          }
        })
        .catch((err) => {
          console.log("err getMa, ", err);
        });
    }
  }, [mandatUserSelectedId]);

  useEffect(() => {
    if (customerMandatId != "") {
      getMandatByCustomerId();
    }
  }, [customerMandatId]);

  useEffect(() => {
    renderTableUsers();
  }, [mollieUsersArray, filteredMollieUsersArray]);

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

  function paymentDescriptionHandle(e: any) {
    let value = e.target.value;
    setDescriptionPayment(value);
  }

  function handleIbanChange(e: any) {
    let value = e.target.value;
    setUserMandatIban(value);
  }

  function handleBicChange(e: any) {
    let value = e.target.value;
    setUserMandatBic(value);
  }

  function handleNameChange(e: any) {
    let value = e.target.value;
    setMollieUserName(value);
  }

  function handleEmailChange(e: any) {
    let value = e.target.value;
    setMollieUserEmail(value);
  }

  function handleWindowStepChange(step: any) {
    let value = step;
    setWindowStep(value);
  }

  function handleTotalPaymentPriceChange(e: any) {
    let value = e.target.value;
    setTotalPaymentPrice(value);
  }

  function addNewMollieUser(e: any) {
    e.preventDefault();
    console.log("mollieUserEmail", mollieUserEmail);
    if (mollieUserEmail != "" && mollieUserName != "") {
      const formData = new FormData();
      formData.append("name", mollieUserName);
      formData.append("email", mollieUserEmail);
      formData.append("locale", "fr_FR");

      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        text:
          "Voulez-vous vraiment ajouter ce nouveau client " + mollieUserEmail,
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
                  html: "<strong>Client existe déja</strong>",
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
                html: "informations invalides",
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
        html: "informations invalides",
        showConfirmButton: false,
        timer: 2500,
      });
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



  useEffect(() => {
    const filteredData = mollieUsersArray.filter((user) =>
      (user.name ?? '').toLowerCase().includes((mollieUserSearchInput || '').toLowerCase()) ||
      (user.email ?? '').toLowerCase().includes((mollieUserSearchInput || '').toLowerCase())
    );


    console.log('mollieUserSearchInput : ', mollieUserSearchInput);
    console.log('filteredData : ', filteredData);

    setFilteredMollieUsersArray(filteredData);
  }, [mollieUserSearchInput, mollieUsersArray]);
  const renderTableUsers = () => {

    const indexOfLastItem = currentPageUsers * limitUsers;
    const indexOfFirstItem = indexOfLastItem - limitUsers;
    const currentItems = filteredMollieUsersArray.slice(indexOfFirstItem, indexOfLastItem);

    let rowTrs: any[] = [];
    const pageNumbers = Math.ceil(filteredMollieUsersArray.length / limitUsers);
    const pageArray = Array.from({ length: pageNumbers }, (_, index) => index + 1);

    currentItems.forEach((element, index) => {
      rowTrs.push(
        <tr key={`${index} - ${element["id"]}`}>
          <td>{element["id"]}</td>
          <td>{element["name"]}</td>
          <td>{element["email"]}</td>
          <td>France</td>
          <td className="tableActionCol">
            <span>
              <FontAwesomeIcon
                onClick={() => {
                  deleteMollieUser(element["id"]);
                }}
                className="faDelete"
                icon={faTrash}
              />
            </span>
            <span>
              <FontAwesomeIcon
                onClick={() => {
                  updateMollieUser(element["id"], element["name"], element["email"])
                }}
                className="faEdit"
                icon={faEdit}
              />
            </span>
          </td>
        </tr>
      );
    });


    return (
      <>

       

        <div className="d-flex justify-content-start align-items-center">


          <div className="search-container mb-4">
            <input
              type="text"
              placeholder="Chercher..."
              className="search-input"
              value={mollieUserSearchInput}
              onChange={handleMollieUserSearchInputChange}
            />
          </div>
        </div>
        {currentItems.length > 0 && <>
          <table className="transaction-history">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Client</th>
                <th>E-mail</th>
                <th>Pays</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            <tbody>{rowTrs}</tbody>
          </table>

          

          <div className="d-flex footerTables justify-content-between align-items-center">
            <div>
              <p>{pageArray.length} page(s)</p>

            </div>
            <div>
              <small>Pour voir plus veuillez visiter <a href="">Mollie</a></small>
            </div>

            <div className="paginationsTable">



              {currentPageUsers > 1 && <button onClick={() => paginate(currentPageUsers - 1, 'users')}>
              <FontAwesomeIcon
              
                className="faArrowLeft"
                icon={faArrowLeft}
              />
              </button>}

              <button className="currentPageBtn" onClick={() => paginate(currentPageUsers, 'users')}>
                {currentPageUsers}
              </button>

              {currentPageUsers < pageArray.length && <button onClick={() => paginate(currentPageUsers + 1, 'users')}>
              <FontAwesomeIcon
              
              className="faArrowRight"
              icon={faArrowRight}
            />
              </button>}


            </div>
          </div>
        </>}



        {currentItems.length == 0 && <>
          <div className="text-center py-5 my-5 mx-auto ">
            <h3>Aucun utilisateur </h3>
          </div>
        </>

        }

      </>
    );
  };



  async function deleteMollieUser(id: any) {

    if (id != "") {
      const formData = new FormData();
      formData.append("customerId", id);
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        text:
          "Voulez-vous vraiment supprimer le client ",
        confirmButtonColor: "black",
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post(`${urlApi}/mollie_user_delete`, formData)
            .then((response) => {
              if (response.data.status == "deleted") {
                getAllMollieUsers();
                Swal.fire({
                  position: "center",
                  icon: "success",
                  html: "Client supprimé avec succés",
                  showConfirmButton: false,
                  timer: 2500,
                });
              } else {
                Swal.fire({
                  position: "center",
                  icon: "error",
                  title: "impossible de supprimer ce client",
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
                showConfirmButton: false,
                timer: 2500,
              });
            });
        }
      });
    }

  }

  function updateMollieUser(id: any, name: any, email: any) {
    if (name == null) {
      name = '';
    }
    if (email == null) {
      email = '';
    }
    Swal.fire({
      title: "Modifier " + name,
      html:
        '<input type="text" id="usermollieinput1" value="' + name + '" class="swal2-input" placeholder="Nom">' +
        '<input type="email" id="usermollieinput2" value="' + email + '" class="swal2-input" placeholder="E-mail">',
      showCancelButton: true,
      confirmButtonText: "Mettre à jour",
      confirmButtonColor: "black",
      cancelButtonText: "Annuler",
      cancelButtonColor: "#dd333d",
      preConfirm: () => {
        const input1 =
          (Swal.getPopup()?.querySelector("#usermollieinput1") as HTMLInputElement)
            ?.value || "";
        const input2 =
          (Swal.getPopup()?.querySelector("#usermollieinput2") as HTMLInputElement)
            ?.value || "";
        console.log(input1, input2);
        return { input1, input2 };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value) {
          const { input1, input2 } = result.value;

          if (input1 != "" && input2 != "") {
            const formData = new FormData();
            formData.append('customerId', id);
            formData.append('email', input2);
            formData.append('name', input1);


            formData.append('locale', "fr_FR");

            axios
              .post(`${urlApi}/mollie_user_update`, formData)
              .then((response) => {
                if (response.data.status == "updated") {
                  getAllMollieUsers();
                  Swal.fire({
                    position: "center",
                    icon: "success",
                    html: "Client à été bien modifié",
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
                  html: "Données invalides",
                  showConfirmButton: false,
                  timer: 2500,
                });
              });

          } else {
            Swal.fire({
              position: "center",
              icon: "error",
              html: "utilisateur incomplét",
              showConfirmButton: false,
              timer: 2500,
            });
          }



        }
      }
    });
  }

  function getMandatByCustomerId() {
    const formData = new FormData();
    formData.append("customerId", customerMandatId);

    axios
      .post(`${urlApi}/getMandatByCustomerId`, formData)
      .then((response) => {
        console.log("length : ", response.data.mandates);
        if (Object.keys(response.data.mandates).length !== 0) {
          setUserMandatBic(response.data.mandates[0].details.consumerBic);
          setUserMandatIban(response.data.mandates[0].details.consumerAccount);
          setMandatId(response.data.mandates[0].details.id);
          setMandateExists(true);
        } else {
          setUserMandatBic("");
          setUserMandatIban("");
          setMandateExists(false);

        }
      })
      .catch((err) => {
        console.log("err getMa, ", err);
      });
  }

  function paymentCustomerSelect(event: any) {
    setCustomerPaymentId('');
    let value = event.target.value;
    setCustomerPaymentId(value);
  }

  function mandatCustomerSelect(event: any) {
    setCustomerMandatId('');
    let value = event.target.value;
    setCustomerMandatId(value);
  }

  function addNewPayment(event: any) {
    event.preventDefault();


    if (customerPaymentId != "" && descriptionPayment != "" && totalPaymentPrice != "") {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html:
          "Voulez-vous vraiment effectuer le paiement <br><br> Montant total:  " +
          totalPaymentPrice +
          " €" + "<br><br> Motif :  " +
          descriptionPayment,
        confirmButtonColor: "black",
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          const formData = new FormData();
          formData.append("amount", totalPaymentPrice);
          formData.append("description", descriptionPayment);
          formData.append("customerId", customerPaymentId);

          axios
            .post(`${urlApi}/mollie_user_create_payment`, formData)
            .then((response) => {
              console.log(response);
              setDescriptionPayment('');
              setTotalPaymentPrice('');
              setCustomerPaymentId('');
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Paiement ajouté",
                showConfirmButton: false,
                timer: 2500,
              });
              getAllPayments();
            })
            .catch((err) => {
              console.log(err);
            });


        }
      });
    } else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Paiement invalid",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  function revokeMandat(event: any) {
    event.preventDefault();
    console.log("customerMandatId", customerMandatId);
    console.log("IBAN", userMandatIban);
    console.log("userMandatBic    ", userMandatBic);
    console.log(
      'customerPaymentId != "" && userMandatIban != "" && userMandatBic != ""    ',
      customerMandatId != "" && userMandatIban != "" && userMandatBic != ""
    );

    console.log(
      '1 ', customerPaymentId != ""
    );

    console.log(
      '2 ', userMandatIban != ""
    );
    console.log(
      '3 ', userMandatBic != ""
    );

    // console.log(
    //   'customerPaymentId != "" && userMandatIban != "" && userMandatBic != ""    ',
    //   customerPaymentId != "" && userMandatIban != "" && userMandatBic != ""
    // );

    if (customerMandatId != "" && userMandatIban != "" && userMandatBic != "") {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html:
          "Voulez-vous vraiment revoquer le mandat <br><br> IBAN:  " +
          userMandatIban +
          "<br><br> BIC:  " +
          userMandatBic,

        confirmButtonColor: "black",
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          const formData = new FormData();
          formData.append("customerId", customerMandatId);
          formData.append("consumerAccount", userMandatIban);
          formData.append("consumerBic", userMandatBic);

          formData.append("method", "directdebit");

          axios
            .post(`${urlApi}/mollie_user_create_mandat`, formData)
            .then((response) => {
              console.log(response);
              getMandatByCustomerId();
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Mandat à jour",
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

  async function getAllMandats() {
    console.log("mandatesArrayAuxmandatesArrayAux: ", mandatesArray);
    setUserMandatBic('');
    setUserMandatIban('');
    await axios
      .get(`${urlApi}/getAllMandates`)
      .then((response) => {
        let mandatesArrayAux: any = [];

        console.log("getAllMandates : ", response);
        response.data.mandates.forEach((element: any, index: any) => {
          mandatesArrayAux.push(element);
        });

        setMandatesArray(mandatesArrayAux);
        console.log("array: ", mandatesArrayAux);
      })
      .catch((err) => {
        console.log(err);
      });

    console.log("mandatesArraymandatesArraymandatesArray: ", mandatesArray);
  }

  const renderTableMandats = () => {
    let rowTrs: any[] = [];

    let auxVal = mandatUserSelectedId;

    
    return <>  <div className="row card chase">


      <div className="py-4 col-sm-12">

        <div className="info knownBank col-sm-12 pt-5">
          <div className="logo">
            <FontAwesomeIcon
              onClick={() => { }}
              className="faBuildingColumns"
              icon={faBuildingColumns}
            />
          </div>
        </div>
      </div>

      <div className=" row d-flex justify-content-between ">

        <div className="info col-6 mr-4 ">
          <p className="title">Client Mollie (ID)</p>
          <p>
            {auxVal}
          </p>
        </div>



      </div>
      <div className=" row d-flex justify-content-between">

        <div className="info col-6 mr-4 ">
          <p className="title">Compte bancaire (IBAN)</p>
          <p>
            {userMandatIbanSelectedOne}
          </p>
        </div>
        <div className="info col-6 ">
          <p className="title">BIC</p>
          <p>{userMandatBicSelectedOne}</p>
        </div>


      </div>

      <div className="pt-4 row d-flex justify-content-end">

        <div className="info col-12 mr-4 ">
          <div className="logoAux">


            <div className="bankAccountDivBtn mb-2">
              <button>RIB
             
              </button>
            </div>
          </div>
        </div>



      </div>

    </div>
    </>;
  };

  async function getAllPayments() {

    const options = {
      method: 'GET',
      url: `${urlApi}/getAllPayments?page=${currentPage}&limit=${limit}`,
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
        let paymentsArray: any = [];

        response.data.payments.forEach((element: any, index: any) => {
          paymentsArray.push(element);
        });

        setPaymentsArray(paymentsArray);
      })
      .catch((err) => {
        console.log(err);
      });
  }


  const handleMollieUserSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMollieUserSearchInput(event.target.value);
  };
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  useEffect(() => {

    const filteredAndSortedData = paymentsArray.filter((payment) =>
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOption === 'amountAsc') {
      filteredAndSortedData.sort((a, b) => a.amount.value - b.amount.value);
    } else if (sortOption === 'amountDesc') {
      filteredAndSortedData.sort((a, b) => b.amount.value - a.amount.value);
    }

    setFilteredPaymentsArray(filteredAndSortedData);
  }, [searchTerm, sortOption, paymentsArray]);


  const paginate = (pageNumber: number, ch: string) => {
    if (ch == 'users') {
      setCurrentPageUsers(pageNumber);

    } else {
      setCurrentPage(pageNumber);

    }

  };
  const renderTablePayments = () => {
    const indexOfLastItem = currentPage * limit;
    const indexOfFirstItem = indexOfLastItem - limit;
    const currentItems = filteredPaymentsArray.slice(indexOfFirstItem, indexOfLastItem);

    let rowTrs: any[] = [];
    const pageNumbers = Math.ceil(filteredPaymentsArray.length / limit);
    const pageArray = Array.from({ length: pageNumbers }, (_, index) => index + 1);

    currentItems.forEach((element, index) => {
      rowTrs.push(
        <tr className="molliePayemntsTd" key={`${index} - ${element["id"]}`}>
          <td>{element["id"]}</td>
          <td>{element["customerId"]}</td>
          <td>{element["amount"]["value"]} €</td>
          <td>{element["description"]}</td>
          <td><span className={element["status"] == "expired" ? 'status error' : element["status"] == "open" ? 'status warning' : element["status"] == "paid" ? 'status success' : element["status"] == "pending" ? 'status pending' : ''}>{element["status"]}</span></td>
        </tr>
      );
    });



    return (
      <>

       

        <div className="d-flex justify-content-between align-items-center">
          <div className="select-container">
            <select className="select-input" value={sortOption} onChange={handleSortOptionChange}>
              <option value="">Trier par</option>
              <option value="amountAsc">Montant total - Ascendant</option>
              <option value="amountDesc">Montant total - Descendant</option>
            </select>
          </div>

          <div className="search-container mb-4">
            <input
              type="text"
              placeholder="Chercher..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </div>
        </div>
        {currentItems.length > 0 && <>
          <table className="transaction-history">
            <thead>
              <tr>
                <th>Paiement ID</th>
                <th>User ID</th>
                <th>Montant</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{rowTrs}</tbody>
          </table>

          <div className="d-flex footerTables justify-content-between align-items-center">
            <div>
              <p>{pageArray.length} page(s)</p>
            </div>

            <div>
              <small>Pour voir plus veuillez visiter <a href="">Mollie</a></small>
            </div>
            <div className="paginationsTable">



              {currentPage > 1 && <button onClick={() => paginate(currentPage - 1, 'payment')}>
              <FontAwesomeIcon
              
              className="faArrowLeft"
              icon={faArrowLeft}
            />
              </button>}

              <button className="currentPageBtn" onClick={() => paginate(currentPage, 'payment')}>
                {currentPage}
              </button>

              {currentPage < pageArray.length && <button onClick={() => paginate(currentPage + 1, 'payment')}>
              <FontAwesomeIcon
              
              className="faArrowRight"
              icon={faArrowRight}
            />
              </button>}


            </div>
          </div>
        </>}



        {currentItems.length == 0 && <>
          <div className="text-center py-5 my-5 mx-auto ">
            <h3>Aucun paiement </h3>
          </div>
        </>

        }

      </>
    );
  };




  function mandatUserSelect(event: any) {
    setMandatUserSelectedId('');
    let value = event.target.value;
    setMandatUserSelectedId(value);
  }
  const handlePriceInput = () => {
    const price = parseFloat(priceInputRef.current?.value || '');
    if (!isNaN(price) && priceInputRef.current) {
      priceInputRef.current.value = price.toFixed(2);
    }

    if (priceInputRef.current
      &&
      price < 0
      ) {
        priceInputRef.current.value = "0.00";
      }

      
  };

  return (
    <div className="molliePageBody ">
      

      <div className="tabsDiv">
        <nav>
          <ul>
            <li onClick={() => handleWindowStepChange(1)}
            >
              <a href="#" className={windowStep == 1 ? "active" : ""}>                  <em>Gestionnaire de donneés</em>
              </a>
            </li>
            <li onClick={() => handleWindowStepChange(2)}
              className="list-item--active"
            >
              <a href="#"               className={windowStep == 2 ? "active" : ""}><em>Liste d'utilisateurs</em></a>
            </li>
            <li onClick={() => handleWindowStepChange(3)}
            >
              <a href="#" className={windowStep == 3 ? "active" : ""}>                  <em>Liste de mandats</em>
              </a>
            </li>
            <li onClick={() => handleWindowStepChange(4)}
            >
              <a href="#"  className={windowStep == 4 ? "active" : ""}>                  <em>Liste de paiements</em>
              </a>
            </li>

          </ul>
        </nav>
      </div>
      <div className="s-layout pt-5 pb-5 mb-5">


        <div className="s-layout__content">
          {windowStep == 1 && (
            <div className="stepOne ">
              <div className="mainBox ">
                <div className="createMollieUserFormBox  ">
                  <div className="row m-0 p-0 ">
                    
                    <div className="col-md-6  d-flex justify-content-center">
                      <form
                        onSubmit={(event) => {
                          revokeMandat(event);
                        }}
                      >
                        <h1 className="pt-1">Mettre à jour un mandat</h1>

                        <fieldset>
                          <label htmlFor="name">Utilisateur</label>
                          <select
                            onChange={(event) => {
                              mandatCustomerSelect(event);
                            }}
                            value={customerMandatId}
                            name=""
                            id=""
                          >
                            <option value="">Veuillez choisir un client</option>
                            {mollieUsersArray.map((element, index) => {
                              return (
                                <option
                                  key={`${index}-${element["id"]}`}
                                  value={element["id"]}
                                >
                                  {element["name"]} -  {element["email"]}
                                </option>
                              );
                            })}
                          </select>
                          <label htmlFor="iban">IBAN</label>
                          <input
                            onChange={(e) => {
                              handleIbanChange(e);
                            }}
                            value={userMandatIban}
                            type="text"
                            id="iban"
                            name="iban"
                            disabled={mandateExists}

                          />

                          <label htmlFor="bic">BIC</label>
                          <input
                            onChange={(e) => {
                              handleBicChange(e);
                            }}
                            value={userMandatBic}
                            type="text"
                            id="bic"
                            name="bic"
                            disabled={mandateExists}
                          />
                        </fieldset>

                        <div className="text-center">
                          <button type="submit">Révoquer</button>
                        </div>
                      </form>
                    </div>

                    <div className="col-md-6 d-flex justify-content-center">
                      <form
                        onSubmit={(event) => {
                          addNewPayment(event);
                        }}
                      >
                        {" "}
                        <h1 className="pt-1">Créer un paiement</h1>
                        <fieldset>
                          <label htmlFor="name">Utilisateur</label>
                          <select
                            onChange={(event) => {
                              paymentCustomerSelect(event);
                            }}
                            value={customerPaymentId}
                            name=""
                            id=""
                          >
                            <option value="">Veuillez choisir un client</option>
                            {mollieUsersArray.map((element, index) => {
                              return (
                                <option
                                  key={`${index}-${element["id"]}`}
                                  value={element["id"]}
                                >
                                  {element["name"]} -  {element["email"]}
                                </option>
                              );
                            })}
                          </select>
                          <label htmlFor="priceInput">Montant en Euros (€)</label>
                          <div style={{ position: 'relative' }}>

                            <span className="euro-symbol">€</span>
                            <input
                              type="number"
                              id="priceInput"
                              onChange={(e) => {
                                handleTotalPaymentPriceChange(e);
                              }}
                              value={totalPaymentPrice}
                              name="priceInput"
                              ref={priceInputRef}
                              onInput={handlePriceInput}

                            />

                          </div>


                          <label htmlFor="description">Description</label>
                          <input
                            type="text"
                            id="description"
                            value={descriptionPayment}
                            onChange={(event) => {
                              paymentDescriptionHandle(event);
                            }}
                            name="description"
                          />
                        </fieldset>
                        <div className="text-center">
                          <button type="submit" className="">
                            Ajouter
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="col-md-6 mx-auto mb-4 pt-5 justify-content-center">
                      <form style={{ width:"100%" }} onSubmit={(e) => addNewMollieUser(e)}>
                        <h1 className="pt-1">
                          Créer un nouveau utilisateur Mollie
                        </h1>

                        <fieldset>
                          <label htmlFor="name">
                            Nom d'utilisateur ou de l'entreprise
                          </label>
                          <input
                            onChange={(e) => {
                              handleNameChange(e);
                            }}
                            type="text"
                            id="name"
                            value={mollieUserName}
                            name="user_name"
                          />

                          <label htmlFor="email">Adresse e-mail</label>
                          <input
                            onChange={(e) => {
                              handleEmailChange(e);
                            }}
                            type="email"
                            value={mollieUserEmail}
                            id="email"
                            name="user_email"
                          />
                        </fieldset>
                        <div className="text-center">
                          <button type="submit">Ajouter</button>
                        </div>
                      </form>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {windowStep == 2 && (
            <div className="stepTwo">
              <div className="table-wrapper">

                {renderTableUsers()}

              </div>
            </div>
          )}

          {windowStep === 3 && (
            <div className="stepTwo mx-auto">
              <div className="text-center py-5">
                <select
                  onChange={(event) => {
                    mandatUserSelect(event);
                  }}
                  value={mandatUserSelectedId}
                  name=""
                  id=""

                  className="mandatUserSelectedId select-input"
                >
                  <option value="">Veuillez choisir un client</option>
                  {mollieUsersArray.map((element, index) => (
                    <option
                      key={`${index}-${element["id"]}`}
                      value={element["id"]}
                    >
                      {element["name"]} -  {element["email"]}
                    </option>
                  ))}
                </select>
              </div>
              {userMandatIbanSelectedOne && userMandatBicSelectedOne && mandatUserSelectedId && (
              
              

                <div className="mandateCardDiv pt-5">
                  {renderTableMandats()}
                </div>
              )}
              {!userMandatIbanSelectedOne && !userMandatBicSelectedOne && mandatUserSelectedId && (
                <div className="text-center my-5 py-5">
                  <h3>Aucun mandat associé</h3>

                </div>
              )}
            </div>
          )}

          {windowStep == 4 && (
            <div className="stepTwo">
              <div className="table-wrapper">

                {renderTablePayments()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
