// ===== GLOBAL VARIABLES =====
let priceIncomeChart = null;
let comparisonChart = null;
let rentChart = null;
let vacancyChart = null;
let timelineVRChart = null;
let timelinePopChart = null;
let burlingtonPieChart = null;
let cityComparisonChart = null;
let previewPriceIncomeChart = null;
let previewComparisonChart = null;

// ===== UTILITY FUNCTIONS =====
const parseNum = (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, '')));
const moneyFmt = (n) => (n != null && !isNaN(n) ? '$' + Math.round(n).toLocaleString() : '—');
const pctFmt = (n) => (n != null && !isNaN(n) ? (Math.round(n * 10) / 10) + '%' : '—');

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

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            hamburgerBtn.classList.remove('hamburger-active');
            mobileMenu.classList.remove('mobile-menu-open');
        }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('hamburger-active');
            mobileMenu.classList.remove('mobile-menu-open');
        });
    });
}

// ===== DATASETS =====
// Housing prices data from Burlington_Housing.csv
const housingPrices = [
    { year: 2010, price: 385000 },
    { year: 2011, price: 400000 },
    { year: 2012, price: 415000 },
    { year: 2013, price: 435000 },
    { year: 2014, price: 460000 },
    { year: 2015, price: 510000 },
    { year: 2016, price: 580000 },
    { year: 2017, price: 650000 },
    { year: 2018, price: 720000 },
    { year: 2019, price: 780000 },
    { year: 2020, price: 850000 },
    { year: 2021, price: 1050000 },
    { year: 2022, price: 1150000 },
    { year: 2023, price: 1100000 },
    { year: 2024, price: 1050000 }
];

// Income data from OntarioIncome.csv
const incomeData = [
    { year: 2010, income: 80000 },
    { year: 2011, income: 79000 },
    { year: 2012, income: 79600 },
    { year: 2013, income: 77900 },
    { year: 2014, income: 81500 },
    { year: 2015, income: 80800 },
    { year: 2016, income: 80700 },
    { year: 2017, income: 83400 },
    { year: 2018, income: 85900 },
    { year: 2019, income: 84800 },
    { year: 2020, income: 91100 },
    { year: 2021, income: 92000 },
    { year: 2022, income: 87700 },
    { year: 2023, income: 89300 }
];

// Calculate price-to-income ratio data
const priceToIncomeData = [];
for (let i = 0; i < Math.min(housingPrices.length, incomeData.length); i++) {
    if (housingPrices[i].year === incomeData[i].year) {
        priceToIncomeData.push({
            year: housingPrices[i].year,
            ratio: housingPrices[i].price / incomeData[i].income
        });
    }
}

// City comparison data from BurlingtonComparison.csv
const comparisonDataMaster = {
    'Price_to_Income_Ratio': [
        { city: 'Burlington', value: 12.32 },
        { city: 'Oakville', value: 10.8 },
        { city: 'Milton', value: 9.05 },
        { city: 'Hamilton', value: 9.62 },
        { city: 'Mississauga', value: 11.53 },
        { city: 'Toronto', value: 12.35 },
        { city: 'London', value: 8.61 },
        { city: 'Kitchener', value: 8.29 },
        { city: 'Cambridge', value: 8.33 },
        { city: 'Guelph', value: 8.89 },
        { city: 'Barrie', value: 8.72 },
        { city: 'Oshawa', value: 9.87 },
        { city: 'Whitby', value: 10.0 },
        { city: 'Ajax', value: 10.0 }
    ],
    'Avg_Rent_2Bedroom_2024': [
        { city: 'Burlington', value: 1993 },
        { city: 'Oakville', value: 2100 },
        { city: 'Milton', value: 1850 },
        { city: 'Hamilton', value: 1650 },
        { city: 'Mississauga', value: 1950 },
        { city: 'Toronto', value: 2100 },
        { city: 'London', value: 1550 },
        { city: 'Kitchener', value: 1700 },
        { city: 'Cambridge', value: 1600 },
        { city: 'Guelph', value: 1750 },
        { city: 'Barrie', value: 1700 },
        { city: 'Oshawa', value: 1800 },
        { city: 'Whitby', value: 1850 },
        { city: 'Ajax', value: 1900 }
    ],
    'Vacancy_Rate_2024_Pct': [
        { city: 'Burlington', value: 1.8 },
        { city: 'Oakville', value: 1.5 },
        { city: 'Milton', value: 1.9 },
        { city: 'Hamilton', value: 2.1 },
        { city: 'Mississauga', value: 1.7 },
        { city: 'Toronto', value: 1.6 },
        { city: 'London', value: 2.3 },
        { city: 'Kitchener', value: 2.0 },
        { city: 'Cambridge', value: 2.2 },
        { city: 'Guelph', value: 2.1 },
        { city: 'Barrie', value: 2.2 },
        { city: 'Oshawa', value: 2.0 },
        { city: 'Whitby', value: 1.9 },
        { city: 'Ajax', value: 1.8 }
    ],
    'Housing_Starts_Per_1000_People': [
        { city: 'Burlington', value: 1.2 },
        { city: 'Oakville', value: 1.4 },
        { city: 'Milton', value: 3.1 },
        { city: 'Hamilton', value: 2.8 },
        { city: 'Mississauga', value: 2.5 },
        { city: 'Toronto', value: 3.0 },
        { city: 'London', value: 2.7 },
        { city: 'Kitchener', value: 3.2 },
        { city: 'Cambridge', value: 2.9 },
        { city: 'Guelph', value: 2.8 },
        { city: 'Barrie', value: 2.6 },
        { city: 'Oshawa', value: 2.7 },
        { city: 'Whitby', value: 2.4 },
        { city: 'Ajax', value: 2.3 }
    ]
};

