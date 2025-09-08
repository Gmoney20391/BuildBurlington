// ===== GLOBAL VARIABLES =====
let priceIncomeChart = null;
let comparisonChart = null;
let rentChart = null;
let vacancyChart = null;
let timelineVRChart = null;
let timelinePopChart = null;
let burlingtonPieChart = null;
let cityComparisonChart = null;

// ===== UTILITY FUNCTIONS =====
const parseNum = (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, '')));
const moneyFmt = (n) => n != null && !isNaN(n) ? '$' + Math.round(n).toLocaleString() : '—';
const pctFmt = (n) => n != null && !isNaN(n) ? (Math.round(n * 10) / 10) + '%' : '—';

// ===== HAMBURGER MENU FUNCTIONALITY =====
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!hamburgerBtn || !mobileMenu) return;
    
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburgerBtn.classList.toggle('hamburger-active');
        mobileMenu.classList.toggle('mobile-menu-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInsideMenu = mobileMenu.contains(e.target);
        const isClickOnHamburger = hamburgerBtn.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger && mobileMenu.classList.contains('mobile-menu-open')) {
            hamburgerBtn.classList.remove('hamburger-active');
            mobileMenu.classList.remove('mobile-menu-open');
        }
    });
    
    // Close menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('hamburger-active');
            mobileMenu.classList.remove('mobile-menu-open');
        });
    });
}

// ===== HOME PAGE CALCULATOR =====
function initHomeCalculator() {
    const incomeSlider = document.getElementById('income-slider');
    const incomeValue = document.getElementById('income-value');
    const savingsSlider = document.getElementById('savings-slider');
    const savingsValue = document.getElementById('savings-value');
    const simulatorResults = document.getElementById('simulator-results');
    
    if (!incomeSlider || !savingsSlider) return;
    
    function updateCalculator() {
        const income = parseInt(incomeSlider.value);
        const savings = parseInt(savingsSlider.value);
        incomeValue.textContent = `$${income.toLocaleString()}`;
        savingsValue.textContent = `$${savings.toLocaleString()}`;
        
        const affordablePrice = income * 4;
        const downPaymentYears = ((1100000 * 0.2) / savings).toFixed(1);
        const affordableMortgage = (affordablePrice * 0.05 / 12).toFixed(0);
        const actualMortgage = (1100000 * 0.05 / 12).toFixed(0);
        
        simulatorResults.innerHTML = `
            <div class="flex justify-between items-center">
                <span>Affordable home price:</span>
                <span class="font-bold text-green-600">$${affordablePrice.toLocaleString()}</span>
            </div>
            <div class="flex justify-between items-center">
                <span>Actual Burlington median price:</span>
                <span class="font-bold text-red-600">$1,100,000</span>
            </div>
            <div class="flex justify-between items-center">
                <span>Monthly mortgage payment (at affordable price):</span>
                <span class="font-bold">$${affordableMortgage}</span>
            </div>
            <div class="flex justify-between items-center">
                <span>Monthly mortgage payment (at actual price):</span>
                <span class="font-bold text-red-600">$${actualMortgage}</span>
            </div>
            <div class="flex justify-between items-center border-t pt-2">
                <span>Years to save a 20% down payment:</span>
                <span class="font-bold text-red-600">${downPaymentYears} years</span>
            </div>
        `;
    }
    
    incomeSlider.addEventListener('input', updateCalculator);
    savingsSlider.addEventListener('input', updateCalculator);
    updateCalculator();
}

// ===== PROBLEM PAGE CHARTS =====
function initProblemPageCharts() {
    // Price vs Income Chart Toggle
    const chartToggleButtons = document.getElementById('chart-toggle-buttons');
    if (chartToggleButtons) {
        const buttons = chartToggleButtons.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                updateChartType(type);
                
                // Update button styles
                buttons.forEach(b => {
                    b.classList.remove('bg-blue-100', 'text-blue-700');
                    b.classList.add('bg-gray-100', 'text-gray-700');
                });
                this.classList.add('bg-blue-100', 'text-blue-700');
            });
        });
    }
    
    // Timeline Slider
    const timelineSlider = document.getElementById('timeline-slider');
    if (timelineSlider) {
        timelineSlider.addEventListener('input', function() {
            updateKPI(parseInt(this.value));
        });
    }
    
    // Metric Select
    const metricSelect = document.getElementById('metric-select');
    if (metricSelect) {
        metricSelect.addEventListener('change', function() {
            updateComparisonChart(this.value);
        });
    }
    
    // Initialize charts with hardcoded data (no API calls)
    initPriceIncomeChart();
    initComparisonChart();
    initRentalCharts();
    initTimelineCharts();
}

