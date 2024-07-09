/**
 * @fileoverview Handles visualization of gravity center data using AJAX 
 * @author Lucas Pichon
 */

let X_tab = new Array(), Y_tab = new Array();
let X_total_points = new Array(), Y_total_points = new Array();
var sessionID, shotID;

/**
 * @brief Executes when the DOM content is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function() 
{  
    /**
     * @brief Fetches visualization data from the server using AJAX.
     * 
     * Retrieves X_tab, Y_tab, X_total_points, Y_total_points, sessionID, and shotID
     * from the 'visu_gravityCenter' endpoint.
     */
    function getVisualisationData() 
    {
        $.ajax({
            url: 'visu_gravityCenter',
            type: 'GET',
            success: function(data) 
            {
                X_tab = data.X_tab;
                Y_tab = data.Y_tab;
                X_total_points = data.X_total_points;
                Y_total_points = data.Y_total_points
                sessionID = data.sessionID;
                shotID = data.shotID;
            },
            error: function(xhr, status, error) {
                console.error("Erreur AJAX :", error);
            }
        });
    }

    // Call function to fetch data when DOM is ready
    getVisualisationData();

});
