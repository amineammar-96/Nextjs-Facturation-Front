import React, { useEffect, useRef ,useState } from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import axios from "axios";

export default function CircleStatsCompoentChart({ startDate, endDate } :any) {


    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const urlApi = "https://api.facturation.editeur-dentaire.fr/api";
    const [statistics, setStatistics] = useState<any[]>([]);
    const chartInstanceRef = useRef<Chart | null>(null); // Reference to the Chart instance
    const [monthsArray, setMonthArray] = useState<any[]>([]);
    const [yearsArray, setYearArray] = useState<any[]>([]);
    const [monthsAndYearsArray, setMonthsAndYearsArray] = useState<any[]>([]);
    const [statisticsTva, setStatisticsTva] = useState<any[]>([]);
  
    const [circleChartKey, setCircleChartKey] = useState(0);

    const [amountTotalTtc, setAmountTotalTtc] = useState(0.0);
    const [tvaTotal, setTvaTotal] = useState(0.0);

    
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
                'withCredentials': 'true',
            },
        };


        axios(options).then((response) => {
        let amountSum = response.data.totalAmountTTC;
        let amountSumTax = response.data.totalTvaTax;
        let invoicesCoun = response.data.countInvoices;
        let amountTtcSumPaid = response.data.amountTtcSumPaid;

        setAmountTotalTtc(amountTtcSumPaid);
        setTvaTotal(amountSum - amountTtcSumPaid);
      });

  }, [startDate,endDate]);


  
  useEffect(() => {
    let auxArrayStats:any[]=[];

    let montantTotal=0.0;
   let tvaTotal=0.0;
   console.log('statisticsstatistics statistics : ' , statistics);

    statistics.forEach((element:any) => {
      montantTotal+=element.amount
      tvaTotal+=element.tva
    });


    setTvaTotal(tvaTotal);
    setAmountTotalTtc(montantTotal);

    console.log('arraaa montantTotalmontantTotal : ' , montantTotal);
    setCircleChartKey(circleChartKey+1);
},[statistics]);


  
  useEffect(() => {
      let arrayAux:any = [];
      monthsArray.forEach((element,index) => {
          arrayAux.push(element+'-'+yearsArray[index])
      });
      setMonthsAndYearsArray(arrayAux);
  },[statistics , yearsArray ,setStatisticsTva ,monthsArray]);
  
  
  


    const data = {
        labels: ['Montant TTC Payé', 'Montant TTC en attente de paiement'],
        datasets: [
          {
           
            data: [amountTotalTtc , tvaTotal],
            backgroundColor: ['#42DE86', '#F45858'],
            hoverBackgroundColor: ['#42DE86', '#F45858'],
          },
        ],
      };

      
      
  return (
    <>
    
    
    {tvaTotal>=0 && amountTotalTtc>=0  && (
          <Doughnut className='circleChart' data={data} key={circleChartKey} />

    )}

    </>
    )
}
