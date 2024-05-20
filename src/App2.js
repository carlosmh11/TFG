import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement);

const DashboardDatosMeteorológicos = () => {
  const [data, setData] = useState(null);
  const [parajeSeleccionado, setParajeSeleccionado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('01/01/20');
  const [fechaFin, setFechaFin] = useState(null);
  const [precipitacionesPorDia, setPrecipitacionesPorDia] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/datos_pronostico.csv');
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      const parsedData = Papa.parse(csv, { header: true });
      setData(parsedData.data);
    };

    fetchData();
  }, []);

  const handleChangeParaje = (event) => {
    setParajeSeleccionado(event.target.value);
  };

  const handleChangeFechaInicio = (event) => {
    setFechaInicio(event.target.value);
  };

  const handleChangeFechaFin = (event) => {
    setFechaFin(event.target.value);
  };

  const getListaParajes = () => {
    if (!data) return [];

    const parajes = new Set();
    data.forEach((registro) => parajes.add(registro.PARAJE));
    return Array.from(parajes);
  };

  const parseFecha = (fechaStr) => {
    if (fechaStr) {
      const [day, month, year] = fechaStr.split('/');
      return new Date(year, month - 1, day);
    } else {
      return null;
    }
  };

  const getPrecipitacionesPorDia = () => {
    const newPrecipitacionesPorDia = {};
  
    if (data && parajeSeleccionado && fechaInicio && fechaFin) {
      data
        .filter((registro) => {
          const fecha = parseFecha(registro.FECHA);
          const fechaInicioParsed = parseFecha(fechaInicio);
          const fechaFinParsed = parseFecha(fechaFin);
          return registro.PARAJE === parajeSeleccionado && fecha >= fechaInicioParsed && fecha <= fechaFinParsed;
        })
        .forEach((registro) => {
          const fecha = registro.FECHA;
          const precipitacion = parseFloat(registro.PREC.replace(',', '.'));
  
          if (!newPrecipitacionesPorDia[fecha]) {
            newPrecipitacionesPorDia[fecha] = precipitacion;
          } else {
            newPrecipitacionesPorDia[fecha] += precipitacion;
          }
        });

      setPrecipitacionesPorDia(newPrecipitacionesPorDia);
    }
  };
  
  React.useEffect(() => {
    getPrecipitacionesPorDia();
  }, [data, parajeSeleccionado, fechaInicio, fechaFin]);
  
  const renderGraficoPrecipitaciones = () => {
    const labels = Object.keys(precipitacionesPorDia);
    const data = Object.values(precipitacionesPorDia);
  
    const chartData = {
      labels,
      datasets: [
        {
          label: `Precipitaciones del ${fechaInicio} al ${fechaFin}`,
          backgroundColor: 'rgba(255,99,132,0.4)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.6)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data,
        },
      ],
    };
  
    return (
      <Bar
        data={chartData}
        options={{
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true,
                labelString: 'Precipitaciones (mm)'
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Fecha'
              }
            }]
          }
        }}
      />
    );
  };

  return (
    <div>
      <h2>Seleccionar Paraje:</h2>
      <select value={parajeSeleccionado} onChange={handleChangeParaje}>
        <option value="">Todos</option>
        {getListaParajes().map((paraje, index) => (
          <option key={index} value={paraje}>{paraje}</option>
        ))}
      </select>
      <h2>Seleccionar Rango de Fechas:</h2>
      <label>Fecha de inicio:</label>
      <input type="date" value={fechaInicio} onChange={handleChangeFechaInicio} />
      <label>Fecha final:</label>
      <input type="date" value={fechaFin} onChange={handleChangeFechaFin} />
      <h2>Precipitaciones del {fechaInicio} al {fechaFin}</h2>
      {renderGraficoPrecipitaciones()}
    </div>
  );
};

export default DashboardDatosMeteorológicos;
