$(document).ready(function() {
    // Initialize jQuery UI Sortable
    $("#driver-list").sortable({
        update: function(event, ui) {
            updateOrderNumbers();
        }
    });

    // Update order numbers initially
    updateOrderNumbers();

    // Add event listener to the submit button
    $("#submit-prediction").on("click", function() {
        printDriverStandings();
    });

    $("#load-prediction").on("click", function() {
        loadPrediction();
    });

});

// Function to update order numbers
function updateOrderNumbers() {
    $("#driver-list li").each(function(index) {
        $(this).find(".order-number").text(index + 1);
    });
}

/////////////

// Function to print driver standings and save as Gist
function printDriverStandings() {
    var userName = prompt("Enter your name:");
    
    if (userName !== null && userName.trim() !== "") {
        var standings = [];
        $("#driver-list li").each(function(index) {
            var driverName = $(this).data("driver");
            standings.push(`${index + 1}. ${driverName}`);
        });

        var standingsText = `Driver Standings for ${userName}\n\n${standings.join('\n')}`;
        
        // Create a new Gist
        createOrUpdateGist(userName.toLowerCase(), standingsText);
    }
}

// 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
// Function to create or update a Gist
// Function to create or update a Gist
function createOrUpdateGist(userName, standingsText) {
    // Check if a Gist with the same description already exists for the user
    $.ajax({
        url: `https://api.github.com/users/berenkusmenoglu/gists`,
        type: "GET",
        dataType: "json",
        success: function(response) {
            console.log(response);
            // Find the Gist with the specified description
            var existingGist = response.find(function(gist) {
                return gist.description === `${userName}`;
            });

            if (existingGist) {
                // Update the existing Gist
                updateGist(existingGist.id, standingsText);
            } else {
                // Create a new Gist
                createGist(userName, standingsText);
            }
        },
        error: function(error) {
            console.error("Error checking Gist existence:", error);
            alert("Error checking Gist existence. Please try again.");
        }
    });
}
// Function to create a new Gist
function createGist(userName, standingsText) {

    $.ajax({
        url: "https://api.github.com/gists",
        type: "POST",
        dataType: "json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "token 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");
        },
        data: JSON.stringify({
            description: `${userName}`,
            public: true,
            files: {
                'standings.txt': {
                    content: standingsText
                }
            }
        }),
        success: function(response) {
            alert(`Prediction saved successfully for ${userName}!`);
        },
        error: function(error) {
            console.error("Error saving prediction:", error);
            alert("Error saving prediction. Please try again.");
        }
    });
}

// Function to update an existing Gist
function updateGist(gistId, standingsText) {
    $.ajax({
        url: `https://api.github.com/gists/${gistId}`,
        type: "PATCH",
        dataType: "json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "token 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");
        },
        data: JSON.stringify({
            files: {
                'standings.txt': {
                    content: standingsText
                }
            }
        }),
        success: function(response) {
            alert(`Prediction updated successfully for ${gistId}!`);
        },
        error: function(error) {
            console.error("Error updating prediction:", error);
            alert("Error updating prediction. Please try again.");
        }
    });
}

// Function to load standings from Gist
function loadStandingsFromGist(gistId) {
    $.ajax({
        url: `https://api.github.com/gists/${gistId}`,
        type: "GET",
        dataType: "json",
        success: function(response) {
            var standingsText = response.files['standings.txt'].content;
            loadAndReorganizePrediction(standingsText);
        },
        error: function(error) {
            console.error("Error loading standings:", error);
            alert("Error loading standings. Please try again.");
        }
    });
}

//// getting

function loadPrediction() {
    var userName = prompt("Enter the user name of the prediction you want to load:");
    
    if (userName !== null && userName.trim() !== "") {
        getPrediction(userName.toLowerCase())
    }
}

function getPrediction(userName) {
    // Get all Gists for the user
    $.ajax({
        url: `https://api.github.com/users/berenkusmenoglu/gists`,
        type: "GET",
        dataType: "json",
        success: function(response) {
            // Iterate over each Gist
        
             var existingGist = response.find(function(gist) {
                return gist.description === `${userName}`;
            });
      
            if (existingGist) {
                loadStandingsFromGist(existingGist.id);

            } else {
                // If no existing prediction is found, inform the user
                alert("No prediction found for the specified user.");
            }
        },
        error: function(error) {
            console.error("Error getting prediction:", error);
            alert("Error getting prediction. Please try again.");
        }
    });
}

// Function to load and reorganize a prediction
function loadAndReorganizePrediction(standingsText) {
    // Split the standings text into an array
    var standingsArray = standingsText.split('\n');

    // Remove the last empty element from the array
    standingsArray.pop();

    // Map the driver names to their order numbers
    var orderMap = {};
    standingsArray.forEach(function(standing, index) {
        var driverName = standing.split('. ')[1];
        orderMap[driverName] = index + 1;
    });

    // Reorganize the list based on the order map
    $("#driver-list li").sort(function(a, b) {
        var driverA = $(a).data("driver");
        var driverB = $(b).data("driver");
        return orderMap[driverA] - orderMap[driverB];
    }).appendTo("#driver-list");

    // Update the order numbers
    updateOrderNumbers();
}