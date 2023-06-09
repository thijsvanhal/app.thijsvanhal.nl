const CLIENT_ID = '999088568153-mrmsgkpghoi36pqfh3hp5n4mkd59ur53.apps.googleusercontent.com'

function handleSignIn() {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
    auto_select: true,
    prompt_parent_id: 'g_id_onload',
  });
  google.accounts.id.prompt();
}

function handleCredentialResponse(response) {
  if (response.credential) {
    const accessToken = response.credential;
    console.log(accessToken);
    listSites(accessToken);
  } else {
    console.log('Error: ' + response.error);
  }
}

async function listSites(accessToken) {
  const response = await fetch('https://www.googleapis.com/webmasters/v3/sites?key=AIzaSyBc4ek9v6N9K9I_gY2Xt5hs9iI8qAfK77U', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const sites = data.sites;
    console.log(sites);

    var select = document.getElementById('all-sites');
    select.innerHTML = '';

    for (var i = 0; i < sites.length; i++) {
      var option = document.createElement('option');
      option.value = sites[i].siteUrl;
      option.text = sites[i].siteUrl;
      select.appendChild(option);
    }
  } else {
    const errorData = await response.json();
    console.log('Error: ' + errorData.error.message);
  }
}
