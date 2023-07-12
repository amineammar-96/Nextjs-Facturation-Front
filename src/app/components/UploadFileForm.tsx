"use client";
import React, { useState, useEffect } from "react";
import TopImg from "../../../public/assets/top.svg";
import LoadingComponent from "./layoutComponents/Loaders/LoadingComponent";
import Image from "next/image";
import "../../styles/UploadFileFormStyle.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import axios from "axios";

import cookies from "../../cookies";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/router";
import { addMonths, subMonths, format } from "date-fns";

import { fr } from "date-fns/locale";
import { registerLocale, setDefaultLocale } from "react-datepicker";

export default function UploadFileForm() {
  const [loading, setLoading] = useState(false);
  const [invoicesCount, setInvoicesCount] = useState(0);
  const [invoicesGeneratedCount, setInvoicesGeneratedCount] = useState(50);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileFormData, setFileFormData] = useState(new FormData());

  const [progress, setProgress] = useState(0);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  let formDataFileCsv = new FormData();

  const urlApi = "https://api.confident-darwin.212-227-197-242.plesk.page/api"


  useEffect(() => {
    registerLocale("fr", fr);
    setDefaultLocale("fr");

     }, []);

     useEffect(() => {
      const currentDate = new Date();
    const threeMonthsBefore = subMonths(currentDate, 3);
    const threeMonthsAfter = addMonths(currentDate, 3);

    setStartDate(threeMonthsBefore);
    setEndDate(threeMonthsAfter);
    }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (loading) {
        try {
          const response = await axios.get(
            urlApi + "/invoices_progress",
            {
              withCredentials: true,
              headers: {
                Cookie: `${cookies.get("invoice_generation_progress")}`,
              },
            }
          );
          const progressAux = response.data;
          setProgress(progressAux);
        } catch (error) {
          console.log("Error:", error);
        }
      }
    };

    const interval = setInterval(fetchProgress, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setUploadedFile(file);
  };

  const genratorFormSubmit = (event: any) => {
    event.preventDefault();
    if (uploadedFile == null) {
      Swal.fire({
        icon: "error",
        title: "Veuillez importer un fichier",
        html: "Merci pour votre compréhension",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    } else if (startDate == null) {
      Swal.fire({
        icon: "error",
        title: "Veuillez sélectionner une date de debut.",
        html: "Merci pour votre compréhension",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    } else if (endDate == null) {
      Swal.fire({
        icon: "error",
        title: "Veuillez sélectionner une date de fin.",
        html: "Merci pour votre compréhension",
        confirmButtonColor: "black",
        confirmButtonText: "D'accord",
      });
    } else {
      setLoading(true);
      const url = urlApi + "/invoices_generate";
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      formDataFileCsv.append("file", uploadedFile);

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      console.log(formDataFileCsv, " hahahah ");
      let req = {
        file: uploadedFile,
        start: start,
        end: end,
      };

      axios
        .post(url, req, {
          ...config,
          // responseType: "blob",
        })
        .then((response) => {

          const url = window.URL.createObjectURL(new Blob([response.data.pdfResponse]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "facturation-saps.zip");
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(url);
          setLoading(false);
          setUploadedFile(null);

          console.log('response.data.invoicesToGenerate : '  , response.data.invoicesToGenerate);

          Swal.fire({
            icon: "success",
            html:
            "Félicitations ! Le processus de génération du fichier ZIP des factures est terminé avec succès. <br><br> "+response.data["invoicesToGenerate"] + " factures ont été générées" ,
            confirmButtonColor: "black",
            confirmButtonText: "D'accord",
          });

          // setTimeout(() => {
          //   window.location.reload();

          // }, 2000)





        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            html:
            "Aucune facture n'a été détectée ou des doublons.",
            confirmButtonColor: "black",
            confirmButtonText: "D'accord",
          });
          setLoading(false);
          setUploadedFile(null);
          console.error("error: ", error);
        });
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleStartDateChange = (date: any) => {
    setStartDate(date);
    if (date) {
      formDataFileCsv.append("start", date.toISOString());
      console.log(formDataFileCsv, " yyyyyy ");
    }
  };

  const handleEndDateChange = (date: any) => {
    setEndDate(date);
    if (date) {
      formDataFileCsv.append("end", date.toISOString());
      console.log(formDataFileCsv, " xxxxxxxxx ");
    }
  };

  const formatDateFunction = (date: any) => {
    return format(date, "dd/MM/yyyy");
  };


  return (
    <>
        <div className="topDiv">
          <div className="leftTopDiv">
            {/* <h1
            
            className="headerTitle">
           
           
            
              
              Rapide et efficace, importez un fichier CSV et obtenez vos factures en un temps record.          </h1> */}
            {!loading && (
              <div className=" mb-5 formCard">
                <form className="formTag" action="">
                  <div className="form-group">
                    <label htmlFor="csvFile">
                      Télécharger un fichier CSV ici
                    </label>
                    <input
                      accept=".csv"
                      type="file"
                      name=""
                      id=""
                      className="form-control"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="pickerBox">
                    <div className="datePickerDiv">
                      <div className="form-group">
                        <label>A partir du:</label>
                        <DatePicker
                          selected={startDate}
                          placeholderText="JJ/MM/AAAA"
                          onChange={handleStartDateChange}
                          dateFormat="dd/MM/yyyy"
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Jusqu'au:</label>
                        <DatePicker
                          selected={endDate}
                          onChange={handleEndDateChange}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          minDate={startDate}
                          className="form-control"
                          placeholderText="JJ/MM/AAAA"
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="btnDiv pb-3">
                    <button onClick={genratorFormSubmit} className="btn">
                      Générer
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && (
              <LoadingComponent
                textChildren={`${progress} sur ${invoicesGeneratedCount} `}
              />
            )}
          </div>
          
        </div>
    </>
  );
}
