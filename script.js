const threatChartCanvas = document.getElementById('threatChart').getContext('2d');
const recoveryChartCanvas = document.getElementById('recoveryChart').getContext('2d');
let threatChart, recoveryChart;

function renderIncidentLog() {
  const tableBody = document.getElementById("incidentTableBody");
  tableBody.innerHTML = "";
  sampleIncidents.forEach(incident => {
    const row = document.createElement("tr");

    const severityColor = {
      Critical: "#dc3545",
      High: "#fd7e14",
      Medium: "#ffc107",
      Low: "#28a745"
    };

    row.innerHTML = `
      <td>${incident.time}</td>
      <td>${incident.type}</td>
      <td>${incident.status}</td>
      <td style="color: ${severityColor[incident.severity]}">${incident.severity}</td>
    `;
    tableBody.appendChild(row);
  });
}


function startAlertTicker() {
  const alertFeed = document.getElementById("alertTicker");
  alertFeed.innerHTML = `<span>${sampleAlerts.join(" • ")}</span>`;
}

function fetchWeatherData(city = "Lagos") {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "block";

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(res => res.json())
    .then(locData => {
      if (!locData.results || locData.results.length === 0) throw new Error("City not found");

      const { latitude, longitude } = locData.results[0];
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,relative_humidity_2m&forecast_days=1&timezone=auto`);
    })
    .then(res => res.json())
    .then(data => {
      spinner.style.display = "none";
      const temps = data.hourly.temperature_2m.slice(0, 7);
      const humidity = data.hourly.relative_humidity_2m.slice(0, 7);
      const rain = data.hourly.precipitation_probability[0];

      // Destroy previous charts if they exist
      if (threatChart) threatChart.destroy();
      if (recoveryChart) recoveryChart.destroy();

      // Bar chart = temperature
      threatChart = new Chart(threatChartCanvas, {
        type: 'bar',
        data: {
          labels: ['1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM'],
          datasets: [{
            label: 'Temperature °C',
            data: temps,
            backgroundColor: '#dc3545',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      // Line chart = humidity
      recoveryChart = new Chart(recoveryChartCanvas, {
        type: 'line',
        data: {
          labels: ['1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM'],
          datasets: [{
            label: 'Humidity %',
            data: humidity,
            backgroundColor: 'rgba(40,167,69,0.2)',
            borderColor: '#28a745',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      // Update cards
      document.querySelectorAll('.card')[0].querySelector('p').textContent = `✅ ${Math.floor(100 - rain)}% Backups OK`;
      document.querySelectorAll('.card')[1].querySelector('p').textContent = `🔴 ${rain}% Rain Chance`;
      document.querySelectorAll('.card')[2].querySelector('p').textContent = `🕒 ${temps[0]}°C`;

      renderIncidentLog();
startAlertTicker();

    })
    .catch(err => {
      spinner.style.display = "none";
      alert("Error: " + err.message);
    });
}

// Load initial data for Lagos
fetchWeatherData();

// Refresh button
document.getElementById("refreshBtn").addEventListener("click", () => {
  const city = document.getElementById("locationInput").value || "Lagos";
  fetchWeatherData(city);
});

const sampleIncidents = [
  { time: "02:45 AM", type: "Phishing Attempt", status: "Blocked", severity: "High" },
  { time: "04:12 AM", type: "Malware Upload", status: "Quarantined", severity: "Critical" },
  { time: "06:30 AM", type: "Unauthorized Login", status: "Failed", severity: "Medium" },
  { time: "09:50 AM", type: "DDoS Attack", status: "Mitigated", severity: "Critical" },
  { time: "12:15 PM", type: "Suspicious Download", status: "Flagged", severity: "Low" }
];


const sampleAlerts = [
  "🚨 New phishing link detected in email inbox.",
  "⚠️ 42 failed login attempts from IP 196.33.49.2",
  "🛡️ Real-time firewall rule update completed.",
  "🔒 Backup system validated at 94% success rate.",
  "🌐 3 suspicious connections blocked by firewall."
];

