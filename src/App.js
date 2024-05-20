import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Filler, BarController, BarElement, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);


const DashboardDatosMeteorológicos = () => {
  const [data, setData] = useState(null);
  const [filtroParajes, setFiltroParajes] = useState('');
  const [parajesFiltrados, setParajesFiltrados] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(''); 
  const [meses, setMeses] = useState([]); 
  const [graficoData, setGraficoData] = useState(null);
  const [graficoDataTMAXMIN, setgraficoDataTMAXMIN] = useState(null);
  const [graficoDataPREC, setGraficoDataPREC] = useState(null);
  const [graficoDataHUM, setGraficoDataHUM] = useState(null);
  const [graficoDataVV, setGraficoDataVV] = useState(null);
  const [graficoDataRS, setGraficoDataRS] = useState(null);
  const [mediaTemperaturaMedia, setMediaTemperaturaMedia] = useState(0);
  const [mediaTemperaturaMax, setMediaTemperaturaMax] = useState(0);
  const [mediaTemperaturaMin, setMediaTemperaturaMin] = useState(0);
  const [mediaHumedadMax, setMediaHumedadMax] = useState(0);
  const [mediaHumedadMin, setMediaHumedadMin] = useState(0);
  const [sumaPrecipitaciones, setSumaPrecipitaciones] = useState(0);
  const [mediaRadiacionSolar, setMediaRadiacionSolar] = useState(0);
  const [mediaVVMax, setMediaVVMax] = useState(0);
  const [mediaVVMed, setMediaVVMed] = useState(0);
  


  useEffect(() => {
    axios.get('./datos_pronostico.csv')
      .then(response => {
        const parsedData = Papa.parse(response.data, { header: true, dynamicTyping: true }).data;
        setData(parsedData);
      });
  }, []);

  useEffect(() => {
    if (data) {
      const parajesSet = new Set();
      const mesesSet = new Set();
      data.forEach(registro => {
        const paraje = registro['PARAJE'];
        const mes = registro['MES'];
        parajesSet.add(paraje);
        mesesSet.add(mes);
      });
      setParajesFiltrados(Array.from(parajesSet));
      setMeses(Array.from(mesesSet));
    }
  }, [data]);

  useEffect(() => {
    if (data && mesSeleccionado && filtroParajes) {
      const filteredData = data.filter(registro => registro['PARAJE'] === filtroParajes && registro['MES'] === mesSeleccionado);
      
      const fechas = filteredData.map(registro => registro['FECHA']);
      const tmed = filteredData.map(registro => registro['TMED']);
      const tmin = filteredData.map(registro => registro['TMIN']);
      const tmax = filteredData.map(registro => registro['TMAX']);
      const prec = filteredData.map(registro => registro['PREC']);
      const hmax = filteredData.map(registro => registro['HRMAX']);
      const hmin = filteredData.map(registro => registro['HRMIN']);
      const vvmed = filteredData.map(registro => registro['VVMED']);
      const vvmax = filteredData.map(registro => registro['VVMAX']);
      const radmed = filteredData.map(registro => registro['RADMED']);

      const mediaTMed = tmed.length > 0 ? tmed.reduce((sum, curr) => sum + curr, 0) / tmed.length : 0;
      const mediaTMax = tmax.length > 0 ? tmax.reduce((sum, curr) => sum + curr, 0) / tmax.length : 0;
      const mediaTMin = tmin.length > 0 ? tmin.reduce((sum, curr) => sum + curr, 0) / tmin.length : 0;
      const mediaHMax = hmax.length > 0 ? hmax.reduce((sum, curr) => sum + curr, 0) / hmax.length : 0;
      const mediaHMin = hmin.length > 0 ? hmin.reduce((sum, curr) => sum + curr, 0) / hmin.length : 0;
      const sumaPrecipitaciones = prec.reduce((sum, curr) => sum + curr, 0);
      const mediaRadiacionSolar = radmed.length > 0 ? radmed.reduce((sum, curr) => sum + curr, 0) / radmed.length : 0;
      const mediaVVMax = vvmax.length > 0 ? vvmax.reduce((sum, curr) => sum + curr, 0) / vvmax.length : 0;
      const mediaVVMed = vvmed.length > 0 ? vvmed.reduce((sum, curr) => sum + curr, 0) / vvmed.length : 0;
  

      setGraficoDataRS({
        labels: fechas,
        datasets: [
          {
           label: 'Radiación Solar Media W/m2',
           data: radmed,
           backgroundColor: 'rgba(255, 0, 0, 0.2)',
           borderColor: 'rgba(255, 0, 0, 1)', 
           borderWidth: 1
          },
        ],
      });

      setMediaRadiacionSolar(mediaRadiacionSolar);

      
      setGraficoDataVV({
        labels: fechas,
        datasets: [
          {
            label: 'Velocidad de Viento Máxima m/s',
            data: vvmax,
            fill: false,
            borderColor: 'rgb(0, 0, 255)',
            tension: 0.1
          },
          {
            label: 'Velocidad de Viento Media m/s',
            data: vvmed,
            fill: false,
            borderColor: 'rgb(85, 85, 85)',
            tension: 0.1
          },
        ],
     });

     setMediaVVMax(mediaVVMax);
     setMediaVVMed(mediaVVMed);

     
      setGraficoDataHUM({
         labels: fechas,
         datasets: [
           {
             label: 'Humedad Relativa Máxima %',
             data: hmax,
             fill: false,
             borderColor: 'rgb(0, 0, 255)',
             tension: 0.1
           },
           {
             label: 'Humedad Relativa Mínima %',
             data: hmin,
             fill: false,
             borderColor: 'rgb(255, 140, 0)',
             tension: 0.1
           },
         ],
      });

      setMediaHumedadMax(mediaHMax);

      setMediaHumedadMin(mediaHMin);
     
    
      setGraficoDataPREC({
        labels: fechas,
        datasets: [
          {
           label: 'Precipitaciones',
           data: prec,
           backgroundColor: 'rgba(75, 192, 192, 0.2)',
           borderColor: 'rgba(75, 192, 192, 1)',
           borderWidth: 1
          },
        ],
      });

      setSumaPrecipitaciones(sumaPrecipitaciones);


      setGraficoData({
        labels: fechas,
        datasets: [
          {
            label: 'Temperatura Media',
            data: tmed,
            backgroundColor: 'rgba(75, 192, 192)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          },
        ],
      });

      setMediaTemperaturaMedia(mediaTMed);


      setgraficoDataTMAXMIN({
        labels: fechas,
        datasets: [
          {
            label: 'Temperatura Máxima',
            data: tmax,
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Temperatura Mínima',
            data: tmin,
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          },
        ],
      });

      setMediaTemperaturaMax(mediaTMax);

      setMediaTemperaturaMin(mediaTMin);

    }
  }, [data, mesSeleccionado, filtroParajes]);

  useEffect(() => {
    console.log(graficoData);
  }, [graficoData]);

  const handleChangeFiltroParajes = (event) => {
    setFiltroParajes(event.target.value);
  };

  const handleChangeMes = (event) => {
    setMesSeleccionado(event.target.value);
  };



  return (
    <div style={{
      backgroundImage: 'none',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Poppins'
    }}>
      <h2 style={{ border: '1px solid grey',  textAlign: 'center' , padding: '10px', marginTop: '20px', borderRadius: '10px', backgroundColor: '#0174DF', color: '#ffffff', marginLeft: '60px', marginRight: '60px'}}>DASHBOARD DE DATOS MEDIOAMBIENTALES - PRONÓSTICO AÑO 2025</h2>
      <p style={{ border: '1px solid black', padding: '10px', marginTop: '20px', borderRadius: '10px', backgroundColor: '#ffffff', textAlign: 'justify', marginLeft: '60px', marginRight: '60px'}}>
        - Este dashboard interactivo presenta una visualización detallada de los datos meteorológicos pronosticados para el año 2025, 
        ofreciendo insights valiosos para la planificación y gestión agrícola en diferentes parajes de la Región de Murcia. <br /><br />
        - El proceso comienza con la recopilación de datos históricos (2010-2020) y su posterior análisis mediante técnicas estadísticas, 
        ayudando a entender las tendencias y variabilidades climáticas, permitiéndonos generar predicciones futuras con mayor precisión. <br /><br />
        - El resultado de este procesamiento es un archivo csv, que se puede ver en la pestaña "Datos del Pronóstico", 
        con las predicciones de los datos meteorológicos para el año natural 2025. Mostrando estimaciones detalladas de diferentes variables meteorológicas como temperatura, 
        precipitaciones, humedad relativa, velocidad del viento y radiación solar.
      </p>      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ border: '1px solid grey', padding: '20px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
          <h2>Seleccione Paraje: <abbr title="En esta pestaña desplegable se encuentran todos los Parajes Naturales de la Región de Murcia.">*</abbr></h2>
          <div>
            <label htmlFor="parajes">Paraje: </label>
            <select id="parajes" value={filtroParajes} onChange={handleChangeFiltroParajes}>
              <option value=""></option>
              {parajesFiltrados.map((paraje, index) => (
                <option key={index} value={paraje}>{paraje}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ border: '1px solid grey', padding: '20px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff', marginLeft: '200px'}}>
          <h2>Seleccione Mes:</h2>
          <div>
            <label htmlFor="meses">Mes: </label>
            <select id="meses" value={mesSeleccionado} onChange={handleChangeMes}>
              <option value=""></option>
              {meses.map((mes, index) => (
                <option key={index} value={mes}>{mes}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <Tabs style={{ marginTop: '80px', marginLeft: '50px', marginRight: '50px'}}>
        <TabList>
          <Tab>Temperatura</Tab>
          <Tab>Humedad y Precipitaciones</Tab>
          <Tab>Velocidad del Viento</Tab>
          <Tab>Radiación Solar</Tab>
          <Tab>Datos del Pronóstico</Tab> 
        </TabList>

        <TabPanel>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: '1 1 800px', maxWidth: '100%', padding: '10px', boxSizing: 'border-box', marginRight: '25px' }}>
              <h2>Gráfico de Temperatura Media:</h2>
              {graficoData && (
                <Bar
                  data={graficoData}
                  options={{
                    plugins: {
                      tooltip: {
                        enabled: true,
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            label += Math.round(context.parsed.y * 100) / 100;
                            return label;
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Fecha',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Temperatura Media (ºC)',
                        },
                      },
                    },
                  }}
                />
              )}
              <p style={{ border: '1px solid black', padding: '10px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                Gráfico de Temperatura Media: Gráfico de barras que muestra la temperaturas media registrada diariamente en un paraje específico. Se mide en grados Centígrados.
              </p> 
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de las temperaturas medias pronosticadas para el mes:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: 'rgba(75, 192, 192)', color: '#ffffff'}}>
                  {mediaTemperaturaMedia.toFixed(2)} °C
                </div>
              </div>            
            </div>
            <div style={{ flex: '1 1 800px', maxWidth: '100%', padding: '10px', boxSizing: 'border-box', marginLeft: '25px' }}>
              <h2>Gráfico de Temperaturas Máxima y Mínima:</h2>
              {graficoDataTMAXMIN && (
                <Line
                  data={graficoDataTMAXMIN}
                  options={{
                    plugins: {
                      tooltip: {
                        enabled: true,
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            label += Math.round(context.parsed.y * 100) / 100;
                            return label;
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Fecha',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Temperatura Máxima y Mínima (ºC)',
                        },
                      },
                    },
                  }}
                />
              )}
              <p style={{ border: '1px solid black', padding: '10px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
              Gráfico de Temperatura Máxima y Mínima: Este gráfico lineal muestra las temperaturas máxima y mínima registradas diariamente en un paraje específico. Se mide en grados Centígrados.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de las temperaturas máximas pronosticadas para el mes:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: '#DF0101', color: '#ffffff'}}>
                  {mediaTemperaturaMax.toFixed(2)} °C
                </div>
              </div> 
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de las temperaturas mínimas pronosticadas para el mes:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: '#0174DF', color: '#ffffff'}}>
                  {mediaTemperaturaMin.toFixed(2)} °C
                </div>
              </div>               
            </div>
          </div>
        </TabPanel>


        <TabPanel>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: '1 1 800px', maxWidth: '100%', padding: '10px', boxSizing: 'border-box', marginRight: '25px' }}>
              <h2>Gráfico de Humedad Relativa Máxima y Mínima:</h2>
              {graficoDataHUM && (
                <Line
                  data={graficoDataHUM}
                  options={{
                    plugins: {
                      tooltip: {
                        enabled: true,
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            label += Math.round(context.parsed.y * 100) / 100;
                            return label;
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Fecha',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Humedad Relativa Máxima y Mínima (%)',
                        },
                      },
                    },
                  }}
                />
              )}
              <p style={{ border: '1px solid black', padding: '10px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                Gráfico de Humedad Relativa: Gráfico lineal que muestra la humedad relativa máxima y mínima a lo largo del mes. Se mide en porcentaje.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de la humedad relativa máxima pronosticada para el mes:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: '#0174DF', color: '#ffffff'}}>
                  {mediaHumedadMax.toFixed(2)} %
                </div>
              </div> 
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de la humedad relativa mínima pronosticada para el mes:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: '#DF0101', color: '#ffffff'}}>
                  {mediaHumedadMin.toFixed(2)} %
                </div>
              </div>
            </div>
            <div style={{ flex: '1 1 800px', maxWidth: '100%', padding: '10px', boxSizing: 'border-box', marginLeft: '25px' }}>
              <h2>Gráfico de Precipitaciones:</h2>
              {graficoDataPREC && (
                <Bar
                  data={graficoDataPREC}
                  options={{
                    plugins: {
                      tooltip: {
                        enabled: true,
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            label += Math.round(context.parsed.y * 100) / 100;
                            return label;
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Fecha',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Precipitaciones (mm)',
                        },
                      },
                    },
                  }}
                />
              )}
              <p style={{ border: '1px solid black', padding: '10px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                Gráfico de Precipitaciones Mensuales: Gráfico de barras que ilustra la cantidad de precipitación recibida cada mes. Se mide en milímetros.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Suma total de las precipitaciones pronosticadas para el mes seleccionado:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: 'rgba(75, 192, 192)', color: '#ffffff'}}>
                  {sumaPrecipitaciones.toFixed(2)} mm
                </div>
              </div>            
            </div>
          </div>
        </TabPanel>


        <TabPanel>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ height: '400px', width: '800px' }}>
              <h2>Gráfico de Velocidad del Viento Media y Máxima:</h2>
              {graficoDataVV && (
                <Line
                  data={graficoDataVV}
                  options={{
                    plugins: {
                      tooltip: {
                        enabled: true,
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            label += Math.round(context.parsed.y * 100) / 100;
                            return label;
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Fecha',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Velocidad del Viento (m/s)',
                        },
                      },
                    },
                  }}
                />
              )}
              <p style={{ border: '1px solid black', padding: '10px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                Gráfico de Velocidad del Viento: Gráfico de líneas que muestra la velocidad del viento media y la máxima para cada día del mes. Se mide en metros por segundo.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                 Media de la velocidad del viento máxima del mes seleccionado:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: '#0174DF', color: '#ffffff'}}>
                  {mediaVVMax.toFixed(2)} m/s
                </div>
              </div> 
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de la velocidad del viento media del mes seleccionado:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: 'rgb(85, 85, 85)', color: '#ffffff'}}>
                  {mediaVVMed.toFixed(2)} m/s
                </div>
              </div>               
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ height: '400px', width: '800px' }}>
              <h2>Gráfico de Radiación Solar Media:</h2>
              {graficoDataRS && (
                <Bar
                  data={graficoDataRS}
                  options={{
                    plugins: {
                      tooltip: {
                        enabled: true,
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                              label += Math.round(context.parsed.y * 100) / 100;
                            return label;
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Fecha',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Radiación Solar Media (W/m²)',
                        },
                      },
                    },
                  }}
                />
              )}
               <p style={{ border: '1px solid black', padding: '10px', marginTop: '50px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                Gráfico de Radiación Solar: Gráfico de barras que ilustra la radiación solar recibida cada mes. Se mide en vatios por metro cuadrado.
              </p>             
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px', backgroundColor: '#ffffff'}}>
                  Media de la radiación solar del mes seleccionado:
                </div>
                <div style={{ border: '1px solid black', padding: '10px', borderRadius: '10px',backgroundColor: '#DF0101', color: '#ffffff'}}>
                  {mediaRadiacionSolar.toFixed(2)} W/m²
                </div>
              </div>            
            </div>
          </div>
        </TabPanel>

        <TabPanel> 
          <h2>Datos del Pronóstico:</h2>
          <p>
            (Mostrando 100 registros del Dataset total)
          </p> 
          <table style={{ width: '100%', border: '1px solid black' }}>
            <thead>
              <tr>
                <th>Paraje</th>
                <th>Fecha</th>
                <th>Temperatura Media (°C)</th>
                <th>Temperatura Máxima (°C)</th>
                <th>Temperatura Mínima (°C)</th>
                <th>Precipitaciones (mm)</th>
                <th>Humedad Relativa Máxima (%)</th>
                <th>Humedad Relativa Mínima (%)</th>
                <th>Velocidad del Viento Media (m/s)</th>
                <th>Velocidad del Viento Máxima (m/s)</th>
                <th>Radiación Solar Media (W/m²)</th>
              </tr>
            </thead>
            <tbody>
              {data && data.slice(0, 100).map((item, index) => (
                <tr key={index}>
                  
                  <td>{item.PARAJE}</td>
                  <td>{item.FECHA}</td>
                  <td>{item.TMED}</td>
                  <td>{item.TMAX}</td>
                  <td>{item.TMIN}</td>
                  <td>{item.PREC}</td>
                  <td>{item.HRMAX}</td>
                  <td>{item.HRMIN}</td>
                  <td>{item.VVMED}</td>
                  <td>{item.VVMAX}</td>
                  <td>{item.RADMED}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabPanel>
      </Tabs>
      <label style={{ textAlign: 'center', display: 'block', marginTop: '350px' }}>
        TFG: Desarrollo de un Dashboard para la monitorización de datos ambientales de grandes cultivos - Autor: Carlos Martín Hernández <br />-
      </label>
    </div>
  );
};

export default DashboardDatosMeteorológicos;