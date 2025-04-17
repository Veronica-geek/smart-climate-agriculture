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

    cropChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Time to Harvest (Days)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
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
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Crops',
                    },
                },
            },
        },
    });
}

