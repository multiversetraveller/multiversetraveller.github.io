document.addEventListener("DOMContentLoaded", () => {
    const indices = [
        { symbol: "%5ENSEI", name: "Nifty 50" },
        { symbol: "%5EBSESN", name: "BSE SENSEX" },
        { symbol: "%5ENSEBANK", name: "Nifty Bank" },
        { symbol: "%5ECNXIT", name: "Nifty IT" }
    ];

    async function fetchIndexData(symbol) {
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=2m`);
            const data = await response.json();
            const result = data.chart.result[0];
            const meta = result.meta;
            const timestamps = result.timestamp.map(t => new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            const prices = result.indicators.quote[0].close;
            const change = (meta.regularMarketPrice - meta.chartPreviousClose).toFixed(2);
            const direction = change > 0 ? "Up" : "Down";
            return { change, direction, timestamps, prices };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return { change: "N/A", direction: "N/A", timestamps: [], prices: [] };
        }
    }

    async function updateTableAndChart() {
        const chartLabels = [];
        const chartDatasets = [];

        for (const index of indices) {
            try {
                const data = await fetchIndexData(index.symbol);
                const row = document.getElementById(`row-${index.symbol}`);
                if (row) {
                    row.querySelector('.change').innerText = data.change;
                    row.querySelector('.direction').innerText = data.direction;
                    row.querySelector('.direction').classList.toggle('text-green-600', data.direction === 'Up');
                    row.querySelector('.direction').classList.toggle('text-red-600', data.direction === 'Down');
                }

                chartLabels.push(index.name);
                chartDatasets.push({
                    label: index.name,
                    data: data.prices,
                    fill: false,
                    borderColor: getRandomColor(),
                    tension: 0.1
                });

                // Update the chart's dataset
                updateChart(index.symbol, data.timestamps, data.prices);
            } catch (error) {
                console.error(`Error updating table for ${index.name}:`, error);
            }
        }
    }

    function createTableRows() {
        const tableBody = document.getElementById("indexTable");
        for (const index of indices) {
            const row = document.createElement("tr");
            row.id = `row-${index.symbol}`;
            row.innerHTML = `
                <td class="py-2 px-4 text-center">${index.name}</td>
                <td class="py-2 px-4 text-center change"></td>
                <td class="py-2 px-4 text-center direction"></td>
            `;
            tableBody.appendChild(row);
        }
    }

    function updateChart(symbol, labels, data) {
        const dataset = window.myChart.data.datasets.find(ds => ds.label === symbol);
        if (dataset) {
            dataset.data = data;
            window.myChart.data.labels = labels;
            window.myChart.update();
        }
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function initializeChart() {
        const ctx = document.getElementById('indexChart').getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart',
                    onProgress: function(animation) {
                        console.log(`Animation progress: ${animation.currentStep / animation.numSteps}`);
                    },
                    onComplete: function(animation) {
                        console.log('Animation completed');
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (2-min intervals)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Initial setup
    createTableRows();
    initializeChart();
    updateTableAndChart();
    // Update every 2 seconds
    setInterval(updateTableAndChart, 3000);
});