function updateChartType(type) {
    if (!priceIncomeChart) return;
    
    priceIncomeChart.data.datasets[0].hidden = type === 'income';
    priceIncomeChart.data.datasets[1].hidden = type === 'price';
    priceIncomeChart.update();
}

function updateKPI(year) {
    const yearLabel = document.getElementById('timeline-year');
    const kpiVac = document.getElementById('kpi-vacancy');
    const kpiPop = document.getElementById('kpi-population');
    const kpiGap = document.getElementById('kpi-gap');
    
    if (!yearLabel) return;
    
    yearLabel.textContent = year;
    
    // Hardcoded data for KPI updates - starting from 2011
    const vacancyData = {
        2011: 0.9, 2012: 1.3, 2013: 1.8, 2014: 1.3,
        2015: 1.7, 2016: 1.1, 2017: 1.3, 2018: 1.7, 2019: 1.7,
        2020: 2.0, 2021: 1.2, 2022: 1.2, 2023: 1.6, 2024: 1.8
    };
    
    const populationData = {
        2011: 180868, 2012: 182992, 2013: 184234,
        2014: 185405, 2015: 186480, 2016: 188387, 2017: 188899,
        2018: 189811, 2019: 191968, 2020: 193217, 2021: 193153,
        2022: 194175, 2023: 196589, 2024: 199004
    };
    
    const housingGapData = {
        2011: 4549, 2012: 5785, 2013: 5489,
        2014: 5665, 2015: 5654, 2016: 5960, 2017: 5743,
        2018: 5547, 2019: 6061, 2020: 6109, 2021: 5673,
        2022: 8011, 2023: 7725, 2024: 7947
    };
    
    if (kpiVac) kpiVac.textContent = pctFmt(vacancyData[year]);
    if (kpiPop) kpiPop.textContent = populationData[year] ? populationData[year].toLocaleString() : '—';
    if (kpiGap) kpiGap.textContent = housingGapData[year] ? housingGapData[year].toLocaleString() : '—';
}

