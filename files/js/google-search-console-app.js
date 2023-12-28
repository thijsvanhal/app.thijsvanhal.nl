const CLIENT_ID = '999088568153-mrmsgkpghoi36pqfh3hp5n4mkd59ur53.apps.googleusercontent.com'
const naam = document.getElementById('naam');
const login_info = document.getElementById('login-info');
const login_button = document.getElementById('login-button');
const login_header = document.getElementById('login-header');
let access_token
let aantal_properties
let allData = [];
let dimensions = [];

const loginLinkGoogle = document.getElementById("loginLinkAPI");
const welcomeText = document.getElementById("welcomeText");

loginLinkGoogle.onclick = function() {
  initClient();
};

// Datum selecties
let today = new Date();
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
      updateNavbar();
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

    const originalOptions = [...siteEntries];
    console.log(originalOptions);
    const propertyDropdown = document.getElementById('property-dropdown');
    createCustomDropdown(propertyDropdown, 'all-sites', 'searchproperty', originalOptions.map(option => option.siteUrl));
    
  } else {
    const errorData = await response.json();
    window.alert('Error: ' + errorData.error.message + ' . Neem contact op met de developer!');
  }
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('.custom-dropdown')) {
      closeOptions();
  }
});

function closeOptions () {
  const dropdowns = document.querySelectorAll('.custom-dropdown .dropdown-options');
  dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('open');
  });
}

function createCustomDropdown(dropdown, optionsId, searchInputId, data) {
  const dropdownOptions = document.getElementById(optionsId);
  dropdownOptions.innerHTML = '';
  const searchInput = document.getElementById(searchInputId);

  data.forEach(optionText => {
      const option = document.createElement('li');
      option.textContent = optionText;
      option.dataset.value = optionText;
      dropdownOptions.appendChild(option);
  
      option.addEventListener('click', () => {
          document.querySelector(`#${dropdown.id} input`).value = optionText;
          closeOptions();
      });
  });

  // Show/hide dropdown on input focus
  searchInput.addEventListener('focus', () => {
      document.getElementById(searchInputId).value = '';
      const options = document.getElementById(optionsId);
      options.classList.add('open');
      filterOptions(optionsId, '')
  });

  searchInput.addEventListener('input', () => {
    filterOptions(optionsId, searchInput.value.toLowerCase());
  });
}

function filterOptions(optionsId, filter) {
  const options = document.querySelectorAll(`#${optionsId} li[data-value]`);
  options.forEach(option => {
    const optionText = option.dataset.value.toLowerCase();
    if (optionText.includes(filter)) {
      option.style.display = 'block';
    } else {
      option.style.display = 'none';
    }
  });
}

async function getData() {
  allData = [];
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const siteUrl = encodeURIComponent(document.getElementById('searchproperty').value);

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
    if (filter_type_value !== '') {
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
      
      if (row.position) {
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
  loginLinkGoogle.className = "btn btn-primary secondbutton";
  loginLinkGoogle.innerText = "Selecteer een ander Google account";
  document.getElementById("searchproperty").removeAttribute("disabled");
  welcomeText.textContent = "Selecteer een property, " + data.name;
}

document.addEventListener('DOMContentLoaded', function() {
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});

// Datum selecties
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const selecteerPeriode = document.getElementById('selecteer-periode');

const currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 1);

selecteerPeriode.addEventListener('change', function () {
  // Get the selected value from the select element
  const selectedValue = selecteerPeriode.value;

  // Calculate the start date based on the selected value
  const startDate = new Date(currentDate); // Clone the current date
  const endDate = new Date();

  switch (selectedValue) {
    case '7':
      startDate.setDate(currentDate.getDate() - 7);
      endDate.setDate(today.getDate() - 2);
      break;
    case '28':
      startDate.setDate(currentDate.getDate() - 28);
      endDate.setDate(today.getDate() - 2);
      break;
    case 'd-maand':
      if ((today.getDate() === 1 || today.getDate() === 2)) {
        alert("Google Search Console heeft vertraging, je kan enkel de data van 2 dagen ervoor bekijken. Het is daarom niet mogelijk om van deze maand de data op te halen, probeer het vanaf de 3e van de maand.");
        return;
      };
      startDate.setDate(1);
      endDate.setDate(today.getDate() - 2);
      break;
    case 'a-maand':
      startDate.setMonth(today.getMonth() - 1, 1);
      endDate.setDate(0);
      break;
    case '3-maand':
      startDate.setMonth(currentDate.getMonth() - 3);
      endDate.setDate(today.getDate() - 2);
      break;
    case '6-maand':
      startDate.setMonth(currentDate.getMonth() - 6);
      endDate.setDate(today.getDate() - 2);
      break;
    case '12-maand':
      startDate.setFullYear(currentDate.getFullYear() - 1);
      endDate.setDate(today.getDate() - 2);
      break;
    case '16-maand':
      startDate.setFullYear(currentDate.getFullYear() - 1, currentDate.getMonth() - 4);
      endDate.setDate(today.getDate() - 2);
      break;
    case 'jaar':
      startDate.setMonth(0, 1);
      endDate.setDate(today.getDate() - 2);
      break;
    default:
      break;
  }

  startDateInput.value = formatDate(startDate);
  endDateInput.value = formatDate(endDate);
});

// Function to format a date as "yyyy-mm-dd"
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Disabled
const filterType = document.getElementById("filter-type");
filterType.addEventListener("change", function() {
    if (filterType.value != '') {
        document.getElementById("filter-match").removeAttribute("disabled");
        document.getElementById("filter").removeAttribute("disabled");
    } else {
        document.getElementById("filter-match").setAttribute("disabled", "disabled");
        document.getElementById("filter").setAttribute("disabled", "disabled");
    }
});