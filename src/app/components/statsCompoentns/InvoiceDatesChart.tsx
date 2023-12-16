"use client";
import React, { useEffect, useRef ,useState } from 'react';
import axios from "axios";

import { Chart, registerables } from 'chart.js';

// Register the required controllers
Chart.register(...registerables);

export default function InvoiceDatesChart({ startDate, endDate } :any) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
    const urlApi = "https://api.facturation.editeur-dentaire.fr/api";
    const [statistics, setStatistics] = useState<any[]>([]);
  const data = [10, 15, 8, 12, 6, 18, 14, 9, 13, 11, 7, 16];
  const chartInstanceRef = useRef<Chart | null>(null); // Reference to the Chart instance
  const [monthsArray, setMonthArray] = useState<any[]>([]);
  const [yearsArray, setYearArray] = useState<any[]>([]);
  const [monthsAndYearsArray, setMonthsAndYearsArray] = useState<any[]>([]);


  useEffect(() => {
    let statsArraAux:any = [];
    let monthYearArrayAux:any = [];
    let monthYearsAux:any = [];

    const formData = new FormData();
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

    if(startDate && endDate ){
    axios(options)
    .then((response) => {
        response.data.stats.forEach((element:any) => {
            statsArraAux.push(element.count);
          console.log('eeemelelele : ' , element);
            monthYearArrayAux.push(element.date);
            monthYearsAux.push(element.dateAux);
            
        });
        setStatistics(statsArraAux);
        setMonthArray(monthYearArrayAux);
        setYearArray(monthYearsAux);
    })
    .catch((error) => console.log(error));
  }
}, [startDate,endDate]);

useEffect(() => {
    let arrayAux:any = [];
    monthsArray.forEach((element,index) => {
        arrayAux.push(element)
    });
    setMonthsAndYearsArray(arrayAux);
    console.log('statisticsstatisticsstatistics :' , statistics);
},[statistics , yearsArray , monthsArray]);




useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy(); // Destroy the previous Chart instance if it exists
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthsAndYearsArray,
            datasets: [
              {
                label: 'Nombre de factures traitées par mois',
                data: statistics,
                backgroundColor: '#69bdf5',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      }
    }
  }, [data , statistics]);

  return <canvas className='generationPfdStatsChart' ref={chartRef}></canvas>;
}
