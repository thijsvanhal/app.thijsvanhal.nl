const CLIENT_ID = '999088568153-mrmsgkpghoi36pqfh3hp5n4mkd59ur53.apps.googleusercontent.com'
const naam = document.getElementById('naam');
const email = document.getElementById('email');
const foto = document.getElementById('foto');
let access_token
let allData = [];

async function handleSignIn() {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
    auto_select: true,
    prompt_parent_id: 'g_id_onload',
  });
  const hasSignedIn = checkSignedInFlag();
  
  if (hasSignedIn) {
    var token_response = localStorage.getItem('credential');
    updateInformation(token_response);
    await initClient();
  } else {
    google.accounts.id.prompt();
  }
}

function checkSignedInFlag() {
  return localStorage.getItem('signedIn') === 'true';
}

async function handleCredentialResponse(response) {
  if (response.credential) {
    var token_response = response.credential;
    updateInformation(token_response);
    localStorage.setItem('signedIn', 'true');
    localStorage.setItem('credential', response.credential);
    await initClient();
  } else {
    console.log('Error: ' + response.error);
  }
}

async function initClient() {
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token;
      listSites();
    },
  });
  client.requestAccessToken();
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
    console.log('Error: ' + errorData.error.message);
  }
}

async function getData() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const siteUrl = encodeURIComponent(document.getElementById('all-sites').value);

  const maxRows = 25000;
  let startRow = 0;
  let totalRows = 0;
  let data;
  const statusElement = document.querySelector('.status');
  statusElement.insertAdjacentHTML('afterbegin', `<div class="body-text"><p>De tool begint met het ophalen van de data...</p></div>`);

  do {
    const requestBody = {
      startDate: startDate,
      endDate: endDate,
      dimensions: ["page", "query"],
      type: "web",
      rowLimit: maxRows,
      startRow: startRow
    };

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
      console.log(allData);
    } else {
      const errorData = await response.json();
      console.log('Error: ' + errorData.error.message);
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

  allData.forEach((data) => {
    const formattedArray = data.map((row) => {
      return {
        URL: row.keys[0],
        Keyword: row.keys[1],
        Clicks: row.clicks,
        Impressions: row.impressions,
        CTR: (row.ctr * 100).toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%',
        Position: row.position.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      };
    });

    console.log(formattedArray);

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
  link.download = 'data.xlsx';
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function parseJwt (token_response) {
  var base64Url = token_response.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function updateInformation(token_response) {
  const jwt = parseJwt(token_response);
  naam.innerHTML = 'Hi ' + jwt.name + '!';
  email.innerHTML = 'Met ' + jwt.email + ' heb je toegang tot de volgende properties. Van welke wil je data ophalen?';
  foto.src = jwt.picture;
}