// Completions per 1000 people data (calculated from BurlingtonCompletions.csv and BurlingtonPopulation.csv)
const completionsPer1000Data = [
    { city: 'Burlington', value: 3.2 },
    { city: 'Oakville', value: 4.1 },
    { city: 'Milton', value: 6.8 },
    { city: 'Hamilton', value: 5.2 },
    { city: 'Mississauga', value: 5.7 },
    { city: 'Toronto', value: 7.3 },
    { city: 'London', value: 4.5 },
    { city: 'Kitchener', value: 5.9 },
    { city: 'Cambridge', value: 4.8 },
    { city: 'Guelph', value: 5.1 },
    { city: 'Barrie', value: 4.3 },
    { city: 'Oshawa', value: 4.6 },
    { city: 'Whitby', value: 4.9 },
    { city: 'Ajax', value: 5.0 }
];

// Zoning comparison data for solution page from ZoningComparison.csv
const zoningComparisonData = {
    'Low Density Residential': [
        { city: 'Burlington', value: 7.85 },
        { city: 'Oakville', value: 15.2 },
        { city: 'Milton', value: 1.65 },
        { city: 'Hamilton', value: 1.24 },
        { city: 'Mississauga', value: 0.29 },
        { city: 'Toronto', value: 38.2 },
        { city: 'London', value: 1.48 }
    ],
    'Medium Density Residential': [
        { city: 'Burlington', value: 3.24 },
        { city: 'Oakville', value: 3.73 },
        { city: 'Milton', value: 13.34 },
        { city: 'Hamilton', value: 1.31 },
        { city: 'Mississauga', value: 5.03 },
        { city: 'Toronto', value: 9.82 },
        { city: 'London', value: 4.99 }
    ],
    'High Density / Mixed Use': [
        { city: 'Burlington', value: 2.43 },
        { city: 'Oakville', value: 1.85 },
        { city: 'Milton', value: 1.69 },
        { city: 'Hamilton', value: 0.13 },
        { city: 'Mississauga', value: 3.65 },
        { city: 'Toronto', value: 3.89 },
        { city: 'London', value: 4.08 }
    ]
};

// Rent data from Burlingtonrent.csv
const rentData = [
    { year: 2010, rent: 1060 },
    { year: 2011, rent: 1097 },
    { year: 2012, rent: 1123 },
    { year: 2013, rent: 1154 },
    { year: 2014, rent: 1203 },
    { year: 2015, rent: 1266 },
    { year: 2016, rent: 1290 },
    { year: 2017, rent: 1365 },
    { year: 2018, rent: 1405 },
    { year: 2019, rent: 1511 },
    { year: 2020, rent: 1623 },
    { year: 2021, rent: 1631 },
    { year: 2022, rent: 1757 },
    { year: 2023, rent: 1823 },
    { year: 2024, rent: 1993 }
];

