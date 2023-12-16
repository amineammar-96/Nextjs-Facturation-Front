"use client"
import React from "react";
import '../styles/StatistiquesPageStyle.css'
import "./globals.css";
import { endOfMonth, format, startOfMonth } from 'date-fns'; // Import the date formatting function

import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
// import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from "react-datepicker";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useRouter } from 'next/navigation';
import MolliePaymentsComponent from "./components/MolliePaymentsComponent";
import Chart from 'chart.js/auto';
import InvoiceAmountsChart from "./components/statsCompoentns/InvoiceAmountsChart";
import Logo from '../../public/assets/logoAux.png';
import Image from 'next/image';
import GenerateInvoicesComponent from "./components/GenerateInvoicesComponent";
import MolliePaymentsChart from "./components/statsCompoentns/MolliePaymentsChart";
import { fr } from "date-fns/locale";

import { DatePicker, Space, ConfigProvider , Select } from 'antd';
import 'dayjs/locale/fr';

import locale from 'antd/locale/fr_FR';


import CircleStatsCompoentChart from "./components/statsCompoentns/CircleStatsCompoentChart";

import { RangePickerProps } from 'rc-picker/lib/RangePicker';

import InvoiceDatesChart from "./components/statsCompoentns/InvoiceDatesChart";
import dayjs, { Dayjs } from "dayjs";
import UploadFileForm from "./components/UploadFileForm";
export default function StatistiquesPage() {
  const urlApi = "https://api.facturation.editeur-dentaire.fr/api";
  // const router = useRouter();

  const [amountTtcSum, setAmountTtcSum] = useState(0.0);
  const [amountTaxcSum, setAmountTaxSum] = useState(0.0);
  const [invoicesCountSum, setInvoicesCountSum] = useState(0);
  const [paymentsArray, setPaymentsArray] = useState<any[]>([]);
  const [paymentsArrayKey, setPaymentsArrayKey] = useState(0);

  const [amountTtcSumPaid, setAmountTtcSumPaid] = useState(0.0);
  const [amountTaxSumPaid, setAmountTaxSumPaid] = useState(0.0);


  const [dashboardStepWindow, setDashboardStepWindow] = useState(3);
  const [loggedIn, setLoggedIn] = useState(false);

  const { push } = useRouter();
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const formattedStartDate = `${String(threeMonthsAgo.getDate()).padStart(2, '0')}/${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}/${threeMonthsAgo.getFullYear()}`;
  const formattedEndDate = `${String(lastDayOfMonth.getDate()).padStart(2, '0')}/${String(lastDayOfMonth.getMonth() + 1).padStart(2, '0')}/${lastDayOfMonth.getFullYear()}`;

  // alert(formattedStartDate);
  const [endDate, setEndDate] = useState(formattedEndDate);
  const [startDate, setStartDate] = useState(formattedStartDate);



  useEffect(() => {
    registerLocale("fr", fr);
    setDefaultLocale("fr");
    const loginValue = localStorage.getItem('login');

    if (loginValue == null || loginValue == '') {
      push('/login');
      console.log(loginValue);
      setLoggedIn(false);
    } else {
      setLoggedIn(true);


    }
  }, []);



  useEffect(() => {

    const formData = new FormData();

    const startDateFormatted = startDate.split('-').reverse().join('/');
    const endDateFormatted = endDate.split('-').reverse().join('/');

    formData.append('startDate', startDateFormatted);
    formData.append('endDate', endDateFormatted);

    const options = {
      method: 'post',
      url: `${urlApi}/statistics_invoices_allAmounts`,
      data: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials' : 'true',
        'withCredentials': 'true',
      },
    };

    axios(options).then((response) => {
      let amountSum = response.data.totalAmountTTC;
      let amountSumTax = response.data.totalTvaTax;
      let invoicesCoun = response.data.countInvoices;
      let amountPaid = response.data.amountTtcSumPaid;
      let amountTvaPaid = response.data.totalAmountTVAPaid;

      
     
      setAmountTtcSumPaid(amountPaid);
      setAmountTaxSumPaid(amountTvaPaid);
      setAmountTtcSum(amountSum)
      setAmountTaxSum(amountSumTax)
      setInvoicesCountSum(invoicesCoun)

     
    });

  }, [startDate, endDate , dashboardStepWindow]);


  const formattedAmount = amountTtcSum.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const displayAmount = formattedAmount.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
  

  const formattedAmountAux = amountTaxcSum.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const displayAmountTva = formattedAmountAux.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');



  
  

  useEffect(() => {
    setPaymentsArrayKey(paymentsArrayKey + 1);
  }, [paymentsArray]);



  useEffect(() => {
    getAllPayments();
  }, []);

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
        'Access-Control-Allow-Credentials' : 'true',
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


  const renderTablePayments = () => {

    let rowTrs: any[] = [];


    paymentsArray.forEach((element, index) => {
      if (index <= 10) {
        rowTrs.push(
          <tr key={`${index} - ${element["id"]}`}>
            <td>{element["id"]}</td>
            <td>{element["amount"]["value"]} €</td>
            <td>{element["description"]}</td>
            <td>{element["status"]}</td>
          </tr>
        );
      }
    });


    return <><tbody>{rowTrs}</tbody></>;

  }




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
    }
  };



  useEffect(() => {

    console.log('changed ')
    console.log('endDate : ', endDate);
    console.log('endDate : ', endDate);


  }, [startDate, endDate]);

  const { RangePicker } = DatePicker;


  return (
    <>
      {loggedIn && (
        <main className="mainFitst">

          <div className="containerAux">
            <nav className="sidebar">
              <div className="w-100 row ">
                <div className="sidebar__logo py-0">
                  <a href="/" className="text-center d-flex justify-content-center">
                    <Image
                      src={Logo}
                      alt="Logo"

                    />
                  </a>
                  {/* <h2 className="sidebar__logo-header">SAPS</h2>     */}
                  <ul className="side-nav">



                    <li onClick={() => {
                      setDashboardStepWindow(3);
                    }} className={dashboardStepWindow == 3 ? "side-nav__item side-nav__item-active" : 'side-nav__item '}>
                      <svg width="22" height="23" viewBox="0 0 22 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.23201 3.4202L9.23239 3.41989C10.2108 2.63408 11.7843 2.63834 12.7781 3.42994C12.7783 3.43005 12.7784 3.43015 12.7785 3.43025L18.7784 8.2301C18.7789 8.23054 18.7795 8.23099 18.78 8.23143C19.1189 8.50835 19.4146 8.94381 19.6058 9.44415C19.7968 9.94409 19.8672 10.4662 19.8014 10.8985L18.6475 17.8037C18.6474 17.8042 18.6473 17.8047 18.6472 17.8052C18.4217 19.0989 17.1608 20.1667 15.8585 20.1667H6.1418C4.81982 20.1667 3.58766 19.1252 3.36227 17.8148C3.36221 17.8145 3.36215 17.8142 3.36209 17.8138L2.20746 10.9043L2.20726 10.9032C2.13345 10.4677 2.19947 9.94466 2.39002 9.44498C2.58055 8.94535 2.87982 8.51038 3.22697 8.2334L3.22784 8.2327L9.23201 3.4202ZM11.0001 18.1876C11.6521 18.1876 12.1876 17.652 12.1876 17.0001V14.2501C12.1876 13.5981 11.6521 13.0626 11.0001 13.0626C10.3482 13.0626 9.81263 13.5981 9.81263 14.2501V17.0001C9.81263 17.652 10.3482 18.1876 11.0001 18.1876Z" fill="currentColor" stroke="currentColor" />
                      </svg>
                      <span>Facturation</span>
                    </li>

                    <li onClick={() => {
                      setDashboardStepWindow(1);
                    }} className={dashboardStepWindow == 1 ? "side-nav__item side-nav__item-active" : 'side-nav__item '}>
                      <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.30664 17.1375V15.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M11 17.1375V13.3425" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M15.6934 17.1375V11.4358" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M15.6933 5.86255L15.2716 6.35755C12.9341 9.08922 9.79914 11.0234 6.30664 11.8942" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M13.0073 5.86255H15.6932V8.53922" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.25016 20.6667H13.7502C18.3335 20.6667 20.1668 18.8334 20.1668 14.25V8.75004C20.1668 4.16671 18.3335 2.33337 13.7502 2.33337H8.25016C3.66683 2.33337 1.8335 4.16671 1.8335 8.75004V14.25C1.8335 18.8334 3.66683 20.6667 8.25016 20.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Dashboard</span>
                    </li>

                    <li onClick={() => {
                      setDashboardStepWindow(4);
                    }} className={dashboardStepWindow == 4 ? "side-nav__item side-nav__item-active" : 'side-nav__item '}>
                      <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.2915 12.6367V11.0509C2.2915 9.15336 3.84067 7.60419 5.73817 7.60419H16.2615C18.159 7.60419 19.7082 9.15336 19.7082 11.0509V12.3709H17.8565C17.3432 12.3709 16.8757 12.5725 16.5365 12.9208C16.1515 13.2967 15.9315 13.8375 15.9865 14.415C16.069 15.405 16.9765 16.1292 17.9665 16.1292H19.7082V17.22C19.7082 19.1175 18.159 20.6667 16.2615 20.6667H11.2382" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.2915 11.8758V7.6867C2.2915 6.59587 2.96067 5.62416 3.97817 5.23916L11.2565 2.48916C12.3932 2.05833 13.6123 2.90169 13.6123 4.12085V7.60418" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20.6787 13.306V15.1944C20.6787 15.6985 20.2754 16.111 19.7621 16.1293H17.9654C16.9754 16.1293 16.0679 15.4052 15.9854 14.4152C15.9304 13.8377 16.1504 13.2968 16.5354 12.921C16.8746 12.5727 17.3421 12.371 17.8554 12.371H19.7621C20.2754 12.3894 20.6787 12.8018 20.6787 13.306Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.4165 11.5H12.8332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.75 15.625H7.645C8.23166 15.625 8.70833 16.1016 8.70833 16.6883V17.8617" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.86833 14.5067L2.75 15.625L3.86833 16.7433" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.70833 20.4651H3.81334C3.22667 20.4651 2.75 19.9884 2.75 19.4017V18.2284" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7.59131 21.5837L8.70964 20.4653L7.59131 19.347" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Paiements</span>
                    </li>
                    <li onClick={() => {
                      setDashboardStepWindow(5);
                    }} className={dashboardStepWindow == 5 ? "side-nav__item side-nav__item-active" : 'side-nav__item '}>
                      <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.1668 9.66671V14.25C20.1668 18.8334 18.3335 20.6667 13.7502 20.6667H8.25016C3.66683 20.6667 1.8335 18.8334 1.8335 14.25V8.75004C1.8335 4.16671 3.66683 2.33337 8.25016 2.33337H12.8335" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20.1668 9.66671H16.5002C13.7502 9.66671 12.8335 8.75004 12.8335 6.00004V2.33337L20.1668 9.66671Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.4165 12.4166H11.9165" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.4165 16.0834H10.0832" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Importer CSV</span>
                    </li>
                  </ul>
                </div>




              </div>



            </nav>





            {dashboardStepWindow == 1 && (<main className="main-content">

              <div className="bottom-container">
                <div className="bottom-container__left">
                  <div className="bottom-container__right">
                    <div className="box cardAuxInvoicesCount">
                      <div className="header-container">
                        <h3 className="section-header">Nombre De Factures</h3>

                      </div>
                      <h1 className="price text-center">{invoicesCountSum}</h1>
                      <p className="mb-5">Periode du : {startDate} - {endDate}</p>

                      <div className="d-flex justify-content-center  ">

                        <div className="rangePickerDashboard">

                          <Space direction="vertical" size={12}>

                            <ConfigProvider locale={locale}>

                              <RangePicker
                                // (dates: [Dayjs, Dayjs], dateString: string)
                                onChange={handleRangePickerChange}
                                placeholder={['Date de début', 'Date de fin']} // Set the placeholder text
                                format="DD/MM/YYYY"
                                cellRender={(current) => {
                                  const style: React.CSSProperties = {};
                                  if ((current as  Dayjs).date() === 1) {
                                    style.border = '1px solid #1677ff';
                                    style.borderRadius = '50%';
                                  }
                                  return (
                                    <div className="ant-picker-cell-inner" style={style}>
                                      {(current as  Dayjs).date()}
                                    </div>
                                  );
                                }}
                              />
                            </ConfigProvider>
                          </Space>
                        </div>

                      </div>
                      <div className="button-box">



                      </div>
                    </div>

                    <div className="box cardAuxInvoicesCount circleStatsCompoentChart">

                      <div className="chartDiv">
                        <CircleStatsCompoentChart startDate={(startDate)} endDate={(endDate)}></CircleStatsCompoentChart>
                      </div>
                    </div>



                  </div>


                  <div className="box total-box">
                    <div className="total-box__left">
                      <div className="header-container">
                        <h3 className="section-header">Total Factures</h3>

                      </div>
                      <h1 className="price">{displayAmount} €<span className="price-currency">(euros)</span></h1>
                    </div>
                    <div className="total-box__right">
                      <div className="header-container">
                        <h3 className="section-header">Total TVA</h3>

                      </div>
                      <h1 className="price">{displayAmountTva} €<span className="price-currency">(euros)</span></h1>
                    </div>
                  </div>

                  <div className="box total-box">
                    <div className="total-box__left">
                      <div className="header-container">
                        <h3 className="section-header" style={{ color:"green" }}>Total Factures Payées</h3>

                      </div>
                      <h1 className="price" style={{ color:"green" , textAlign:"center" }}>+ {amountTtcSumPaid.toFixed(2)} €</h1>
                    </div>
                   
                  </div>

                  <div className="box spending-box">
                    <div className="header-container">
                      <h3 className="section-header" style={{ color:"red" }} >En attente de paiement </h3>

                    </div>
                    <div className="bar-chart">
                    <h1 className="price" style={{ color:"red" }}>- {(amountTtcSum - amountTtcSumPaid).toFixed(2)} €</h1>

                      {/* <InvoiceDatesChart startDate={(startDate)} endDate={(endDate)} /> */}
                    </div>
                  </div>

                  <div className="box spending-box">
                    <div className="header-container">
                      <h3 className="section-header">Statistiques Facturation</h3>

                    </div>
                    <div className="bar-chart">
                      <InvoiceDatesChart startDate={(startDate)} endDate={(endDate)} />
                    </div>
                  </div>

                  <div className="box spending-box">
                    <div className="header-container">
                      <h3 className="section-header">Statistiques Montant Total Facturation</h3>

                    </div>
                    <div className="bar-chart d-flex">
                      <InvoiceAmountsChart startDate={(startDate)} endDate={(endDate)} ></InvoiceAmountsChart>
                    </div>
                  </div>
                  <div className="box transaction-box">
                    <div className="header-container">
                      <h3 className="section-header">Historiques Paiements</h3>


                    </div>
                    <table className="transaction-history">
                      <thead>
                        <tr>
                          <th>Transaction</th>
                          <th>Montant


                          </th>
                          <th>Amount
                            {/* <div className="label__color first"></div> */}



                          </th>
                          <th>Status


                          </th>
                        </tr>
                      </thead>



                      {renderTablePayments()}

                    </table>

                  </div>
                  <div className="box spending-box">
                    <div className="header-container">
                      <h3 className="section-header">Statistiques Paiements Mollie </h3>

                    </div>
                    <div className="bar-chart d-flex">
                      {paymentsArray.length > 0 && <MolliePaymentsChart key={paymentsArrayKey} payments={paymentsArray} />
                      }
                    </div>
                  </div>

                </div>

              </div>
            </main>)}


            {dashboardStepWindow == 3 && (<main className="main-content">
              <GenerateInvoicesComponent></GenerateInvoicesComponent>
            </main>)}

            {dashboardStepWindow == 4 && (<main className="main-content">
              <MolliePaymentsComponent></MolliePaymentsComponent>
            </main>)}


            {dashboardStepWindow == 5 && (<main className="main-content">
              <UploadFileForm></UploadFileForm>
            </main>)}




          </div>

        </main>
      )}

    </>


  );
}
