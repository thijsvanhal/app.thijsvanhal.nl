function handleSuggestions(data) {
    // Retrieve the existing suggestions array from the global scope
    const suggestions = window.suggestions || [];

    // Process the fetched data and add suggestions to the array
    for (let i = 1; i < data.length; i++) {
        const suggestionSet = data[i];
        suggestions.push.apply(suggestions, suggestionSet);
    }

    // Store the updated suggestions array in the global scope
    window.suggestions = suggestions;

    // Perform clustering
    const clusters = clusterSuggestions();
    clusters.sort((a, b) => a.cluster.localeCompare(b.cluster));
    console.log(clusters);
}

function clusterSuggestions() {
    const suggestions = window.suggestions || [];
    const clusters = [];
  
    const queryInputs = document.getElementsByClassName('queryInput');
    const queries = Array.from(queryInputs).map(input => input.value.trim().toLowerCase());
  
    const querySet = new Set(queries);
  
    const wordCounts = {};
    suggestions.forEach(suggestion => {
      const lowercaseSuggestion = suggestion.toLowerCase();
      const words = lowercaseSuggestion.split(' ');
  
      if (words.every(word => !querySet.has(word))) {
        words.forEach(word => {
          if (!wordCounts[word]) {
            wordCounts[word] = 1;
          } else {
            wordCounts[word]++;
          }
        });
      }
    });
  
    const sortedWords = Object.keys(wordCounts).sort((a, b) => {
        if (wordCounts[a] === 1 && wordCounts[b] === 1) {
          return 0; // If both words have count 1, maintain their original order
        } else if (wordCounts[a] === 1) {
          return 1; // If 'a' has count 1, it should come after 'b'
        } else if (wordCounts[b] === 1) {
          return -1; // If 'b' has count 1, it should come after 'a'
        } else {
          return wordCounts[a] - wordCounts[b]; // Sort by count in ascending order
        }
    });
    console.log(sortedWords);
  
    suggestions.forEach(suggestion => {
      const lowercaseSuggestion = suggestion.toLowerCase();
  
      if (lowercaseSuggestion.split(' ').every(word => !querySet.has(word))) {
        const matchingClusters = sortedWords.filter(word => lowercaseSuggestion.includes(word));
  
        if (matchingClusters.length === 0) {
          clusters.push({
            suggestion,
            cluster: 'Unclassified'
          });
        } else {
          const mostRelevantCluster = matchingClusters[0]; // Get the most relevant cluster
          clusters.push({
            suggestion,
            cluster: mostRelevantCluster
          });
        }
      }
    });
  
    return clusters;
}

function clusterSuggestions1() {
    const suggestions = window.suggestions || [];
    const clusters = [];
  
    const queryInputs = document.getElementsByClassName('queryInput');
    const queries = Array.from(queryInputs).map(input => input.value.trim().toLowerCase());
  
    const querySet = new Set(queries); // Create a set of unique query inputs
  
    const wordCounts = {};
    suggestions.forEach(suggestion => {
      const lowercaseSuggestion = suggestion.toLowerCase();
      const words = lowercaseSuggestion.split(' ');
  
      if (words.every(word => !querySet.has(word))) {
        words.forEach(word => {
          if (!wordCounts[word]) {
            wordCounts[word] = 1;
          } else {
            wordCounts[word]++;
          }
        });
      }
    });
  
    const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);
  
    suggestions.forEach(suggestion => {
      const lowercaseSuggestion = suggestion.toLowerCase();
  
      if (lowercaseSuggestion.split(' ').every(word => !querySet.has(word))) {
        const matchingClusters = sortedWords.filter(word => lowercaseSuggestion.includes(word));
        if (matchingClusters.length === 0) {
          clusters.push({
            suggestion,
            cluster: 'Unclassified'
          });
        } else {
          matchingClusters.forEach(cluster => {
            clusters.push({
              suggestion,
              cluster
            });
          });
        }
      }
    });
  
    return clusters;
}
  
function fetchSuggestions() {
    const queryInputs = document.getElementsByClassName('queryInput');
    const queries = [];
  
    // Retrieve the entered queries
    for (let i = 0; i < queryInputs.length; i++) {
        const queryInput = queryInputs[i];
        const query = queryInput.value.trim();
  
        if (query) {
            queries.push(query);
        }
    }
  
    if (queries.length === 0) {
        alert('Please enter at least one search query');
        return;
    }
  
    const apiUrl = 'https://suggestqueries.google.com/complete/search?output=firefox&hl=nl&q=';
  
    queries.forEach(query => {
        // Generate a unique callback function name for each query
        const callbackName = `jsonp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
        // Create a global callback function for each query
        window[callbackName] = handleSuggestions;
    
        // Create a script element for the main query and set the src attribute
        const script = document.createElement('script');
        script.src = `${apiUrl}${query}&callback=${callbackName}`;
    
        // Append the script element to the document body
        document.body.appendChild(script);
    
        // Fetch suggestions for each letter and number combination
        const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < alphanumeric.length; i++) {
            const alphanumericChar = alphanumeric[i];
    
            // Create a unique callback function name for each combination
            const combinationCallbackName = `jsonp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
            // Create a global callback function for each combination
            window[combinationCallbackName] = handleSuggestions;
    
            // Create a script element for each combination and set the src attribute
            const combinationScript = document.createElement('script');
            combinationScript.src = `${apiUrl}${query} ${alphanumericChar}&callback=${combinationCallbackName}`;
    
            // Append the script element to the document body
            document.body.appendChild(combinationScript);
        }
      });
}  