// Vacancy rate data from BurlintonVacancy.csv
const vacancyData = [
    { year: 2010, rate: 1.4 },
    { year: 2011, rate: 0.9 },
    { year: 2012, rate: 1.3 },
    { year: 2013, rate: 1.8 },
    { year: 2014, rate: 1.3 },
    { year: 2015, rate: 1.7 },
    { year: 2016, rate: 1.1 },
    { year: 2017, rate: 1.3 },
    { year: 2018, rate: 1.7 },
    { year: 2019, rate: 1.7 },
    { year: 2020, rate: 2.0 },
    { year: 2021, rate: 1.2 },
    { year: 2022, rate: 1.2 },
    { year: 2023, rate: 1.6 },
    { year: 2024, rate: 1.8 }
];

// Housing density data for pie chart (calculated from ZoningComparison.csv)
const housingDensityData = [
    { type: 'Low Density', value: 7.85 },
    { type: 'Medium Density', value: 3.24 },
    { type: 'High Density', value: 2.43 },
    { type: 'Single Detatched', value: 7.85 } // Single Detached Residential
];

// Timeline data from BurlingtonPopulation.csv
const timelineData = {
  2010: { vacancy: 1.4, population: 178492, gap: 8114 },
  2011: { vacancy: 0.9, population: 180868, gap: 4549 },
  2012: { vacancy: 1.3, population: 182992, gap: 5785 },
  2013: { vacancy: 1.8, population: 184234, gap: 5489 },
  2014: { vacancy: 1.3, population: 185405, gap: 5665 },
  2015: { vacancy: 1.7, population: 186480, gap: 5654 },
  2016: { vacancy: 1.1, population: 188387, gap: 5960 },
  2017: { vacancy: 1.3, population: 188899, gap: 5743 },
  2018: { vacancy: 1.7, population: 189811, gap: 5547 },
  2019: { vacancy: 1.7, population: 191968, gap: 6061 },
  2020: { vacancy: 2.0, population: 193217, gap: 6109 },
  2021: { vacancy: 1.2, population: 193153, gap: 5673 },
  2022: { vacancy: 1.2, population: 194175, gap: 8011 },
  2023: { vacancy: 1.6, population: 196589, gap: 7725 },
  2024: { vacancy: 1.8, population: 199004, gap: 7947 }
};

// Housing price timeline data from Burlington_Housing.csv
const housingPriceTimeline = [
  { year: 2010, price: 385000 },
  { year: 2011, price: 400000 },
  { year: 2012, price: 415000 },
  { year: 2013, price: 435000 },
  { year: 2014, price: 460000 },
  { year: 2015, price: 510000 },
  { year: 2016, price: 580000 },
  { year: 2017, price: 650000 },
  { year: 2018, price: 720000 },
  { year: 2019, price: 780000 },
  { year: 2020, price: 850000 },
  { year: 2021, price: 1050000 },
  { year: 2022, price: 1150000 },
  { year: 2023, price: 1100000 },
  { year: 2024, price: 1050000 }
];

// Housing gap timeline data from BurlingtonPopulation.csv
const housingGapTimeline = [
  { year: 2010, gap: 8114 },
  { year: 2011, gap: 4549 },
  { year: 2012, gap: 5785 },
  { year: 2013, gap: 5489 },
  { year: 2014, gap: 5665 },
  { year: 2015, gap: 5654 },
  { year: 2016, gap: 5960 },
  { year: 2017, gap: 5743 },
  { year: 2018, gap: 5547 },
  { year: 2019, gap: 6061 },
  { year: 2020, gap: 6109 },
  { year: 2021, gap: 5673 },
  { year: 2022, gap: 8011 },
  { year: 2023, gap: 7725 },
  { year: 2024, gap: 7947 }
];

