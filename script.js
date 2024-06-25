 const indices = [
            { symbol: "%5ENSEI", name: "Nifty 50" },
            { symbol: "%5EBSESN", name: "BSE SENSEX" },
            { symbol: "%5ENSEBANK", name: "Nifty Bank" },
            { symbol: "%5ECNXIT", name: "Nifty IT" }
        ];

        async function fetchIndexData(symbol) {
            try {
                const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
                const data = await response.json();
                const meta = data.chart.result[0].meta;
                const change = (meta.regularMarketPrice - meta.chartPreviousClose).toFixed(2);
                const direction = change > 0 ? "Up" : "Down";
                return { change, direction };
            } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error);
                return { change: "N/A", direction: "N/A" };
            }
        }

        async function updateTableAndChart() {
            const chartLabels = [];
            const chartData = [];

            for (const index of indices) {
                try {
                    const data = await fetchIndexData(index.symbol);
                    const row = document.getElementById(`row-${index.symbol}`);
                    row.querySelector('.change').innerText = data.change;
                    row.querySelector('.direction').innerText = data.direction;
                    row.querySelector('.direction').classList.toggle('text-green-600', data.direction === 'Up');
                    row.querySelector('.direction').classList.toggle('text-red-600', data.direction === 'Down');
                    
                    chartLabels.push(index.name);
                    chartData.push(parseFloat(data.change));
                } catch (error) {
                    console.error(`Error updating table for ${index.name}:`, error);
                }
            }

            // Update the chart
            updateChart(chartLabels, chartData);
        }

        function updateChart(labels, data) {
            const ctx = document.getElementById('indexChart').getContext('2d');
            if (window.myChart) {
                window.myChart.data.labels = labels;
                window.myChart.data.datasets[0].data = data;
                window.myChart.update();
            } else {
                window.myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Change',
                            data: data,
                            backgroundColor: data.map(change => change > 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'),
                            borderColor: data.map(change => change > 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
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

        // Initial setup
        createTableRows();
        updateTableAndChart();
        // Update every 2 seconds
        setInterval(updateTableAndChart, 3000);
