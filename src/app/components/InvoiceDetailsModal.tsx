import React, { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import '../../styles/invoiceDetailModalStyle.css'
import { Space } from 'antd';

import Img1 from '../../../public/assets/logoAux.png'

import Image from 'next/image';

import {
    Cascader,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Switch,
    TreeSelect,
} from 'antd';

import ImgPaid from '../../../public/assets/paid.png'

import ImgNotPaid from '../../../public/assets/notPaid.png'

import frFR from 'antd/lib/locale/fr_FR';
import type { DatePickerProps } from 'antd';

import 'dayjs/locale/fr';

import locale from 'antd/locale/fr_FR';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Moment, now } from 'moment';
import moment from 'moment';



const { RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const weekFormat = 'MM/DD';
const monthFormat = 'YYYY/MM';

/** Manually entering any of the following formats will perform date parsing */
const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];

const customFormat: DatePickerProps['format'] = (value) =>
    `custom format: ${value.format(dateFormat)}`;

const customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
    `${dayjs(value).startOf('week').format(weekFormat)} ~ ${dayjs(value)
        .endOf('week')
        .format(weekFormat)}`;





import { EuroCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { elements } from 'chart.js';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';







export default function InvoiceDetailsModal({ open, onClose, invoiceId }: any) {
    const [secondModalVisible, setSecondModalVisible] = useState(false);
    const openSecondModal = () => {
        setTransactionDate('');
        setSecondModalVisible(true);
    };




    const urlApi = "https://api.facturation.editeur-dentaire.fr/api";    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [totalPaymentPrice, setTotalPaymentPrice] = useState(0.0);
    const [totalPaymentStillForPayment, setTotalPaymentStillForPayment] = useState(0.0);
    const [invoiceAmount, setInvoiceAmount] = useState(0.0);
    const [transactionsArray, setTransactionsArray] = useState<any[]>([]);



    const [transactionDescription, setTransactionDescription] = useState("Encaissement");
    const [transactionAmount, setTransactionAmount] = useState(0.0);
    const [transactionMethod, setTransactionMethod] = useState("");
    const [transactionDate, setTransactionDate] = useState(dayjs().format('DD/MM/YYYY'));
    const [transactionProccess, setTransactionProccess] = useState(false);


    useEffect(() => {
        getInvoiceDetails();
    }, [transactionProccess]);

    useEffect(() => {
        checkInvoicesPayment();

    }, [invoiceDetails, totalPaymentStillForPayment, transactionsArray]);


    

    async function checkInvoicesPayment() {
        transactionsArray.forEach(async element => {
            const formData = new FormData();
            if(element.molliePaymentId==null){
            formData.append('molliePaymentId', element.molliePaymentId)
            const response = await axios.post(`${urlApi}/checkInvoicesPayment`, formData).then((result) => {
            }).catch((err) => {
                console.log('error : ', err);
            });
            }
        });
    }


    async function getTransactionsByInvoiceNumber() {
        let arrayAux: any = [];
        let ch = '';
        const formData = new FormData();
        formData.append('invoiceNumber', invoiceId);

        const options = {
            method: 'post',
            url: `${urlApi}/getInvoiceTransactionByInvoiceNumber`,
            data: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials' : 'true',
            },
        };

        axios(options).then( (response) => {

            response.data.transaction.forEach((element: any) => {
                arrayAux.push(element);
            });

             setTransactionsArray(arrayAux);



        }).catch((err) => {
            console.log(err)
        });
    }


    async function getInvoiceDetails() {
        let arrayAux: any = [];
        let ch = '';
        const formData = new FormData();
        formData.append('invoice_number', invoiceId);
        axios.post(`${urlApi}/getInvoiceDetailsById`, formData).then((response) => {
            getTransactionsByInvoiceNumber();
            ch = response.data.invoice.total;

            arrayAux.push(response.data.invoice);



            let amountFormatted;
            if (ch) {
                amountFormatted = parseFloat(ch.replace(/\s/g, '').replace(',', '.')).toFixed(2);
              } else {
                amountFormatted = "0";
              }
              let diff = parseFloat(amountFormatted) - response.data.invoice.totalPaid;
              setTotalPaymentStillForPayment(diff);
              setInvoiceAmount(parseFloat(amountFormatted));
              setInvoiceDetails(arrayAux);
              setTotalPaymentPrice(diff);
              setTransactionAmount(diff);

        });
    }




    const handlePriceInput = (price: any) => {
        if (!isNaN(price)) {
            const formattedPrice = parseFloat(price).toFixed(2);
            setTotalPaymentPrice(parseFloat(formattedPrice));
            setTransactionAmount(parseFloat(formattedPrice));
        }

        if (price < 0) {
            setTotalPaymentPrice(0.00);
            setTransactionAmount((0.00));

        }

        if (price > totalPaymentStillForPayment) {
            setTotalPaymentPrice(totalPaymentStillForPayment);
            setTransactionAmount((totalPaymentStillForPayment));

        }
    };


    function deleteTransactionById(id : any){
            Swal.fire({
              showCloseButton: true,
              showCancelButton: true,
              icon: "info",
              html: "Voulez-vous vraiment supprimer cette transactions",
              confirmButtonColor: "#dd333d",
              confirmButtonText: "Supprimer",
              cancelButtonText: "Annuler",
              cancelButtonColor: "black",
            }).then((result) => {
              if (result.isConfirmed) {
      
                let passwordDelete = "azerty"
                Swal.fire({
                  html: "<br/><strong>Veuillez confirmer la suppression</strong> <br>",
                  showCancelButton: true,
                  confirmButtonText: "Confirmer",
                  confirmButtonColor: "#dd333d",
                  cancelButtonText: "Annuler",
                  cancelButtonColor: "black",
                  
      
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('transactionId' , id);
                    try {
                      const response = await axios.post(`${urlApi}/deleteTransactionHorsMolliePayments`, formData);

                      getInvoiceDetails();
                      getTransactionsByInvoiceNumber();
                      checkInvoicesPayment();
                      Swal.fire({
                        icon: "success",
                        html: "La transaction a été supprimée avec succès et la facture a été réduite.",
                        confirmButtonColor: "black",
                        confirmButtonText: "D'accord",
                      });
  
                     
                    } catch (error) {
                      console.error(error);
                    }
                  }
                });
      
              }
            });
          
    }


    function renderTransactions() {


        return (<>
            {
                transactionsArray.map((element, index) => (
                    <tr key={index}>
                        <td>
                            <span className={element.status === 'expired' || element.status === 'canceled' || element.status === 'failed' ? 'redDashedLine' : ''}>
                                {element.description} - Ajouté le {moment(element.Date.date).format('DD/MM/YYYY')}
                            </span>
                            {element.status && (
                                <span className={element.status === 'expired' || element.status === 'canceled' || element.status === 'failed' ? 'redDashedLine' : ''}>
                                    {element.paiementId}: ({element.status})
                                </span>
                            )}
                        </td>
                        <td className="">
                            <span className={element.status === 'expired' || element.status === 'canceled' || element.status === 'failed' ? 'redDashedLine' : ''}>

                                {element.paymentMethod}
                            </span></td>
                        <td> <span className={element.status === 'expired' || element.status === 'canceled' || element.status === 'failed' ? 'redDashedLine' : ''}>

                            {element.amount} €
                        </span></td>
                        <td> 
                            {element.molliePaymentId==null && (
                                  <FontAwesomeIcon
                                  onClick={() => {
                                      deleteTransactionById(element.id);
                                  }}
                                  className="faDeleteTransaction"
                                  icon={faTrash}
                              />
                            )}
                          </td>
                    </tr>
                ))
            }
        </>);
    }




    function addNewTransactionByInvoice() {


        const formData = new FormData();

        if (transactionDescription == "") {
            formData.append('description', "Encaissement")

        } else {
            formData.append('description', transactionDescription)

        }
        formData.append('amount', transactionAmount.toFixed(2))
        formData.append('date', (transactionDate));
        formData.append('method', transactionMethod)
        formData.append('invoiceNumber', invoiceId)



            if (transactionMethod ==""){
                Swal.fire({
                    icon: "error",
                    html: "Veuillez saisir la méthode de transaction",
                    confirmButtonColor: "black",
                    confirmButtonText: "D'accord",
                });
            }else if (transactionDate ==""){
                Swal.fire({
                    icon: "error",
                    html: "Veuillez sélectionner une date valide ",
                    confirmButtonColor: "black",
                    confirmButtonText: "D'accord",
                });
            }else if(transactionAmount== 0){
                Swal.fire({
                    icon: "error",
                    html: "Veuillez saisir le montant de transaction",
                    confirmButtonColor: "black",
                    confirmButtonText: "D'accord",
                });
            }else {

            

            Swal.fire({
                showCloseButton: true,
                showCancelButton: true,
                icon: "info",
                html: "<p>Voulez-vous vraiment encaisser ce paiement pour cette facture ? </p> Montant: " + transactionAmount.toFixed(2) + " € <br/> ",
                confirmButtonColor: "black",
                confirmButtonText: "Encaisser",
                cancelButtonText: "Non",
                cancelButtonColor: "#dd333d",
            }).then((result) => {
                if (result.isConfirmed) {

                    let passwordDelete = "azerty"
                    Swal.fire({
                        html:
                            '<br/><strong>Veuillez confirmer cette opération </strong> <br>' ,
                        showCancelButton: true,
                        confirmButtonText: "Confirmer",
                        confirmButtonColor: "black",
                        cancelButtonText: "Annuler",
                        cancelButtonColor: "#dd333d",
                       
                        

                    }).then((result) => {
                        if (result.isConfirmed) {


                                    setTransactionProccess(false);

                                    axios
                                        .post(`${urlApi}/addNewTransactionByInvoice`, formData)
                                        .then((response) => {
                                            setTransactionAmount(0.0);
                                            setTotalPaymentPrice(0.0);
                                            setTransactionDate('');
                                            setTransactionDescription('Encaissement');
                                            setTransactionMethod('');
                                            setSecondModalVisible(false);
                                            getTransactionsByInvoiceNumber();
                                            setTransactionProccess(true);
                                            Swal.fire({
                                                position: "center",
                                                icon: "success",
                                                html: "<strong>La transaction à été bien confirmée</strong>",

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
       
        
    }




    const handleTransactionDate: DatePickerProps['onChange'] = (date, dateString) => {
        console.log(date, dateString);

        if (dateString && date) {
            console.log(date.format('DD/MM/YYYY'));
            let ch = date.format('DD/MM/YYYY');
            setTransactionDate((ch));
        }
    };


    dayjs.extend(customParseFormat);




    return (
        <>
            <Modal
                title=""
                centered
                open={open}
                onOk={onClose}
                onCancel={onClose}
                width={1000}
                key={(invoiceDetails)}
                footer={(
                    <>
                        <Button onClick={onClose} className='footerModalBtnClose'>Fermer</Button>
                    </>
                )}

            >


                <div className="container">
                    <div className="invoice">
                        <div className="row">
                            <div className="col-7">
                                <Image src={Img1} width={200} height={50} alt={'Logo SAPS'}>

                                </Image>
                                {/* <img src="http://mysam.fr/wp-content/uploads/2016/06/logo_facture.jpg" className="logo"/> */}
                            </div>
                            <div className="col-5">



                            </div>
                        </div>
                        <div className="row">
                            <div className="col-7">
                                <p className="addressMySam pt-3 mt-3">
                                    {invoiceDetails?.[0]?.['companyName'] || ''}
                                    <br />
                                    {invoiceDetails?.[0]?.['address'] || ''}
                                    <br />
                                    {invoiceDetails?.[0]?.['city'] || ''}  ,  {invoiceDetails?.[0]?.['postalCode'] || ''}
                                    <br />
                                    France
                                    <br />
                                    {invoiceDetails?.[0]?.['client'] || ''}
                                    <br />

                                    {invoiceDetails?.[0]?.['email'] || ''}
                                    <br />
                                </p>
                            </div>

                            <div className="col-5">

                                <p className="addressMySam pt-3 mt-3">
                                    Numéro facture : {invoiceDetails?.[0]?.['invoiceNumber'] || ''}
                                    <br />
                                    {invoiceDetails?.[0]?.['invoicePeriode'] || ''}
                                    <br />
                                    Facturé le {(invoiceDetails?.[0]?.["invoiceDate"]) || ''}
                                    <br />
                                    {invoiceDetails?.[0]?.['invoiceRef'] || ''}
                                    <br />
                                    {invoiceDetails?.[0]?.['description'] || ''}


                                </p>
                            </div>


                        </div>
                        <br />
                        <h6>
                            Montant total facture TTC: {invoiceAmount.toFixed(2)} €

                        </h6>
                        <h6>
                            Montant déjà payé TTC : {invoiceDetails?.[0]?.['totalPaid'] || ''} €
                        </h6>
                        <h6>
                            Reste à payer par le client: {totalPaymentStillForPayment.toFixed(2)} €
                        </h6>
                        <br />



                        <br />
                            {transactionsArray.length > 0 && (
                                <table className="table table-striped">

                                    <thead>
                                        <tr>
                                            <th>Historique paiements</th>

                                            <th>Methode</th>
                                            <th className="text-right">Total TTC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            renderTransactions()
                                        }
                                    </tbody> 
                                    </table>

                            )}


                        <div className="row">
                            <div className="col-8">
                                {
                                    totalPaymentStillForPayment != 0 && (<Button onClick={openSecondModal} className='addNewPaymentModalBtn'>Encaisser un nouveau paiement <strong className='plusSpanTransaction'>+</strong> </Button>
                                    )}

                                {
                                    totalPaymentStillForPayment == 0 && (
                                        <Image src={ImgPaid} alt='Payée' width={150} height={50}></Image>

                                    )
                                }
                            </div>
                            <div className="col-4">
                                <table className="table totalTableModal table-sm text-right">
                                    <tbody>
                                        <tr className='pb-4'>
                                            <td><strong>Total payé TTC</strong></td>
                                            <td className="text-right">{invoiceDetails?.[0]?.['totalPaid'] || ''} €</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        {
                            totalPaymentStillForPayment != 0 && (
                                <Image src={ImgNotPaid} alt='non Payée' className='mt-3' width={150} height={50}></Image>

                            )
                        }



                        <br />


                    </div>
                </div>
            </Modal >



            <Modal
                centered
                open={secondModalVisible}
                onOk={() => setSecondModalVisible(true)}
                onCancel={() => setSecondModalVisible(false)}
                width={600}
                title="Ajouter un paiement manuellement"

                footer={(
                    <>
                        <Button className='footerModalBtnSubmit' onClick={() => {
                            // setSecondModalVisible(false)
                            addNewTransactionByInvoice();

                        }} >Encaisser</Button>
                        <Button className='footerModalBtnClose' onClick={() => {
                            setSecondModalVisible(false)
                        }} >Fermer</Button>
                    </>
                )}    >
                <Form
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    initialValues={{ size: "large" }}
                    size={"large"}
                    //   style={{ maxWidth: 600 }}
                    className='pt-4'

                >


                    <Form.Item label="Description">
                        <Input value={transactionDescription} onChange={
                            (e) => {
                                setTransactionDescription(e.target.value);

                            }
                        } placeholder='' />
                    </Form.Item>
                    <Form.Item label="Mode de paiement">
                        <Select value={transactionMethod} onChange={
                            (e) => {
                                setTransactionMethod(e);

                            }
                        }>
                            <Select.Option value="virement">Virement bancaire</Select.Option>
                            <Select.Option value="cash">Cash</Select.Option>
                            <Select.Option value="CB">CB</Select.Option>
                            <Select.Option value="autre">Autre</Select.Option>

                        </Select>
                    </Form.Item>



                    <Form.Item label="Date de paiement">
                        <Space direction="vertical" size={12}>
                            {/* moment(invoiceDetails?.[0]?.["invoiceDate"], 'MM/DD/YYYY').format('DD/MM/YYYY') */}
                            <ConfigProvider locale={locale}>

                            <DatePicker

                            // defaultValue={dayjs(transactionDate, 'DD/MM/YYYY', 'fr', true)}
                                onChange={handleTransactionDate} placeholder='JJ/MM/AAAA' format={dateFormatList} />
                                </ConfigProvider>
                        </Space>
                    </Form.Item>
                    <Form.Item label="Montant TTC">
                        <InputNumber value={totalPaymentPrice}
                            name="priceInput"
                            type='number'
                            min={0}
                            step={0.01}
                            onChange={handlePriceInput}
                            addonAfter={<EuroCircleOutlined />} prefix="" style={{ width: '100%' }} />

                    </Form.Item>


                </Form>
            </Modal>
        </>
    );
}

