import React, { useEffect } from 'react'
import { Line } from 'react-chartjs-2';


const MolliePaymentsChart = ({ payments }: any) => {
  
  

    const monthlyPayments = payments.reduce((acc: any, payment: any) => {
        if (payment.details && (payment.status=="paid" || payment.status=="open" )) {
            const date = new Date(payment.createdAt ?? '');
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0'); 
        
        
            const yearMonthDay = `${day}-${month}`;
        
            if (isNaN(date.getTime())) {
              return acc;
            }
        
        
            if (!acc[yearMonthDay]) {
              acc[yearMonthDay] = 0;
            }
        
            acc[yearMonthDay] += parseFloat(payment.amount.value);

          }
        
          return acc;
      }, {});


    const labels = Object.keys(monthlyPayments);

   
    let amounts = Object.values(monthlyPayments);

   
    const chartData = {
        labels: labels.reverse(),
        datasets: [
            {
                label: 'Mollie Paiement',
                data: amounts.reverse(),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
            <Line data={chartData} className='canvaDiv2' options={chartOptions} />
    );
};

export default MolliePaymentsChart;