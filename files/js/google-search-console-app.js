const CLIENT_ID = '999088568153-mrmsgkpghoi36pqfh3hp5n4mkd59ur53.apps.googleusercontent.com'
const naam = document.getElementById('naam');
const login_info = document.getElementById('login-info');
const login_button = document.getElementById('login-button');
const login_header = document.getElementById('login-header');
let access_token
let aantal_properties
let allData = [];
let dimensions = [];

// Datum selecties
var today = new Date();
var beginDate = new Date(today.getFullYear(), today.getMonth() - 16, today.getDate());
var beginDateString = beginDate.toISOString().split("T")[0];
document.getElementById("start-date").setAttribute("min", beginDateString);

var yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
var yesterdayString = yesterday.toISOString().split("T")[0];
document.getElementById("end-date").setAttribute("max", yesterdayString);

async function initClient() {
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly openid profile email',
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token;
      localStorage.setItem('access_token', access_token);
      listSites();
    },
  });
  client.requestAccessToken();
}

async function getUserInfo() {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    updateInformation(data);
  }
}

async function listSites() {
  const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const siteEntries = data.siteEntry;
    aantal_properties = siteEntries.length;
    getUserInfo();

    var select = document.getElementById('all-sites');
    select.innerHTML = '';

    var standardOption = document.createElement('option');
    standardOption.value = '';
    standardOption.text = 'Selecteer het property';
    standardOption.selected = true;
    select.appendChild(standardOption);

    siteEntries.forEach((siteEntry) => {
      var option = document.createElement('option');
      option.value = siteEntry.siteUrl;
      option.text = siteEntry.siteUrl;
      select.appendChild(option);
    });

    var options = select.getElementsByTagName('option');
    var originalOptions = [...options];

    var searchInput = document.getElementById('searchproperty');
    searchInput.addEventListener('input', function () {
      var filter = searchInput.value.toLowerCase();

      select.innerHTML = '';

      var matchedOptions = originalOptions.filter(function (option) {
        return option.text.toLowerCase().indexOf(filter) > -1;
      });

      matchedOptions.forEach(function (option) {
        select.appendChild(option);
      });

      select.selectedIndex = 0;
    });
  } else {
    const errorData = await response.json();
    window.alert('Error: ' + errorData.error.message + ' . Neem contact op met de developer!');
  }
}

async function getData() {
  allData = [];
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const siteUrl = encodeURIComponent(document.getElementById('all-sites').value);

  const maxRows = 25000;
  let startRow = 0;
  let totalRows = 0;
  let data;
  const statusElement = document.querySelector('.status');
  statusElement.innerHTML = '';
  statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>De tool begint met het ophalen van de data...</p></div>`);

  do {
    dimensions = [];
    const filter_type_value = document.getElementById("filter-type").value;
    const filter_match_value = document.getElementById("filter-match").value;
    const filter_value = document.getElementById("filter").value;
    const paginaCheckbox = document.getElementById("dimensie-pagina");
    const zoekwoordCheckbox = document.getElementById("dimensie-zoekwoord");
    const apparaatCheckbox = document.getElementById("dimensie-apparaat");

    const type_results = document.getElementById("type-results").value;

    if (paginaCheckbox.checked) {
      dimensions.push("PAGE");
    }
    if (zoekwoordCheckbox.checked) {
      dimensions.push("QUERY");
    }
    if (apparaatCheckbox.checked) {
      dimensions.push("DEVICE");
    }
    if (filter_type_value !== 'Filter Type') {
      var requestBody = {
        startDate: startDate,
        endDate: endDate,
        dimensions: dimensions,
        dimensionFilterGroups: [{
          "filters": [{
            "dimension": filter_type_value,
            "operator": filter_match_value,
            "expression": filter_value
          }]
        }],
        type: type_results,
        rowLimit: maxRows,
        startRow: startRow
      };
    } else {
      var requestBody = {
        startDate: startDate,
        endDate: endDate,
        dimensions: dimensions,
        type: type_results,
        rowLimit: maxRows,
        startRow: startRow
      };
    }
    
    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      data = await response.json();
      const rows = data.rows;
      allData.push(rows);
      totalRows += rows.length;
    } else {
      const errorData = await response.json();
      window.alert('Error: ' + errorData.error.message + ' . Neem contact op met de developer!');
      break;
    }
    startRow += maxRows;
    statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>De tool heeft al ${totalRows} rijen voor je opgehaald.</p></div>`);
  } while (data.rows.length === maxRows);

  statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>De tool is <b>klaar</b>! In totaal zijn er ${totalRows} rijen opgehaald.</p></div>`);
  downloadExcelFile(allData);
}

function formatDataForExcel() {
  const formattedData = [];
  console.log(allData);
  allData.forEach((data) => {
    const formattedArray = data.map((row) => {
      const formattedRow = {};

      if (dimensions.includes("PAGE")) {
        formattedRow.Pagina = dimensions.includes("PAGE") ? row.keys[0] : "";
      }

      if (dimensions.includes("QUERY") && !dimensions.includes("PAGE")) {
        formattedRow.Zoekwoord = row.keys[0];
      } else if (dimensions.includes("QUERY")) {
        formattedRow.Zoekwoord = row.keys[1];
      }

      if (dimensions.includes("DEVICE")) {
        formattedRow.Device = dimensions.includes("DEVICE") ? (row.keys.length === 3 ? row.keys[2] : row.keys.length === 2 ? row.keys[1] : row.keys.length === 1 ? row.keys[0] : "") : "";
      }

      formattedRow.Klikken = row.clicks;
      formattedRow.Impressies = row.impressions;
      formattedRow.CTR = (row.ctr * 100).toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
      if (formattedRow.Positie) {
        formattedRow.Positie = row.position.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
      }

      return formattedRow;
    });

    formattedData.push(...formattedArray);
  });

  return formattedData;
}

function downloadExcelFile() {
  const formattedData = formatDataForExcel();

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'google-search-console-data.xlsx';
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function updateInformation(data) {
  naam.innerHTML = 'Hi ' + data.name + '!';
  login_info.innerHTML = `Met ${data.email} heb je toegang tot ${aantal_properties} properties. Van welke wil je data ophalen? Zoek een property of selecteer handmatig.`;
  login_button.style = "display:none";
  login_header.style = "display:none";
}