function initPriceIncomeChart() {
    const ctx = document.getElementById('price-income-chart');
    if (!ctx) return;
    
    // Hardcoded data - starting from 2011 with actual dollar values
    const years = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
    const priceData = [400000, 415000, 435000, 460000, 510000, 580000, 650000, 720000, 780000, 850000, 1050000, 1150000, 1100000, 1050000];
    const incomeData = [79000, 79600, 77900, 81500, 80800, 80700, 83400, 85900, 84800, 91100, 92000, 87700, 89300, 90000];
    
    priceIncomeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Median Home Price',
                    data: priceData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Median Income',
                    data: incomeData,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                title: { display: true, text: 'Home Prices vs. Income in Burlington (2011-2024)' },
                tooltip: { 
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${datasetLabel}: $${value.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Dollars ($)' },
                    ticks: {
                        callback: function(value) {
                            return `$${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

function initComparisonChart() {
    const ctx = document.getElementById('comparison-chart');
    if (!ctx) return;
    
    // Hardcoded completion data for each city
    const cities = ['Burlington', 'Oakville', 'Milton', 'Hamilton', 'Waterloo', 'Kitchener', 'Cambridge', 'Guelph'];
    const completionData = [0.8, 1.2, 1.5, 1.4, 1.6, 1.7, 1.3, 1.5];
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cities,
            datasets: [{
                label: 'Housing Completions per 1,000 Residents',
                data: completionData,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(59, 130, 246, 0.6)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)',
                    'rgb(59, 130, 246)',
                    'rgb(59, 130, 246)',
                    'rgb(59, 130, 246)',
                    'rgb(59, 130, 246)',
                    'rgb(59, 130, 246)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Housing Completion Rate Comparison (2023)' },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Completions per 1,000 Residents' }
                }
            }
        }
    });
}

function updateComparisonChart(metric) {
    if (!comparisonChart) return;
    
    // Update chart based on selected metric
    let newData, newTitle, newYLabel;
    
    switch(metric) {
        case 'completions':
            newData = [0.8, 1.2, 1.5, 1.4, 1.6, 1.7, 1.3, 1.5];
            newTitle = 'Housing Completion Rate Comparison (2023)';
            newYLabel = 'Completions per 1,000 Residents';
            break;
        case 'vacancy':
            newData = [1.8, 2.1, 2.4, 2.7, 3.1, 2.9, 2.5, 2.8];
            newTitle = 'Rental Vacancy Rate Comparison (%)';
            newYLabel = 'Vacancy Rate (%)';
            break;
        case 'price':
            newData = [1050, 1250, 950, 750, 825, 800, 775, 850];
            newTitle = 'Average Home Price Comparison ($1000)';
            newYLabel = 'Price ($1000)';
            break;
        default:
            return;
    }
    
    comparisonChart.data.datasets[0].data = newData;
    comparisonChart.options.plugins.title.text = newTitle;
    comparisonChart.options.scales.y.title.text = newYLabel;
    comparisonChart.update();
}

function initRentalCharts() {
    const rentCtx = document.getElementById('rent-chart');
    const vacancyCtx = document.getElementById('vacancy-chart');
    
    if (rentCtx) {
        // Hardcoded rent data - starting from 2011
        const rentYears = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        const rentData = [1097, 1123, 1154, 1203, 1266, 1290, 1365, 1405, 1511, 1623, 1631, 1757, 1823, 1993];
        
        rentChart = new Chart(rentCtx, {
            type: 'line',
            data: {
                labels: rentYears,
                datasets: [{
                    label: 'Average 2-Bedroom Rent',
                    data: rentData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Average Rent for 2-Bedroom Apartments' }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Monthly Rent ($)' }
                    }
                }
            }
        });
    }
    
    if (vacancyCtx) {
        // Hardcoded vacancy rate data - starting from 2011
        const vacancyYears = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        const vacancyData = [0.9, 1.3, 1.8, 1.3, 1.7, 1.1, 1.3, 1.7, 1.7, 2.0, 1.2, 1.2, 1.6, 1.8];
        
        vacancyChart = new Chart(vacancyCtx, {
            type: 'line',
            data: {
                labels: vacancyYears,
                datasets: [{
                    label: 'Rental Vacancy Rate',
                    data: vacancyData,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Rental Vacancy Rate in Burlington' }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Vacancy Rate (%)' },
                        min: 0,
                        max: 5
                    }
                }
            }
        });
    }
}

function initTimelineCharts() {
    const timelineVRCtx = document.getElementById('timeline-vr-chart');
    const timelinePopCtx = document.getElementById('timeline-pop-chart');
    
    if (timelineVRCtx) {
        // Hardcoded timeline vacancy rate data - starting from 2011
        const years = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        const vrData = [0.9, 1.3, 1.8, 1.3, 1.7, 1.1, 1.3, 1.7, 1.7, 2.0, 1.2, 1.2, 1.6, 1.8];
        
        timelineVRChart = new Chart(timelineVRCtx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Vacancy Rate',
                    data: vrData,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Rental Vacancy Rate Over Time' }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Vacancy Rate (%)' },
                        min: 0,
                        max: 3
                    }
                }
            }
        });
    }
    
    if (timelinePopCtx) {
        // Hardcoded housing gap data only (no population) - starting from 2011
        const years = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        const housingGapData = [4549, 5785, 5489, 5665, 5654, 5960, 5743, 5547, 6061, 6109, 5673, 8011, 7725, 7947];
        
        timelinePopChart = new Chart(timelinePopCtx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Housing Gap',
                    data: housingGapData,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Burlington Housing Gap Over Time' }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Housing Units Needed' }
                    }
                }
            }
        });
    }
}

// ===== SOLUTION PAGE CHARTS =====
function initSolutionPageCharts() {
    const burlingtonPieCtx = document.getElementById('burlington-pie-chart');
    const cityComparisonCtx = document.getElementById('city-comparison-chart');
    
    if (burlingtonPieCtx) {
        // Hardcoded Burlington housing type data
        burlingtonPieChart = new Chart(burlingtonPieCtx, {
            type: 'pie',
            data: {
                labels: ['Single-Detached (78%)', 'Apartments (15%)', 'Townhomes (5%)', 'Other (2%)'],
                datasets: [{
                    data: [78, 15, 5, 2],
                    backgroundColor: [
                        'rgb(239, 68, 68)',
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Burlington Housing Type Distribution' },
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    if (cityComparisonCtx) {
        // Hardcoded city comparison data for missing middle housing
        cityComparisonChart = new Chart(cityComparisonCtx, {
            type: 'bar',
            data: {
                labels: ['Burlington', 'Oakville', 'Waterloo', 'Guelph', 'Kitchener', 'Cambridge'],
                datasets: [{
                    label: '% Missing Middle Housing',
                    data: [7, 12, 18, 15, 16, 14],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Missing Middle Housing in GTA Cities' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Percentage of Housing Stock' },
                        max: 20
                    }
                }
            }
        });
    }
}

// ===== ACTION PAGE FUNCTIONALITY =====
function initActionPage() {
    // Initialize councillor lookup
    const councillorLookup = document.getElementById('councillor-lookup');
    if (councillorLookup) {
        councillorLookup.addEventListener('submit', function(e) {
            e.preventDefault();
            const address = document.getElementById('address-input').value.trim();
            if (address) {
                // In a real implementation, this would geocode the address and find the councillor
                showCouncillorInfo();
            }
        });
    }
    
    // Initialize email template functionality
    const emailTemplate = document.getElementById('email-template');
    if (emailTemplate) {
        const nameInput = document.getElementById('sender-name');
        const previewBtn = document.getElementById('preview-email');
        const emailPreview = document.getElementById('email-preview');
        
        if (nameInput && previewBtn && emailPreview) {
            previewBtn.addEventListener('click', function() {
                const name = nameInput.value.trim() || 'Burlington Resident';
                emailPreview.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-navy">
                        <h4 class="font-semibold mb-4">Email Preview:</h4>
                        <div class="border p-4 rounded bg-gray-50">
                            <p>Dear Councillor,</p>
                            <p class="my-3">My name is ${name} and I am a resident of Burlington. I am writing to express my strong support for zoning reforms that would allow more missing middle housing in our city.</p>
                            <p class="my-3">Burlington is facing a severe housing affordability crisis, and one of the key solutions is to legalize more diverse housing types like duplexes, triplexes, and townhomes in residential neighborhoods.</p>
                            <p class="my-3">I urge you to support policies that would allow 4-unit buildings as-of-right in residential zones and streamline the approval process for missing middle housing.</p>
                            <p>Sincerely,<br>${name}</p>
                        </div>
                    </div>
                `;
                emailPreview.classList.remove('hidden');
            });
        }
    }
    
    // Update button text from "Sign the Petition" to "Go to a Meeting"
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
        if (button.textContent.includes('Sign the Petition')) {
            button.textContent = 'Go to a Meeting';
        }
    });
}

