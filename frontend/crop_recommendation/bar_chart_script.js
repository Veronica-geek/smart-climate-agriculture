let cropChart = null;

export async function fetchChartData(location) {
    const response = await fetch(`http://localhost:5000/recommendation/crop_suitability?location=${location}`);
    const data = await response.json();

    if (data.error) {
        console.error(data.error);
        return;
    }

    // Render crop chart
    const crops = data.crops;
    renderCropChart(crops);
}

function renderCropChart(crops) {
    if (cropChart) cropChart.destroy();

    const ctx = document.getElementById('cropSuitabilityChart').getContext('2d');
    const labels = crops.map(crop => crop.name);

    const data = crops.map(crop => {
        const [min, max] = crop.time_to_harvest.split('-').map(Number);
        return (min + max) / 2; // Average harvest time
    });

    // Define colorful background colors for each bar
    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)',   // Red
        'rgba(54, 162, 235, 0.2)',   // Blue
        'rgba(255, 206, 86, 0.2)',   // Yellow
        'rgba(75, 192, 192, 0.2)',   // Teal
        'rgba(153, 102, 255, 0.2)',  // Purple
        'rgba(255, 159, 64, 0.2)',   // Orange
        'rgba(0, 128, 0, 0.2)',      // Green
        'rgba(128, 0, 128, 0.2)',    // Purple
        'rgba(255, 0, 0, 0.2)',      // Red
        'rgba(0, 255, 0, 0.2)'       // Lime
    ];

    cropChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Time to Harvest (Days)',
                data: data,
                backgroundColor: labels.map((_, index) => backgroundColors[index % backgroundColors.length]),
                borderColor: labels.map((_, index) => backgroundColors[index % backgroundColors.length].replace('0.2', '1')),
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time to Harvest (Days)',
                        color: '#333333'
                    },
                    ticks: {
                        color: '#333333'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Crops',
                        color: '#333333'
                    },
                    ticks: {
                        color: '#333333'
                    }
                },
            },
        },
    });
}