/**
 * @fileoverview Handles visualization of MPU-6050 data using AJAX 
 * @author Lucas Pichon
 */

let q0, q1, q2, q3;
let sliderSensitivityValue, sliderStabilitySensitivityValue;

document.addEventListener("DOMContentLoaded", function() {

    /**
     * @brief Fetches rifle visualization data from the server using AJAX.
     * 
     * Retrieves q0, q1, q2, q3, sliderSensitivityValue, and sliderStabilitySensitivityValue
     * from the 'visu_Rifle' endpoint.
     */
    function getVisualisationRifle() 
    {
        $.ajax({
            url: 'visu_Rifle',
            type: 'GET',
            success: function(data) 
            {
                q0 = data.q0;
                q1 = data.q1;
                q2 = data.q2;
                q3 = data.q3;

                sliderSensitivityValue = data.sliderSensitivityValue;
                sliderStabilitySensitivityValue = data.sliderSensitivityStabilityValue;
                
                window.script1Ready = true;
            },
            error: function(xhr, status, error) {
                console.error("Erreur AJAX :", error);
            }
        });
    }

    // Call function to fetch data when DOM is ready
    getVisualisationRifle();

});
