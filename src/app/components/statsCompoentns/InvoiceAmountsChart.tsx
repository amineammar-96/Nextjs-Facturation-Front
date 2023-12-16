"use client";
import React, { useEffect, useRef ,useState } from 'react';
import axios from "axios";

import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

// Register the required controllers
Chart.register(...registerables);

export default function InvoiceAmountsChart({ startDate, endDate } :any) {
  const urlApi = "https://api.facturation.editeur-dentaire.fr/api";
  const [statistics, setStatistics] = useState<any[]>([]);
  const [monthsArray, setMonthArray] = useState<any[]>([]);
  const [yearsArray, setYearArray] = useState<any[]>([]);
  const [monthsAndYearsArray, setMonthsAndYearsArray] = useState<any[]>([]);
  const [statisticsTva, setStatisticsTva] = useState<any[]>([]);


  useEffect(() => {
    let statsArraAux:any = [];
    let monthYearArrayAux:any = [];
    let monthYearsAux:any = [];
    let statisticsTvaAux:any = [];
    const formData = new FormData();

    if(startDate && endDate){

    
    formData.append('startDate' , startDate);
    formData.append('endDate' , endDate);

      const options = {
        method: 'post',
        url: `${urlApi}/statistics_invoices_amounts`,
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

    axios(options)
    .then((response) => {
        response.data.stats.forEach((element:any) => {
            statsArraAux.push(element);
            monthYearArrayAux.push(element.date);
            statisticsTvaAux.push(element.tva);

        });
        setStatistics(statsArraAux);
        // setMonthArray(monthYearArrayAux);
        setStatisticsTva(monthYearsAux);
    })
    .catch((error) => console.log(error));
  }
}, [startDate,endDate]);

useEffect(() => {
    let arrayAux:any = [];
    monthsArray.forEach((element,index) => {
        arrayAux.push(element+'-'+yearsArray[index])
    });
    setMonthsAndYearsArray(arrayAux);
    // console.log('arrayAux :' , arrayAux);
},[statistics , yearsArray ,setStatisticsTva ,monthsArray]);





const chartData = {
  labels: statistics.map((item) => item.date),
  datasets: [
    {
      label: 'Montant Total TTC',
      data: statistics.map((item) => item.amount),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      // yAxisID: 'y-axis-ttc',
    },
    {
      label: 'Montant TVA',
      data: statistics.map((item) => item.tva),
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(0, 0, 2, 0.2)',
      // yAxisID: 'y-axis-tva',
    },
  ],
};


const chartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Montant',
      },
      ticks: {
        callback: function (value :any) {
          return '€' + value; // Add the Euro symbol to the y-axis tick values
        },
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context : any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label +=  context.parsed.y.toFixed(2) + ' €'; // Add the Euro symbol to the tooltip label
          }
          return label;
        },
      },
    },
  },
};






return (
  <>
    <Line data={chartData} className='canvaDiv2'  options={chartOptions} />
  </>
);
}
