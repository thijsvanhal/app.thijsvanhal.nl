const CLIENT_ID = '150033487611-lm6amk19g60af65kd0olfvmfe2c4gsth.apps.googleusercontent.com'
let access_token

//Tijdelijk
document.getElementById('ids').value = "ga:154103662";
document.getElementById('startDate').value = "2023-03-01";
document.getElementById('endDate').value = "2023-03-31";
document.getElementById('metrics').value = "ga:users";
document.getElementById('dimensions').value = "ga:sourceMedium";
document.getElementById('segments').value = "gaid::-1";

async function initClient() {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      callback: (tokenResponse) => {
        access_token = tokenResponse.access_token;
        localStorage.setItem('access_token', access_token);
        getData();
      },
    });
    client.requestAccessToken();
}

async function getData() {      
    const viewId = document.getElementById('ids').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const metrics = document.getElementById('metrics').value;
    const dimensions = document.getElementById('dimensions').value;
    const segments = document.getElementById('segments').value;

    const apiUrl = `https://analyticsreporting.googleapis.com/v4/reports:batchGet`;

    const requestBody = {
        reportRequests: [{
            viewId: viewId,
            dateRanges: [{ startDate: startDate, endDate: endDate }],
            metrics: metrics.split(',').map(metric => ({ expression: metric })),
            dimensions: dimensions.split(',').map(dimension => ({ name: dimension })),
            segments: segments ? [{ segmentId: segments }] : [],
        }],
    };

    // Fetch the data from the API
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(requestBody),
    })
    if (response.ok) {
        const data = await response.json();
        const dataArray = processData(data);
        console.log(dataArray);
    }
}
  
function processData(data) {
    const dataArray = [];
  
    if (data.reports && data.reports.length > 0) {
        const report = data.reports[0];
        if (report.data && report.data.rows && report.data.rows.length > 0) {
            report.data.rows.forEach(row => {
                const rowData = {};
                row.dimensions.forEach((dimension, index) => {
                    rowData[`dimension${index + 1}`] = dimension;
                });
                row.metrics.forEach((metric, index) => {
                    rowData[`metric${index + 1}`] = metric.values[0];
                });
                dataArray.push(rowData);
            });
        }
    }
    return dataArray;
}  