function showCouncillorInfo() {
    const councillorInfo = document.getElementById('councillor-info');
    const councillorName = document.getElementById('councillor-name');
    const councillorEmail = document.getElementById('councillor-email');
    const councillorWard = document.getElementById('councillor-ward');
    
    if (councillorInfo && councillorName && councillorEmail && councillorWard) {
        // In a real implementation, this would show the actual councillor based on address
        councillorName.textContent = 'Lisa Kearns';
        councillorEmail.textContent = 'lisa.kearns@burlington.ca';
        councillorEmail.href = 'mailto:lisa.kearns@burlington.ca';
        councillorWard.textContent = 'Ward 2';
        
        councillorInfo.classList.remove('hidden');
    }
}

// ===== PREVIEW CHARTS FOR HOMEPAGE =====
function initPreviewCharts() {
    const priceIncomePreviewCtx = document.getElementById('preview-price-income-chart');
    const comparisonPreviewCtx = document.getElementById('preview-comparison-chart');
    
    if (priceIncomePreviewCtx) {
        // Simplified version of price vs income chart for homepage with single y-axis
        const years = ['2015', '2017', '2019', '2021', '2023'];
        const priceData = [510000, 650000, 780000, 1050000, 1100000];
        const incomeData = [80800, 83400, 84800, 92000, 89300];
        
        new Chart(priceIncomePreviewCtx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Median Home Price',
                        data: priceData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Median Income',
                        data: incomeData,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y !== null ? '$' + context.parsed.y.toLocaleString() : '';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        display: true,
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Dollars ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    if (comparisonPreviewCtx) {
        // Simplified comparison chart for homepage
        const cities = ['Burlington', 'Oakville', 'Milton', 'Hamilton'];
        const completionData = [0.8, 1.2, 1.5, 1.4];
        
        new Chart(comparisonPreviewCtx, {
            type: 'bar',
            data: {
                labels: cities,
                datasets: [{
                    label: 'Housing Completions per 1,000 Residents',
                    data: completionData,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(59, 130, 246, 0.6)'
                    ],
                    borderColor: [
                        'rgb(239, 68, 68)',
                        'rgb(59, 130, 246)',
                        'rgb(59, 130, 246)',
                        'rgb(59, 130, 246)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        display: true,
                        title: {
                            display: true,
                            text: 'Completions per 1,000 Residents'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// ===== INITIALIZE PAGE-SPECIFIC FUNCTIONALITY =====
function initPageSpecific() {
    const bodyId = document.body.id;
    
    switch(bodyId) {
        case 'home-page':
            initHomeCalculator();
            initPreviewCharts();
            break;
        case 'problem-page':
            initProblemPageCharts();
            break;
        case 'solution-page':
            initSolutionPageCharts();
            break;
        case 'action-page':
            initActionPage();
            break;
    }
}

// ===== DOCUMENT READY =====
document.addEventListener('DOMContentLoaded', function() {
    initHamburgerMenu();
    initPageSpecific();
});