"use client";

import "../../styles/InvoicesListStyle.css";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faArrowLeft, faArrowRight, faCashRegister, faDesktopAlt, faDownload, faEuroSign, faFileExport, faFileInvoice, faMinus, faMoneyBill, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Radio, Divider, Select } from 'antd';

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import InvoicesListSpinner from "./layoutComponents/Loaders/InvoicesListSpinner";
import { RangePickerProps } from 'rc-picker/lib/RangePicker';

import {
  faSearch,
  faEnvelope,
  faEdit,
  faWallet,
  faPencil
} from "@fortawesome/free-solid-svg-icons";

import { fr } from "date-fns/locale";

import { Button, Modal } from 'antd';


import { DatePicker, Space, ConfigProvider } from 'antd';

import 'dayjs/locale/fr';

import locale from 'antd/locale/fr_FR';

import dayjs, { Dayjs } from "dayjs";


import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';


import InvoiceDetailsModal from "./InvoiceDetailsModal";



export default function InvoicesList() {
  const [invoices, setInvoices] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchValue, setSearchValue] = useState("");
  const [filteredArray, setFilteredArray] = useState<any[]>([]);

  const [invoicesUniqueRef, setInvoicesUniqueRef] = useState<string[]>([]);
  const [invoiceRefOption, setInvoiceRefOption] = useState("");

  const [allInvoicesCount, setAllInvoicesCount] = useState(0);

  const [paginationKey, setPaginationKey] = useState(0);
  const [emailUpdateKey, setEmailUpdateKey] = useState(0);
  const [sortTableOption, setSortTableOption] = useState("invoice_dateAsc");

  const [searchValueRefFactureValue, setSearchValueRefFactureValue] = useState("");


  const [totalInvoicesCount, setTotalInvoicesCount] = useState(0);


  const [filterInvoicesOption, setFilterInvoicesOption] = useState("");



  const [open, setOpen] = useState(false);

  const openModal = () => {
    setOpen(true);
  };


  const urlApi = "https://api.confident-darwin.212-227-197-242.plesk.page/api";
  const { push } = useRouter();

  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const formattedStartDate = `${String(threeMonthsAgo.getDate()).padStart(2, '0')}/${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}/${threeMonthsAgo.getFullYear()}`;
  const formattedEndDate = `${String(lastDayOfMonth.getDate()).padStart(2, '0')}/${String(lastDayOfMonth.getMonth() + 1).padStart(2, '0')}/${lastDayOfMonth.getFullYear()}`;

  const [endDate, setEndDate] = useState(formattedEndDate);
  const [startDate, setStartDate] = useState(formattedStartDate);
  const { RangePicker } = DatePicker;



  const [invoiceListCount, setInvoiceListCount] = useState(25);

  type RangeValue<T> = [T, T] | null;

  const handleRangePickerChange: RangePickerProps<Dayjs>['onChange'] = (values, formatString) => {
    if (values !== null) {
      let startAux = formatString[0];
      let endAux = formatString[1];
      const [day, month, year] = startAux.split('/');
      startAux = `${day}/${month}/${year}`;

      const [dayAux, monthAux, yearAux] = endAux.split('/');
      endAux = `${dayAux}/${monthAux}/${yearAux}`;

      console.log((startAux));
      console.log((endAux));

      setStartDate(startAux);
      setEndDate(endAux);
      setSelectedInvoices([]);
    }
  };


  useEffect(() => {
    getAllInvoices(currentPage);
    console.log('filterInvoicesOptionfilterInvoicesOptionfilterInvoicesOption', filterInvoicesOption);
  }, [currentPage, invoiceListCount, sortTableOption, emailUpdateKey, startDate, endDate, open, filterInvoicesOption]);


  useEffect(() => {
    if (filteredArray.length > 0) {
      setLoading(false);
      checkPaymentsByOneInvoiceNumber();
    }

    console.log('filteredArrayfilteredArrayfilteredArrayfilteredArray', filteredArray);


    setPaginationKey((paginationKey) => paginationKey + 1);
  }, [filteredArray]);


  async function checkPaymentsByOneInvoiceNumber() {
    let invoicesNumber: any[] = [];
    filteredArray.forEach(element => {
      invoicesNumber.push(element.invoiceNumber);
    });

    const response = await axios.post(`${urlApi}/checkPaymentsInvoicesNumber`, {
      invoicesNumber: invoicesNumber,
    })


  }


  const getAllInvoices = async (page: any) => {
    let formData = new FormData();
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('ref', invoiceRefOption);
    formData.append('search', searchValue);
    formData.append('sortOption', sortTableOption);
    formData.append('invoiceSearch', searchValueRefFactureValue);
    formData.append('page', page + 1);
    formData.append('filterInvoicesOption', filterInvoicesOption);
    formData.append('invoiceListCount', String(invoiceListCount));







    try {
      const response = await axios.post(`${urlApi}/invoices`, formData, {
        withCredentials: true,
      });

      let invoicesArray: any[] = [];
      response.data.invoices.forEach((element: any) => {
        invoicesArray.push(element);
        console.log('hahaha ; ', element);

      });
      let invoicesUniqueRefArray: string[] = [];

      response.data.invoicesUniqueRefArray.forEach(
        (element: { related_invoice_ref: string }) => {
          invoicesUniqueRefArray.push(element.related_invoice_ref);
          console.log(
            "response.data.uniqueColumnsIvoiceRef response.data.uniqueColumnsIvoiceRef:",
            invoicesUniqueRefArray
          );
        }
      );

      setAllInvoicesCount(response.data.allInvoicesCount);

      setInvoicesUniqueRef(invoicesUniqueRefArray);
      setTotalPagesCount(response.data.totalPages);

      setTotalInvoicesCount(response.data.filteredResultsCount)
      console.log(
        "setTotalPagesCount setTotalPagesCountsetTotalPagesCount  : ",
        totalPagesCount
      );

      setInvoices(invoicesArray);
      setFilteredArray(invoicesArray);
      // console.log("setInvoicesUniqueRef invoicesUniqueRef  : ", invoicesUniqueRef);
    } catch (error) {
      console.log("getAllInvoices errors  : ", error);
    }
  };

  function downloadInvoice(id: any, company: any, date: any, invoiceNumber: any, period: any) {
    axios
      .get(urlApi + "/download_invoice/" + id, {
        responseType: "blob",
      })
      .then((response) => {

        // const invoiceDate = new Date(date);
        // const firstDayOfMonth = new Date(
        //   invoiceDate.getFullYear(),
        //   invoiceDate.getMonth(),
        //   1
        // );
        // const lastDayOfMonth = new Date(
        //   invoiceDate.getFullYear(),
        //   invoiceDate.getMonth() + 1,
        //   0
        // );

        // const firstDay = firstDayOfMonth
        //   .toLocaleDateString("en", {
        //     day: "2-digit",
        //     month: "2-digit",
        //     year: "2-digit",
        //   })
        //   .replace(/\//g, ".");

        // const lastDay = lastDayOfMonth
        //   .toLocaleDateString("en", {
        //     day: "2-digit",
        //     month: "2-digit",
        //     year: "2-digit",
        //   })
        //   .replace(/\//g, ".");

        let periodAux = period.replace('Période : ', '');
        periodAux = periodAux.replace(' ', '-');

        let fileNameText = `${periodAux}-${company}-${invoiceNumber}`;

        fileNameText = fileNameText.replace(' ', '-');



        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileNameText + ".pdf");
        link.style.display = "none"; // Hide the link element
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        Swal.fire({
          position: "center",
          icon: "success",
          html: "<strong>Facture téléchargée</strong>",
          showConfirmButton: false,
          timer: 2500,
        });
      })
      .catch((err) => {
        console.log("error : ", err);
      });
  }



  const renderTableContent = () => {
    let content: any[] = [];
    if (filteredArray.length > 0) {
      filteredArray.forEach((element, index) => {
        content.push(
          <React.Fragment key={`${element.id}-${index}`}>
            <tr key={`${element.id}-${index}`}>
              <td className="checkboxesTds">
                <input
                  type="checkbox"
                  className="checkboxInputs"
                  onChange={(e) => handleCheckboxChange(e, element.id)}
                  checked={selectedInvoices.includes(element.id)}

                />
              </td>
              <td>
                <span>{element.id}</span>
              </td>
              <td>
                <span>{element.companyName}</span> <br />
                <span>{element.email}</span>

              </td>
              <td>
                <span>
                  {element.client}
                </span>
              </td>
              <td>
                <span>{element.total} €</span>
                {/* <span><em>{ (parseFloat(element.total.replace(" ", "").replace(/\s/g, ''))).toFixed(2)} €</em></span> */}
              </td>

              <td>
                <span>{(element.invoiceDate)}</span>
              </td>
              <td>
                <span>{element.invoiceNumber}</span>
              </td>
              <td>
                <span>{element.invoicePeriode}</span>
              </td>

              <td className="actionCol">
                <p className="faEnvelopeSpan">

                  <FontAwesomeIcon
                    onClick={() => {
                      sendInvoiceMail(element.email, element.id);
                    }}
                    className="faEnvelope"
                    icon={faEnvelope}
                  />
                  <span className="hover-text">Envoyer par mail</span>
                </p>
                <p className="faPaymentSpan">
                  <FontAwesomeIcon
                    onClick={() => {
                      invoicePayment(element.id);
                    }}
                    className="faPayment"
                    icon={faWallet}
                  />
                  <span className="hover-text">Paiement Mollie</span>

                </p>


                <p className="faEditSpan">
                  <FontAwesomeIcon
                    onClick={() => {
                      updateEmailAddress(element.id, element.email);
                    }}
                    className="faEdit"
                    icon={faPen}
                  />
                  <span className="hover-text">Modifier l'adresse e-mail</span>

                </p>

                <p className="faDownloadSpan">
                  <FontAwesomeIcon
                    className="faDownload"
                    icon={faDownload}
                    onClick={() => {
                      downloadInvoice(element.id, element.companyName, element.invoiceDate, element.invoiceNumber, element.invoicePeriode);
                    }}
                  />
                  <span className="hover-text">Télécharger la facture  </span>

                </p>
                <p className="faDeleteSpan">
                  <FontAwesomeIcon
                    onClick={() => {
                      deleteInvoiceFromDB(element.id, element.invoiceNumber);
                    }}
                    className="faDelete"
                    icon={faTrash}
                  />
                  <span className="hover-text">Supprimer la facture </span>

                </p>

              </td>
            </tr>

            <tr className="tableRowsFooter">

              <td className={
                element.paymentStatus === "paid" ? "paid" :
                  element.paymentStatus === "open" ? "open" :
                    element.paymentStatus === "" ? "notPaid" :
                      "notPaid"}
              ><span></span></td>
              <td>
                <p className="cashRegisterPar">
                  <FontAwesomeIcon
                    onClick={() => {
                      invoicePaymentSetting(element.invoiceNumber, element.id);
                      openModal();
                    }}
                    className="faCashRegister"
                    icon={faCashRegister}

                  />

                  <span className="hover-text">Encaissement de facture</span>
                </p>

              </td>
              {/* {element.paymentStatus || "Non payée"} */}

              <td colSpan={1} style={{ textAlign: 'center' }}>
                <span>Numero facture  : {element.invoiceNumber || 0} </span> <br />
              </td>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                <span>Montant déjà payé : {element.totalPaid || 0} €</span> <br />
              </td>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                {/* <span>Reste à payer : {  (parseFloat(element.total.replace(" ", "").replace(/\s/g, '')) - (element.totalPaid || 0) ).toFixed(2) } </span> */}

                <span>Reste à payer: {(parseFloat(element.total.replace(/\s/g, '').replace(',', '.')) - (element.totalPaid || 0)).toFixed(2)}</span> €

                {/* <span>Reste à payer : { (parseFloat((element.total.replace(",", "."))) - (element.totalPaid || 0) ).toFixed(2) } </span>
                    € */}
              </td>

            </tr>
          </React.Fragment>
        );
      });
    }

    return content;
  };




  const renderPagination = useCallback(() => {
    let paginationBtns: any[] = [];
    if (currentPage != 0) {
      paginationBtns.push(
        <a
          key={currentPage - 1}
          onClick={() => {
            currentPage > 0 ? setCurrentPage(currentPage - 1) : "";
            window.scrollTo(0, 220);
            setSelectedInvoices([]);

          }}
          className="prevBtnPagination"
        >

          <FontAwesomeIcon

            className="faArrowLeft"
            icon={faArrowLeft}
          />



        </a>
      );
    }

    paginationBtns.push(
      <a className="" key={currentPage}
      >
        {currentPage + 1}
      </a>
    );

    let index = 0;

    if (currentPage != totalPagesCount - 1) {
      paginationBtns.push(
        <a
          key={currentPage + 1}

          onClick={() => {
            currentPage < totalPagesCount - 1
              ? setCurrentPage(currentPage + 1)
              : "";
            window.scrollTo(0, 220);
            setSelectedInvoices([]);

          }}
          className="nextBtnPagination"
        >
          <FontAwesomeIcon

            className="faArrowRight"
            icon={faArrowRight}
          />
        </a>
      );

      index++;
    }

    return <div className="pagination">{paginationBtns}</div>;
  }, [paginationKey]);
  // const dataArray= invoices;

  const updateArray = async (e: any, ch: string) => {
    let selectedOption = invoiceRefOption;
    let searchValueAux = searchValue;
    let searchValueRefFacture = searchValueRefFactureValue;

    console.log("whichelemnt : ", ch);
    if (ch == "select") {
      selectedOption = e.target.value;
      setInvoiceRefOption(selectedOption);
    } else if (ch == "inputAux") {
      searchValueRefFacture = e.target.value;
      setSearchValueRefFactureValue(searchValueRefFacture);
    } else {
      searchValueAux = e.target.value;
      setSearchValue(searchValueAux);
    }
    let formData = new FormData();
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('ref', invoiceRefOption);
    formData.append('search', searchValueAux);
    formData.append('sortOption', sortTableOption);
    formData.append('invoiceSearch', searchValueRefFacture);
    formData.append('page', (currentPage + 1).toString());
    formData.append('invoiceListCount', String(invoiceListCount));
    formData.append('filterInvoicesOption', filterInvoicesOption);


    try {
      const response = await axios.post(`${urlApi}/invoices`, formData, {
        withCredentials: true,
      });

      let invoicesArray: any[] = [];
      response.data.invoices.forEach((element: any) => {
        invoicesArray.push(element);
      });
      setAllInvoicesCount(response.data.allInvoicesCount);

      setSelectedInvoices([]);
      setTotalPagesCount(response.data.totalPages);
      setFilteredArray(invoicesArray);
    } catch (error) {
      console.error("Error occurred while filtering invoices:", error);
    }
  };

  const renderSelectInvoiceRefOptions = () => {
    return (
      <>
        {invoicesUniqueRef.map((item, key) => (
          <option value={item} key={`${item}-${key}`}>
            {item}
          </option>
        ))}
      </>
    );
  };

  function convertDateFormat(dateString: any) {
    const [month, day, year] = dateString.split("/");
    const date = new Date(`${month}/${day}/${year}`);

    const formattedDay = String(date.getDate()).padStart(2, "0");
    const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
    const formattedYear = String(date.getFullYear());

    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  }

  function sendInvoiceMail(email: any, id: any) {
    if (email != null && email != "") {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "<strong>Voulez-vous vraiment envoyer la facture en PDF à cette adresse e-mail ? </strong> <br> Email: " + email,
        confirmButtonColor: "black",
        confirmButtonText: "Envoyer",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          let formData = [];
          formData.push(id);

          axios
            .post(`${urlApi}/invoice_send_mail`, {
              selectedInvoicesArray: formData,
            })
            .then((response) => {
              console.log("response");
              Swal.fire({
                position: "center",
                icon: "success",
                html: "<strong>L'email à été bien envoyé</strong>",
                showConfirmButton: false,
                timer: 2500,
              });
            })
            .catch((err) => {
              console.log("error: ", err);
            });
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        html: "Pas d'adresse email <br> Merci d'ajouter une adresse e-mail pour ce client",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }

  function deleteInvoiceFromDB(id: any, ref: any) {
    Swal.fire({
      showCloseButton: true,
      showCancelButton: true,
      icon: "info",
      title: "Voulez-vous vraiment <br/> supprimer cette facture",
      text: "N°: " + ref,
      confirmButtonColor: "#dd333d",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      cancelButtonColor: "black",
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('id', id);
        Swal.fire({
          html: "<br/><strong>Veuillez confirmer la suppression</strong><br>",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          confirmButtonColor: "#dd333d",
          cancelButtonText: "Annuler",
          cancelButtonColor: "black",

        }).then((result) => {
          if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('id', id);
            axios
              .post(`${urlApi}/invoice_delete`, formData)
              .then((response) => {
                getAllInvoices(currentPage);
                Swal.fire({
                  position: "center",
                  icon: "success",
                  html: "<strong>La facture a été bien supprimée</strong>",

                  showConfirmButton: false,
                  timer: 2500,
                });
              })
              .catch((err) => {
                console.log("error: ", err);
              });
          }
        });

      }
    });
  }

  function updateEmailAddress(id: any, email: any) {
    Swal.fire({
      html: email != "" ? "<br><strong>Modifier l'adresse e-mail </strong><br><br/>E-mail actuelle <br/>" + email : "<br><strong>Modifier l'adresse e-mail</strong> <br><br/>Aucune adresse e-mail",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Modifier",
      showLoaderOnConfirm: true,
      confirmButtonColor: "black",
      cancelButtonText: "Non",
      cancelButtonColor: "#dd333d",
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        const emailInputValue: any = result.value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test(emailInputValue)) {
          const formData = new FormData();

          formData.append('id', id);
          formData.append('email', emailInputValue);

          axios
            .post(
              `${urlApi}/invoice_email_update`, formData
            )
            .then((result) => {
              Swal.fire({
                icon: "success",
                title: "L'adresse e-mail à été bien modifiée",
                text: emailInputValue,
                confirmButtonColor: "black",
                confirmButtonText: "D'accord",
              });

              setEmailUpdateKey(emailUpdateKey + 1);
            })
            .catch((err) => {
              Swal.fire({
                icon: "error",
                confirmButtonColor: "black",
                confirmButtonText: "D'accord",
              });
            });
        } else {
          Swal.fire({
            icon: "error",
            text: "Adresse e-mail invalide",
            confirmButtonColor: "black",
            confirmButtonText: "D'accord",
          });
        }
      }
    });
  }

  function invoicePayment(id: any) {
    // push('/payment/'+id);
    window.open("/payment/?id=" + id, "_blank");
  }



  const [paymentSelectedInvoiceNumber, setPaymentSelectedInvoiceNumber] = useState("");
  const [paymentSelectedInvoiceId, setPaymentSelectedInvoiceId] = useState("");

  function invoicePaymentSetting(invoice_id: string, id: any) {
    setPaymentSelectedInvoiceId(invoice_id)
    setPaymentSelectedInvoiceNumber(id)
  }




  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  useEffect(() => {
    console.log('selectedInvoices : ', selectedInvoices);
  }, [selectedInvoices]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, invoiceId: string) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedInvoices((prevSelectedInvoices) => [
        ...prevSelectedInvoices,
        invoiceId,
      ]);
    } else {
      setSelectedInvoices((prevSelectedInvoices) =>
        prevSelectedInvoices.filter((id) => id !== invoiceId)
      );
    }
  };

  async function sendInvoicesEmails() {
    if (selectedInvoices.length > 0) {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "<em>Voulez-vous vraiment envoyer les factures sélectionnée par mail ? </em> ",
        confirmButtonColor: "black",
        confirmButtonText: "Envoyer",
        cancelButtonText: "Non",
        cancelButtonColor: "#dd333d",
      }).then(async (result) => {
        if (result.isConfirmed) {

          try {
            const response = await axios.post(`${urlApi}/invoice_send_mail`, {
              selectedInvoicesArray: selectedInvoices,
            });

            Swal.fire({
              icon: "success",
              html: "Les factures ont été envoyées par e-mail avec succès.<br>",
              confirmButtonColor: "black",
              confirmButtonText: "D'accord",
            });

            setSelectedInvoices([]);
            getAllInvoices(currentPage);
          } catch (error) {
            console.error(error);
          }
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        html: "Aucune facture sélectionnée <br> Merci d'ajouter les factures que vous voulez envoyer",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }


  function selectAllInvoices() {
    let arrayAux: any[] = [];
    filteredArray.forEach(element => {
      arrayAux.push(element.id);
    });

    setSelectedInvoices(arrayAux);
    getAllInvoices(currentPage);
  }



  function resetSelectedInvoices() {
    setSelectedInvoices([]);
  }


  const items: MenuProps['items'] = [];

  if (selectedInvoices.length < filteredArray.length) {
    items.push({
      key: '1',
      onClick: selectAllInvoices,
      label: (
        <div className="linkDropDownTable">
          <span className="">Sélectionner tout</span>

          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faAdd} />
          </span>
        </div>
      ),
    });
  }




  items.push(
    {
      key: '2',
      danger: false,
      onClick: sendInvoicesEmails,
      label: (
        <div className="linkDropDownTable">

          <span className="">Envoyer tous par mail</span>
          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faEnvelope} />
          </span>
        </div>
      ),
    },
    {
      key: '3',
      onClick: globalInvoiceGenerating,
      label: (
        <div className="linkDropDownTable">
          <span className="">Regroupement de factures mensuels (Relevé)</span>

          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faFileInvoice} />
          </span>
        </div>
      ),
    },
    {
      key: '7',
      onClick: globalInvoicesPayment,
      label: (
        <div className="d-flex linkDropDownTable">
          <span className="">Régler les factures (encaissement global)</span>

          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faEuroSign} />
          </span>
        </div>
      ),
    },
    {
      key: '4',
      danger: true,
      onClick: deleteInvoicesArray,
      label: (
        <div className="linkDropDownTable">
          <span className="">Supprimer</span>

          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faTrash} />
          </span>
        </div>
      ),
    },
    {
      key: '5',
      onClick: resetSelectedInvoices,
      label: (
        <div className="linkDropDownTable">
          <span className="">Réinitialiser</span>

          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faMinus} />
          </span>
        </div>
      ),
    }
  );




  function globalInvoicesPayment() {
    if (selectedInvoices.length > 0) {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "Voulez-vous encaisser les montants totals pour ces factures",
        confirmButtonColor: "black",
        confirmButtonText: "Encaisser",
        cancelButtonText: "Annuler",
        cancelButtonColor: "#dd333d",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            html: "<br/><strong>Veuillez confirmer l'opération</strong> <br>",
            showCancelButton: true,
            confirmButtonText: "Confirmer",
            confirmButtonColor: "black",
            cancelButtonText: "Annuler",
            cancelButtonColor: "#dd333d",


          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                const response = await axios.post(`${urlApi}/globalInvoicesPayment`, {
                  selectedInvoicesArray: selectedInvoices,
                });

                Swal.fire({
                  icon: "success",
                  html: "Les factures ont été regénérées avec succès.<br>",
                  showCancelButton: false,
                  confirmButtonText: "D'accord",
                  confirmButtonColor: "black",
                });


                setSelectedInvoices([]);
                getAllInvoices(currentPage);
              } catch (error) {
                console.error(error);
              }
            } else {
              Swal.fire({
                icon: "error",
                html: "<strong>Mot de passe incorrect</strong>",
                confirmButtonColor: "black",
                confirmButtonText: "D'accord",
              });
            }


          });

        }
      });
    } else {
      Swal.fire({
        icon: "error",
        html: "Merci d'ajouter les factures que vous voulez encaisser <br/>",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }


  function globalInvoiceGenerating() {
    if (selectedInvoices.length > 0) {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "Voulez-vous vraiment générer une facture globale pour ces factures",
        confirmButtonColor: "black",
        confirmButtonText: "Générer",
        cancelButtonText: "Annuler",
        cancelButtonColor: "#dd333d",
      }).then(async (result) => {
        try {
          const response = await axios.post(`${urlApi}/generateGlobaleInvoice`, {
            selectedInvoicesArray: selectedInvoices,
          }, {
            responseType: "blob",
          });


          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Facturation-mensuelle.pdf");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(url);

          Swal.fire({
            icon: "success",
            html: "Les factures ont été générées avec succès.<br>",
            showCancelButton: false,
            confirmButtonText: "D'accord",
            confirmButtonColor: "black",

          });



        } catch (error) {
          console.error(error);
        }
      })



    } else {
      Swal.fire({
        icon: "error",
        html: "Merci d'ajouter les factures que vous voulez utiliser <br/> (min: 2 factures)",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }
  function deleteInvoicesArray() {
    if (selectedInvoices.length > 0) {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "Voulez-vous vraiment supprimer les factures",
        confirmButtonColor: "#dd333d",
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler",
        cancelButtonColor: "black",
      }).then((result) => {
        if (result.isConfirmed) {

          Swal.fire({
            html: "<br/><strong>Veuillez confirmer la suppression</strong> <br>",
            showCancelButton: true,
            confirmButtonText: "Supprimer",
            confirmButtonColor: "#dd333d",
            cancelButtonText: "Annuler",
            cancelButtonColor: "black",


          }).then(async (result) => {
            if (result.isConfirmed) {




              try {
                const response = await axios.post(`${urlApi}/deleteInvoicesArray`, {
                  selectedInvoicesArray: selectedInvoices,
                });

                Swal.fire({
                  icon: "success",
                  html: "Les factures ont été supprimées avec succès.<br>",
                  confirmButtonColor: "black",
                  confirmButtonText: "D'accord",
                });

                setSelectedInvoices([]);
                getAllInvoices(currentPage);
              } catch (error) {
                console.error(error);
              }
            }


          });

        }
      });
    } else {
      Swal.fire({
        icon: "error",
        html: "Aucune facture sélectionnée <br> Merci d'ajouter les factures que vous voulez supprimer",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }



  const onMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
  };




  function exportToPdfFormat() {
    if (selectedInvoices.length > 0) {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "<em>Voulez-vous vraiment exporter ces factures sélectionnées en format PDF ? </em> ",
        confirmButtonColor: "black",
        confirmButtonText: "Exporter",
        cancelButtonText: "Annuler",
        cancelButtonColor: "#dd333d",
      }).then(async (result) => {
        if (result.isConfirmed) {

          try {
            const response = await axios.post(`${urlApi}/generatePdfFromInvoices`, {
              selectedInvoicesArray: selectedInvoices,
            }, {
              responseType: "blob",
            });


            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Facturation-export.pdf");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

            Swal.fire({
              icon: "success",
              html: "Les factures ont été générées avec succès.<br>",
              showCancelButton: false,
              confirmButtonText: "D'accord",
              confirmButtonColor: "black",

            });



            setSelectedInvoices([]);
            getAllInvoices(currentPage);
          } catch (error) {
            console.error(error);
          }
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        html: "Aucune facture sélectionnée <br> Merci d'ajouter les factures que vous voulez exporter",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }




  function exportToCsvFormat() {
    if (selectedInvoices.length > 0) {
      Swal.fire({
        showCloseButton: true,
        showCancelButton: true,
        icon: "info",
        html: "<em>Voulez-vous vraiment exporter ces factures sélectionnées en format CSV ? </em> ",
        confirmButtonColor: "black",
        confirmButtonText: "Exporter",
        cancelButtonText: "Annuler",
        cancelButtonColor: "#dd333d",
      }).then(async (result) => {
        if (result.isConfirmed) {

          try {
            const response = await axios.post(`${urlApi}/generateCsvFromInvoices`, {
              selectedInvoicesArray: selectedInvoices,
            }, {
              responseType: "blob",
            });


            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Facturation-export.csv");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

            Swal.fire({
              icon: "success",
              html: "Les factures ont été générées avec succès.<br>",
              showCancelButton: false,
              confirmButtonText: "D'accord",
              confirmButtonColor: "black",

            });



            setSelectedInvoices([]);
            getAllInvoices(currentPage);
          } catch (error) {
            console.error(error);
          }
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        html: "Aucune facture sélectionnée <br> Merci d'ajouter les factures que vous voulez exporter",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    }
  }



  const itemsAuxExport = [];



  itemsAuxExport.push(
    {
      key: '2',
      danger: false,
      onClick: exportToCsvFormat,
      label: (
        <div className="">
          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faFileExport} />
          </span>
          <span className="">Vers CSV Format</span>
        </div>
      ),
    },
    {
      key: '3',
      onClick: exportToPdfFormat,
      label: (
        <div className="">
          <span>
            <FontAwesomeIcon className="faEnvelopeAux text-dark mx-4" icon={faFileExport} />
          </span>
          <span className="">Vers PDF Format</span>
        </div>
      ),
    },

  );

  const menuProps = {
    items: itemsAuxExport,
    onClick: onMenuClick,
  };




  ///////////////



  return (
    <div key={open.toString()}>
      {loading && (
        <div className="containerSpinner">
          <InvoicesListSpinner></InvoicesListSpinner>{" "}
        </div>
      )}

      {!loading && (
        <>
          <div className="container pb-5">
            <div className="row">
              {/* <div className="col-md-6 selectBox mb-3">
                <div className="select-wrapper">
                  <select
                    onChange={(event) => {
                      updateArray(event, "select");
                    }}
                    value={invoiceRefOption}
                    className="select"
                  >
                    <option value="">Toutes les factures</option>
                    {renderSelectInvoiceRefOptions()}
                  </select>
                </div>
              </div> */}
              <div className="rangePickerInvoicesList col-md-6 selectBox mb-3">
                <Space direction="vertical" size={12}>

                  <ConfigProvider locale={locale}>

                    <RangePicker
                      onChange={handleRangePickerChange}
                      placeholder={['Date de début', 'Date de fin']} // Set the placeholder text
                      format="DD/MM/YYYY"
                      renderExtraFooter={() => ' Veuillez sélectionner une période'}

                      cellRender={(current) => {
                        const style: React.CSSProperties = {};
                        if (current.date() === 1) {
                          style.border = '1px solid #1677ff';
                          style.borderRadius = '50%';
                        }
                        return (
                          <div className="ant-picker-cell-inner" style={style}>
                            {current.date()}
                          </div>
                        );
                      }}
                    />
                  </ConfigProvider>
                </Space>
              </div>
              <div className="col-md-6 mb-3">
                <div className="containerActionsDiv ">
                  <div className="search-box">
                    <input
                      type="text"

                      onChange={(event) => {
                        updateArray(event, "input");
                      }}
                      value={searchValue}
                      placeholder="Nom de l'entreprise..."
                    />
                    <a className="icon">
                      <FontAwesomeIcon icon={faSearch} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6 selectBox">
                <div className="select-wrapper">
                  <select
                    onChange={(event) => {
                      let value = event.target.value;
                      setSortTableOption(value);
                    }}
                    value={sortTableOption}
                    className="select"
                  >
                    <option value="">
                      Trier par
                    </option>

                    <option value="idAsc">
                      Date de création (Ascendant)
                    </option>
                    <option value="idDesc">
                      Date de création (Descendant)
                    </option>
                    <option value="invoice_dateAsc">
                      Date de facturation (Ascendant)
                    </option>
                    <option value="invoice_dateDesc">
                      Date de facturation (Descendant)
                    </option>

                    <option value="company_nameAsc">
                      Nom d'entreprise (Ascendant)
                    </option>
                    <option value="company_nameDesc">
                      Nom d'entreprise (Descendant)
                    </option>
                    <option value="invoice_amount_ttcAsc">Montant total (Ascendant)</option>
                    <option value="invoice_amount_ttcDesc">Montant total (Descendant)</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="containerActionsDiv ">
                  <div className="search-box">

                    <input
                      type="text"
                      name="searchValueRefFactureValueInput"
                      id="searchValueRefFactureValueInput"
                      onChange={(event) => {
                        updateArray(event, "inputAux");
                      }}
                      value={searchValueRefFactureValue}
                      placeholder="N° Facture"
                      autoComplete="new-password" aria-autocomplete="none"


                    />
                    <a className="icon">
                      <FontAwesomeIcon icon={faSearch} />
                    </a>
                  </div>
                  <input
                    type="text"
                    name="hiddenInput"
                    style={{ position: "fixed", left: "-9999px", display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>


                      <div className="d-flex tableHeaderBtns justify-content-between">
                      <div className=" d-flex p-0 pt-0 px-3 mx-3 btnsDivOptionsFilter py-4">
            <Radio.Group key={filterInvoicesOption} value={filterInvoicesOption} onChange={(e) => { setFilterInvoicesOption(e.target.value); setCurrentPage(0) }}>
              <Radio.Button value="">Tout</Radio.Button>
              <Radio.Button value="notPaid">Non payée</Radio.Button>
              <Radio.Button value="open">Partielle</Radio.Button>
              <Radio.Button value="paid">Payée</Radio.Button>
            </Radio.Group>
          </div>

          <div className=" d-flex p-0 pt-0 px-3 mx-3 btnsDivOptionsFilter py-4">

            <span style={{ marginRight:'20px' }}>Nombre de lignes  </span>
            <Select
              defaultValue="25"
              style={{ width: 120 , marginRight:'20px' }}
              onChange={(e) => {
                setInvoiceListCount(parseInt(e));
              }}
              options={[
                { value: '25', label: '25' },
                { value: '50', label: '50' },
                { value: '75', label: '75' },
                { value: '100', label: '100' },
                { value: '200', label: '200' },

              ]}
            />

<Space direction="horizontal">

{/* <Dropdown menu={menuProps}>

</Dropdown> */}

<Dropdown menu={menuProps}>
  <Button>
    <Space>
      Exporter
      <DownOutlined />
    </Space>
  </Button>
</Dropdown>
</Space>
          </div>
                      </div>


        

         
          {filteredArray.length > 0 && (

            <div className=" p-0 pt-0 px-3 mx-3 invoicesListDiv">

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th className="faEnvelopeTd">
                      <Dropdown menu={{ items }}>
                        <a className="text-white" onClick={(e) => e.preventDefault()}>
                          <Space>
                            ...
                            <DownOutlined />
                          </Space>
                        </a>
                      </Dropdown>

                    </th>
                    <th>
                      <span>ID</span>
                    </th>
                    <th>
                      <span>Bénéficiaire</span>
                    </th>
                    <th>
                      <span>Client</span>
                    </th>
                    <th>
                      <span>Montant</span>
                    </th>

                    <th>
                      <span>Date</span>
                    </th>
                    <th>
                      <span>N° facture</span>
                    </th>
                    <th>
                      <span>Periode</span>
                    </th>


                    <th>
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>{renderTableContent()}</tbody>

              </table>

              <div className="row d-flex">
                <div className="col-6"> <h5 className="py-0 m-0 bg-transparent">{`${filteredArray.length} resultat(s) sur  ${totalInvoicesCount}`}</h5><br /><h5 className=" m-0 bg-transparent">{`${totalPagesCount} page(s)`}</h5></div>
                <div className="col-6"><div className="paginationDiv bg-transparent">{renderPagination()}</div></div>

              </div>

            </div>
          )}

          {filteredArray.length == 0 && (
            <div className="container my-5 py-5 text-center">
              <h1 className="my-5 py-5 display-6 fw-500">Aucun resultat</h1>
            </div>
          )}
        </>
      )}

      <InvoiceDetailsModal invoiceNumber={paymentSelectedInvoiceNumber} invoiceId={paymentSelectedInvoiceId} open={open} onClose={() => setOpen(false)} />
    </div>
  );

}
