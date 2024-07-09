/**
 * @fileoverview Manages post-training interface for stability visualisation.
 * @author Lucas Pichon
 */

document.addEventListener("DOMContentLoaded", function() 
{
    var chart1;
    stability = new Array(0);
    var factor;

    const canvas = document.getElementById('chart1');
    const top = 100 + 0.25 * window.innerHeight;
    canvas.style.top = `${top}px`; 
    canvas.style.left = 0.75 * window.innerWidth;

    /**
     * @brief Initializes the chart with initial configuration and plugins.
     */
    function initChart() 
    {

        var labels = [];
        for (var i = 0; i < 60 ; i++) 
        {
            labels.push(i.toString());
        }

        const momentOfTheShot = {
            id: 'momentOfTheShot',
            afterDraw: (chart) => {
                const {ctx, chartArea: {left, right, top, bottom, width, height}, scales: {x}} = chart;
        

                ctx.save();
                ctx.beginPath();

                ctx.moveTo(x.getPixelForValue(28), top); 
                ctx.lineTo(x.getPixelForValue(28), bottom); 
                ctx.moveTo(x.getPixelForValue(32), top); 
                ctx.lineTo(x.getPixelForValue(32), bottom); 
        
                ctx.setLineDash([5, 5]);
        
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(255, 99, 132, 1)';
                ctx.stroke();
                ctx.restore();
            }
        };

        const legend = 
        {
            id: 'legend',
            afterDraw: (chart) => 
            {
                const {ctx, chartArea: {left, right, top, bottom, width, height}} = chart;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(width * 0.05, height * 0.09); 
                ctx.lineTo(width * 0.15, height * 0.09);
        
                ctx.setLineDash([2, 2]);
        
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(255, 99, 132, 1)';
                ctx.stroke();
                ctx.restore();
            }
        };

        const legendText = 
        {
            id: 'legendText',
            afterDraw: (chart) => 
            {
                const {ctx, chartArea: {left, right, top, bottom, width, height}} = chart;

                ctx.save();
                ctx.font = '10px Arial';
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.fillText('Moment of the shot', width * 0.15 + 10, height * 0.09);
                ctx.restore();
            }
        };

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
            },
            plugins: [momentOfTheShot, legend, legendText],
        });
    }

    /**
     * @brief Calculates the stability change based on quaternion values.
     * @param {number} i - Index for quaternion array.
     * @returns {number} - Stability change value.
     */
    function calculateStability(i) 
    {
        
        let dq0 = q0[i+1] - q0[i];
        let dq1 = q1[i+1] - q1[i];
        let dq2 = q2[i+1] - q2[i];
        let dq3 = q3[i+1] - q3[i];
    
        let sumOfSquares = (dq0 * dq0 + dq1 * dq1 + dq2 * dq2 + dq3 * dq3);
        let stabilityChange = Math.sqrt(sumOfSquares) * sliderStabilitySensitivityValue;
    
        return stabilityChange;
    }
    
    /**
     * @brief Updates the stability data and refreshes the chart.
     */
    function updateStability()
    {
        const length = q0.length/60;
        for (var i = 0 ; i < 60; i++)
        {
            var sum_stability = 0;

            for(var j = 0; j < length; j++)
            {
                sum_stability = sum_stability + calculateStability(i * length + j);
            }
    
            stability.push(sum_stability);
            
        }
        
        chart1.data.datasets[0].data = stability;
        chart1.update();
    }

    /**
     * @brief Waits for script1 to be ready before initializing the chart and updating stability.
     */
    function waitForScript1() 
    {
        if (window.script1Ready) 
        {
            initChart();
            updateStability();
        } else 
        {
            setTimeout(waitForScript1, 50); 
        }
    }

    /**
     * @brief Resizes the chart canvas position based on window resize event.
     */
    function resizeChart() 
    {
        const top = 100 + 0.25 * window.innerHeight;
        canvas.style.top = `${top}px`; 
        canvas.style.left = 0.75 * window.innerWidth;
    
    }
    
    // Event listener for window resize to resize the chart canvas
    window.addEventListener('resize', resizeChart);

    // Wait for script1 to be ready before initializing chart
    waitForScript1();
});

