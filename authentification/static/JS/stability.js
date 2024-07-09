/**
 * @fileoverview Manages real-time interface for stability visualization.
 * @author Lucas Pichon
 */

/**
 * @brief Initializes the stability chart and sets up event listeners.
 * 
 * This function initializes the stability chart using Chart.js and sets up
 * event listeners for window resize events.
 */

document.addEventListener("DOMContentLoaded", function() 
{
    let previousQuaternion = new Array(4);  // Array to store previous quaternion values. 
    var chart1; // Chart.js instance for stability visualisation 

    const canvas = document.getElementById('chart1');
    const top = 100 + 0.25 * window.innerHeight;
    canvas.style.top = `${top}px`; 
    canvas.style.left = 0.75 * window.innerWidth;

    /**
     * @brief Initializes the stability chart using Chart.js.
     */
    function initChart() 
    {

        stability = new Array(60); // Array to store stability values
        var labels = [];    
        for (var i = 0; i < 60; i++) 
        {
            labels.push(i.toString());
            stability[i] = 0;
        }

        chart1 = new Chart(document.getElementById('chart1').getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stability',
                    data: [],
                    fill: false,
                    backgroundColor: 'rgba(255, 140, 0, 1)',
                    borderColor: 'rgba(255, 140, 0, 1)',
                    borderWidth: 1
                },
    
            ]
            },

            options: {

                animation: {
                    duration: 5,
                    easing: 'easeInOut',
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '' 
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Stability' 
                        },
                        beginAtZero : true,
                        //max : 1,
                    }
                },
                responsive: false, 
                maintainAspectRatio: false,
            }
        });
    }

    /**
     * @brief Calculates the stability change based on quaternion updates.
     * @returns {number} Stability change value.
     */
    function calculateStability() 
    {
        
        let dq0 = q0 - previousQuaternion[0];
        let dq1 = q1 - previousQuaternion[1];
        let dq2 = q2 - previousQuaternion[2];
        let dq3 = q3 - previousQuaternion[3];

        previousQuaternion[0] = q0;
        previousQuaternion[1] = q1;
        previousQuaternion[2] = q2;
        previousQuaternion[3] = q3;
    
        let sumOfSquares = (dq0 * dq0 + dq1 * dq1 + dq2 * dq2 + dq3 * dq3);
    
        let stabilityChange = Math.sqrt(sumOfSquares) * sliderSensitivityStability.value();
    
        return stabilityChange;
    }

    /**
     * @brief Updates the stability chart with the latest stability value.
     */
    function updateStability()
    {
        var stabilityValue = calculateStability();

        stability.pop();
        stability.unshift(stabilityValue);

        chart1.data.datasets[0].data = stability;
       
        chart1.update();
    }

    /**
     * @brief Resizes the stability chart based on window dimensions.
     */
    function resizeChart() 
    {
        const top = 100 + 0.25 * window.innerHeight;
        canvas.style.top = `${top}px`; 
        canvas.style.left = 0.75 * window.innerWidth;
    }
    
    // Event listener for window resize
    window.addEventListener('resize', resizeChart);

    // Initialize the stability chart 
    initChart();

    // Update stability periodicaly 
    setInterval(updateStability, 100);
});