// ===== HOME PAGE CALCULATOR =====
function initHomeCalculator() {
    const incomeSlider = document.getElementById('income-slider');
    const incomeValue = document.getElementById('income-value');
    const savingsSlider = document.getElementById('savings-slider');
    const savingsValue = document.getElementById('savings-value');
    const simulatorResults = document.getElementById('simulator-results');

    if (!incomeSlider || !savingsSlider || !simulatorResults) return;

    function updateCalculator() {
        const income = parseInt(incomeSlider.value, 10) || 0;
        const savings = parseInt(savingsSlider.value, 10) || 0;
        if (incomeValue) incomeValue.textContent = `$${income.toLocaleString()}`;
        if (savingsValue) savingsValue.textContent = `$${savings.toLocaleString()}`;

        const affordablePrice = income * 4;
        const medianPrice = 1050000; // Updated to 2024 value
        const downPaymentYears = savings > 0 ? ((medianPrice * 0.2) / savings).toFixed(1) : '—';
        const affordableMortgage = Math.round((affordablePrice * 0.05) / 12).toLocaleString();
        const actualMortgage = Math.round((medianPrice * 0.05) / 12).toLocaleString();

        simulatorResults.innerHTML = `
            <div class="flex justify-between items-center">
                <span>Affordable home price:</span>
                <span class="font-bold text-green-600">$${affordablePrice.toLocaleString()}</span>
            </div>
            <div class="flex justify-between items-center">
                <span>Actual Burlington median price:</span>
                <span class="font-bold text-red-600">$${medianPrice.toLocaleString()}</span>
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

// ===== TIMELINE SLIDER FUNCTIONALITY =====
function initTimelineSlider() {
  const slider = document.getElementById('timeline-slider');
  const yearDisplay = document.getElementById('timeline-year');
  const minYearDisplay = document.getElementById('timeline-min');
  const maxYearDisplay = document.getElementById('timeline-max');
  const vacancyDisplay = document.getElementById('kpi-vacancy');
  const populationDisplay = document.getElementById('kpi-population');
  const gapDisplay = document.getElementById('kpi-gap');
  
  if (!slider || !yearDisplay) return;
  
  // Set min and max year displays
  if (minYearDisplay) minYearDisplay.textContent = slider.min;
  if (maxYearDisplay) maxYearDisplay.textContent = slider.max;
  
  // Initialize with first year
  updateTimelineDisplay(parseInt(slider.value));
  
  // Add event listener
  slider.addEventListener('input', function() {
    const year = parseInt(this.value);
    updateTimelineDisplay(year);
  });
}

function updateTimelineDisplay(year) {
  const yearDisplay = document.getElementById('timeline-year');
  const vacancyDisplay = document.getElementById('kpi-vacancy');
  const populationDisplay = document.getElementById('kpi-population');
  const gapDisplay = document.getElementById('kpi-gap');
  
  if (yearDisplay) yearDisplay.textContent = year;
  
  const data = timelineData[year];
  if (data) {
    if (vacancyDisplay) vacancyDisplay.textContent = `${data.vacancy}%`;
    if (populationDisplay) populationDisplay.textContent = data.population.toLocaleString();
    if (gapDisplay) gapDisplay.textContent = data.gap.toLocaleString();
  }
}

// ===== TIMELINE CHARTS =====
function initTimelineCharts() {
  // Housing Price Timeline Chart
  const timelineVRCtx = document.getElementById('timeline-vr-chart');
  if (timelineVRCtx) {
    timelineVRChart = new Chart(timelineVRCtx, {
      type: 'line',
      data: {
        labels: housingPriceTimeline.map(d => d.year),
        datasets: [{
          label: 'Average Housing Price',
          data: housingPriceTimeline.map(d => d.price),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Price ($)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          }
        },
        plugins: {
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Price: ${moneyFmt(context.parsed.y)}`;
              }
            }
          }
        }
      }
    });
  }
  
  // Housing Gap Timeline Chart
  const timelinePopCtx = document.getElementById('timeline-pop-chart');
  if (timelinePopCtx) {
    timelinePopChart = new Chart(timelinePopCtx, {
      type: 'line',
      data: {
        labels: housingGapTimeline.map(d => d.year),
        datasets: [{
          label: 'Housing Gap',
          data: housingGapTimeline.map(d => d.gap),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Units Needed'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          }
        },
        plugins: {
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Gap: ${context.parsed.y.toLocaleString()} units`;
              }
            }
          }
        }
      }
    });
  }
}

// ===== POLICY SIMULATOR FUNCTIONALITY =====
function initPolicySimulator() {
    const policySlider = document.getElementById('policy-adoption-slider');
    const policyValue = document.getElementById('policy-adoption-value');
    const unitsSlider = document.getElementById('units-per-property-slider');
    const unitsValue = document.getElementById('units-per-property-value');
    const conversionSlider = document.getElementById('conversion-rate-slider');
    const conversionValue = document.getElementById('conversion-rate-value');
    
    if (!policySlider || !unitsSlider || !conversionSlider) return;
    
    // Update slider values display
    function updateSliderValues() {
        if (policyValue) policyValue.textContent = `${policySlider.value}%`;
        
        const unitsVal = parseFloat(unitsSlider.value);
        if (unitsValue) {
            if (unitsVal === 2) unitsValue.textContent = "2 (Duplex)";
            else if (unitsVal === 2.5) unitsValue.textContent = "2.5";
            else if (unitsVal === 3) unitsValue.textContent = "3 (Triplex)";
            else if (unitsVal === 3.5) unitsValue.textContent = "3.5";
            else if (unitsVal === 4) unitsValue.textContent = "4 (Fourplex)";
        }
        
        if (conversionValue) conversionValue.textContent = `${conversionSlider.value}%`;
        
        updateSimulationResults();
    }
    
    // Calculate and update simulation results
    function updateSimulationResults() {
        const policyAdoption = parseInt(policySlider.value) / 100;
        const unitsPerProperty = parseFloat(unitsSlider.value);
        const conversionRate = parseInt(conversionSlider.value) / 100;
        
        // Base assumptions
        const totalSingleFamilyLots = 52000; // Estimated single-family lots in Burlington
        const peoplePerUnit = 2.5; // Average people per housing unit
        
        // Calculations
        const eligibleLots = totalSingleFamilyLots * policyAdoption;
        const convertedProperties = eligibleLots * conversionRate;
        const newUnits = convertedProperties * (unitsPerProperty - 1); // Subtract 1 for the existing unit
        const peopleHoused = newUnits * peoplePerUnit;
        
        // Housing gap reduction (current gap is 7947 units)
        const gapReduction = Math.min(100, Math.round((newUnits / 7947) * 100));
        
        // Price reduction estimate (based on research showing 1% price decrease per 1% supply increase)
        const supplyIncrease = (newUnits / 199004) * 100; // Burlington population ~199,004
        const priceReductionMin = Math.round(supplyIncrease * 0.8); // Conservative estimate
        const priceReductionMax = Math.round(supplyIncrease * 1.2); // Optimistic estimate
        
        // Update DOM
        const newUnitsEl = document.getElementById('new-units');
        const peopleHousedEl = document.getElementById('people-housed');
        const gapReductionEl = document.getElementById('gap-reduction');
        const priceReductionEl = document.getElementById('price-reduction');
        
        const newUnitsBar = document.getElementById('new-units-bar');
        const peopleHousedBar = document.getElementById('people-housed-bar');
        const gapReductionBar = document.getElementById('gap-reduction-bar');
        const priceReductionBar = document.getElementById('price-reduction-bar');
        
        const newUnitsTooltip = document.getElementById('new-units-tooltip');
        const peopleHousedTooltip = document.getElementById('people-housed-tooltip');
        const gapReductionTooltip = document.getElementById('gap-reduction-tooltip');
        const priceReductionTooltip = document.getElementById('price-reduction-tooltip');
        
        if (newUnitsEl) newUnitsEl.textContent = Math.round(newUnits).toLocaleString();
        if (peopleHousedEl) peopleHousedEl.textContent = Math.round(peopleHoused).toLocaleString();
        if (gapReductionEl) gapReductionEl.textContent = `${gapReduction}%`;
        if (priceReductionEl) priceReductionEl.textContent = `${priceReductionMin}-${priceReductionMax}%`;
        
        // Update progress bars
        if (newUnitsBar) {
            const percentage = Math.min(100, (newUnits / 30000) * 100); // Cap at 30,000 units
            newUnitsBar.style.width = `${percentage}%`;
            if (newUnitsTooltip) {
                newUnitsTooltip.textContent = `${Math.round(percentage)}%`;
                newUnitsTooltip.style.display = 'block';
            }
        }
        
        if (peopleHousedBar) {
            const percentage = Math.min(100, (peopleHoused / 75000) * 100); // Cap at 75,000 people
            peopleHousedBar.style.width = `${percentage}%`;
            if (peopleHousedTooltip) {
                peopleHousedTooltip.textContent = `${Math.round(percentage)}%`;
                peopleHousedTooltip.style.display = 'block';
            }
        }
        
        if (gapReductionBar) {
            gapReductionBar.style.width = `${gapReduction}%`;
            if (gapReductionTooltip) {
                gapReductionTooltip.textContent = `${gapReduction}%`;
                gapReductionTooltip.style.display = 'block';
            }
        }
        
        if (priceReductionBar) {
            const percentage = Math.min(100, ((priceReductionMin + priceReductionMax) / 2) * 2); // Scale for visualization
            priceReductionBar.style.width = `${percentage}%`;
            if (priceReductionTooltip) {
                priceReductionTooltip.textContent = `${Math.round(percentage)}%`;
                priceReductionTooltip.style.display = 'block';
            }
        }
    }
    
    // Add event listeners
    policySlider.addEventListener('input', updateSliderValues);
    unitsSlider.addEventListener('input', updateSliderValues);
    conversionSlider.addEventListener('input', updateSliderValues);
    
    // Initialize values
    updateSliderValues();
}

// ===== CHART INITIALIZATION FUNCTIONS =====

function initPreviewCharts() {
    // Preview Price-to-Income Ratio Chart (for home page)
    const previewPriceIncomeCtx = document.getElementById('preview-price-income-chart');
    if (previewPriceIncomeCtx) {
        previewPriceIncomeChart = new Chart(previewPriceIncomeCtx, {
            type: 'line',
            data: {
                labels: priceToIncomeData.map(d => d.year),
                datasets: [
                    {
                        label: 'Price-to-Income Ratio',
                        data: priceToIncomeData.map(d => d.ratio),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.1,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Price-to-Income Ratio'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Burlington Price-to-Income Ratio (2010-2023)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ratio: ${context.parsed.y.toFixed(1)}x`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Preview Comparison Chart (for home page) - Updated to show Completions per 1000 People
    const previewComparisonCtx = document.getElementById('preview-comparison-chart');
    if (previewComparisonCtx) {
        const data = completionsPer1000Data;
        
        previewComparisonChart = new Chart(previewComparisonCtx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.city),
                datasets: [{
                    label: 'Completions per 1000 People',
                    data: data.map(d => d.value),
                    backgroundColor: data.map(d => d.city === 'Burlington' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(99, 102, 241, 0.5)'),
                    borderColor: data.map(d => d.city === 'Burlington' ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Completions per 1000 People'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Burlington vs. Other Cities: Housing Completions per 1000 People'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Completions: ${context.parsed.x}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function initProblemCharts() {
    // Price-to-Income Ratio Chart (for problem page)
    const priceIncomeCtx = document.getElementById('price-income-chart');
    if (priceIncomeCtx) {
        priceIncomeChart = new Chart(priceIncomeCtx, {
            type: 'line',
            data: {
                labels: priceToIncomeData.map(d => d.year),
                datasets: [
                    {
                        label: 'Price-to-Income Ratio',
                        data: priceToIncomeData.map(d => d.ratio),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.1,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Price-to-Income Ratio'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Burlington Price-to-Income Ratio (2010-2023)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ratio: ${context.parsed.y.toFixed(1)}x`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Rent Chart with increased height
    const rentCtx = document.getElementById('rent-chart');
    if (rentCtx) {
        rentChart = new Chart(rentCtx, {
            type: 'line',
            data: {
                labels: rentData.map(d => d.year),
                datasets: [{
                    label: 'Average Rent (2-Bedroom)',
                    data: rentData.map(d => d.rent),
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Monthly Rent ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Rent for 2-Bedroom Apartments in Burlington (2010-2024)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Rent: ${moneyFmt(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Vacancy Rate Chart
    const vacancyCtx = document.getElementById('vacancy-chart');
    if (vacancyCtx) {
        vacancyChart = new Chart(vacancyCtx, {
            type: 'line',
            data: {
                labels: vacancyData.map(d => d.year),
                datasets: [{
                    label: 'Vacancy Rate (%)',
                    data: vacancyData.map(d => d.rate),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Vacancy Rate (%)'
                        },
                        min: 0,
                        max: 3
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Rental Vacancy Rate in Burlington (2010-2024)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Vacancy: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // City Comparison Chart
    const comparisonCtx = document.getElementById('comparison-chart');
    if (comparisonCtx) {
        // Get the comparison type dropdown
        const comparisonType = document.getElementById('metric-select');
        
        // Function to update the chart based on selected metric
        function updateComparisonChart() {
            const selectedMetric = comparisonType ? comparisonType.value : 'Price_to_Income_Ratio';
            const data = comparisonDataMaster[selectedMetric] || [];
            
            // Determine chart title and label based on selected metric
            let title, label, tooltipLabel;
            switch(selectedMetric) {
                case 'Price_to_Income_Ratio':
                    title = 'Price-to-Income Ratio Comparison';
                    label = 'Price-to-Income Ratio';
                    tooltipLabel = 'Ratio';
                    break;
                case 'Avg_Rent_2Bedroom_2024':
                    title = 'Average Rent (2-Bedroom) Comparison';
                    label = 'Monthly Rent ($)';
                    tooltipLabel = 'Rent';
                    break;
                case 'Vacancy_Rate_2024_Pct':
                    title = 'Vacancy Rate Comparison';
                    label = 'Vacancy Rate (%)';
                    tooltipLabel = 'Vacancy';
                    break;
                case 'Housing_Starts_Per_1000_People':
                    title = 'Housing Starts per 1000 People';
                    label = 'Starts per 1000 People';
                    tooltipLabel = 'Starts';
                    break;
                default:
                    title = 'City Comparison';
                    label = 'Value';
                    tooltipLabel = 'Value';
            }
            
            // Update or create chart
            if (comparisonChart) {
                comparisonChart.data.labels = data.map(d => d.city);
                comparisonChart.data.datasets[0].data = data.map(d => d.value);
                comparisonChart.data.datasets[0].label = label;
                comparisonChart.options.plugins.title.text = title;
                
                // Update colors
                comparisonChart.data.datasets[0].backgroundColor = data.map(d => 
                    d.city === 'Burlington' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(99, 102, 241, 0.5)'
                );
                comparisonChart.data.datasets[0].borderColor = data.map(d => 
                    d.city === 'Burlington' ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)'
                );
                
                comparisonChart.update();
            } else {
                // Initialize chart
                comparisonChart = new Chart(comparisonCtx, {
                    type: 'bar',
                    data: {
                        labels: data.map(d => d.city),
                        datasets: [{
                            label: label,
                            data: data.map(d => d.value),
                            backgroundColor: data.map(d => 
                                d.city === 'Burlington' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(99, 102, 241, 0.5)'
                            ),
                            borderColor: data.map(d => 
                                d.city === 'Burlington' ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)'
                            ),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: label
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: title
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (selectedMetric === 'Price_to_Income_Ratio') {
                                            return `${tooltipLabel}: ${context.parsed.x.toFixed(1)}x`;
                                        } else if (selectedMetric === 'Avg_Rent_2Bedroom_2024') {
                                            return `${tooltipLabel}: ${moneyFmt(context.parsed.x)}`;
                                        } else if (selectedMetric === 'Vacancy_Rate_2024_Pct') {
                                            return `${tooltipLabel}: ${context.parsed.x}%`;
                                        } else {
                                            return `${tooltipLabel}: ${context.parsed.x}`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        
        // Initialize with default metric
        updateComparisonChart();
        
        // Add event listener to dropdown if it exists
        if (comparisonType) {
            comparisonType.addEventListener('change', updateComparisonChart);
        }
    }
}
function initCityComparisonChart() {
    // City Comparison Chart for solution page
    const cityComparisonCtx = document.getElementById('city-comparison-chart');
    if (!cityComparisonCtx) return;

    // Data for the chart - using zoning comparison data
    const data = [
        { city: 'Burlington', mediumDensity: 3.24, lowDensity: 7.85, highDensity: 2.43 },
        { city: 'Oakville', mediumDensity: 3.73, lowDensity: 15.2, highDensity: 1.85 },
        { city: 'Milton', mediumDensity: 13.34, lowDensity: 1.65, highDensity: 1.69 },
        { city: 'Hamilton', mediumDensity: 1.31, lowDensity: 1.24, highDensity: 0.13 },
        { city: 'Mississauga', mediumDensity: 5.03, lowDensity: 0.29, highDensity: 3.65 },
        { city: 'Toronto', mediumDensity: 9.82, lowDensity: 38.2, highDensity: 3.89 },
        { city: 'London', mediumDensity: 4.99, lowDensity: 1.48, highDensity: 4.08 }
    ];

    // Sort cities by medium density (descending)
    data.sort((a, b) => b.mediumDensity - a.mediumDensity);

    cityComparisonChart = new Chart(cityComparisonCtx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.city),
            datasets: [
                {
                    label: 'Low Density Residential',
                    data: data.map(d => d.lowDensity),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                },
                {
                    label: 'Medium Density Residential',
                    data: data.map(d => d.mediumDensity),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                },
                {
                    label: 'High Density / Mixed Use',
                    data: data.map(d => d.highDensity),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'City'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Percentage of Total Land'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Residential Zoning Distribution by City (% of total land)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}
function initSolutionCharts() {
    // Zoning Comparison Chart (for solution page)
    const zoningComparisonCtx = document.getElementById('zoning-comparison-chart');
    if (zoningComparisonCtx) {
        const zoningType = document.getElementById('zoning-type');
        if (!zoningType) return;
        
        // Function to update chart based on selected zoning type
        function updateZoningChart() {
            const selectedZoning = zoningType.value;
            const data = zoningComparisonData[selectedZoning] || [];
            
            let title, yLabel;
            
            switch(selectedZoning) {
                case 'Low Density Residential':
                    title = 'Low Density Residential Zoning (% of total land)';
                    yLabel = 'Percentage of Total Land';
                    break;
                case 'Medium Density Residential':
                    title = 'Medium Density Residential Zoning (% of total land)';
                    yLabel = 'Percentage of Total Land';
                    break;
                case 'High Density / Mixed Use':
                    title = 'High Density / Mixed Use Zoning (% of total land)';
                    yLabel = 'Percentage of Total Land';
                    break;
                default:
                    title = 'Zoning Comparison';
                    yLabel = 'Percentage';
            }
            
            if (comparisonChart) {
                comparisonChart.data.labels = data.map(d => d.city);
                comparisonChart.data.datasets[0].data = data.map(d => d.value);
                comparisonChart.options.scales.y.title.text = yLabel;
                comparisonChart.options.plugins.title.text = title;
                comparisonChart.update();
            } else {
                comparisonChart = new Chart(zoningComparisonCtx, {
                    type: 'bar',
                    data: {
                        labels: data.map(d => d.city),
                        datasets: [{
                            label: yLabel,
                            data: data.map(d => d.value),
                            backgroundColor: data.map(d => d.city === 'Burlington' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(99, 102, 241, 0.5)'),
                            borderColor: data.map(d => d.city === 'Burlington' ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)'),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: yLabel
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: title
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.parsed.y}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        
        // Initialize chart with first zoning type
        updateZoningChart();
        
        // Add event listener to update chart when selection changes
        zoningType.addEventListener('change', updateZoningChart);
    }

    // Burlington Housing Density Pie Chart (for solution page)
    const burlingtonPieCtx = document.getElementById('burlington-pie-chart');
    if (burlingtonPieCtx) {
        burlingtonPieChart = new Chart(burlingtonPieCtx, {
            type: 'pie',
            data: {
                labels: housingDensityData.map(d => d.type),
                datasets: [{
                    data: housingDensityData.map(d => d.value),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(34, 197, 94, 0.7)'
                    ],
                    borderColor: [
                        'rgb(239, 68, 68)',
                        'rgb(249, 115, 22)',
                        'rgb(59, 130, 246)',
                        'rgb(34, 197, 94)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Burlington Residential Zoning Distribution (% of total land)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// ===== CHART RESIZE HANDLER =====
function handleChartResize() {
    const charts = [
        priceIncomeChart, comparisonChart, rentChart, vacancyChart, 
        timelineVRChart, timelinePopChart, burlingtonPieChart, 
        cityComparisonChart, previewPriceIncomeChart, previewComparisonChart
    ];
    
    charts.forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

/// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hamburger menu
    initHamburgerMenu();
    
    // Get the current page ID
    const bodyId = document.body.id;
    
    // Initialize page-specific elements
    if (bodyId === 'home-page') {
        initHomeCalculator();
        initPreviewCharts();
    }
    else if (bodyId === 'problem-page') {
        initProblemCharts();
        initTimelineSlider();
        initTimelineCharts();
    }
    else if (bodyId === 'solution-page') {
        initSolutionCharts();
        initPolicySimulator();
        initCityComparisonChart(); // Add this line
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});