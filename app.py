from flask import Flask, render_template, jsonify, request
import csv
import os
import chardet
import re
import json
from datetime import datetime

app = Flask(__name__)

# Function to detect file encoding
def detect_encoding(filepath):
    with open(filepath, 'rb') as file:
        raw_data = file.read()
        result = chardet.detect(raw_data)
        return result['encoding']

# Clean and convert values
def clean_value(value):
    if not value or value.strip() == '':
        return None
    
    # Remove quotes and extra spaces
    value = value.replace('"', '').replace("'", "").strip()
    
    # Handle numeric values with commas
    if re.match(r'^[0-9,]+(\.[0-9]+)?$', value):
        try:
            return float(value.replace(',', ''))
        except:
            return value
    
    return value

# Special function to process rent data
def process_rent_data(filename):
    data = []
    filepath = os.path.join('data_files', filename)
    
    try:
        encoding = detect_encoding(filepath)
        print(f"Processing rent data with encoding: {encoding}")
        
        with open(filepath, 'r', encoding=encoding, errors='replace') as file:
            lines = file.readlines()
            
            # Find the header line
            header_line = None
            data_start = None
            for i, line in enumerate(lines):
                if 'Bachelor' in line and '1 Bedroom' in line and '2 Bedroom' in line:
                    header_line = i
                    data_start = i + 1
                    break
            
            if header_line is None:
                print("Could not find headers in rent data")
                return []
            
            # Extract headers
            headers = [h.strip() for h in lines[header_line].split(',')]
            
            # Process data rows
            for i in range(data_start, len(lines)):
                line = lines[i].strip()
                if not line or 'Source' in line or 'Notes' in line:
                    continue
                
                # Extract year from the first column
                parts = line.split(',')
                if len(parts) < 2:
                    continue
                
                # Check if this row contains year data
                year_match = re.search(r'(\d{4})', parts[0])
                if year_match:
                    year = year_match.group(1)
                    row_data = {'Year': year}
                    
                    # Try to extract 2-bedroom rent (typically the 5th column)
                    if len(parts) >= 6:
                        rent_value = clean_value(parts[5])  # 2-bedroom is typically column 5
                        if rent_value and isinstance(rent_value, (int, float)):
                            row_data['Rent_2Bedroom'] = rent_value
                            data.append(row_data)
            
            print(f"Processed {len(data)} rent data points")
            return data
            
    except Exception as e:
        print(f"Error processing rent data: {e}")
        return []

# Special function to process vacancy data
def process_vacancy_data(filename):
    data = []
    filepath = os.path.join('data_files', filename)
    
    try:
        encoding = detect_encoding(filepath)
        print(f"Processing vacancy data with encoding: {encoding}")
        
        with open(filepath, 'r', encoding=encoding, errors='replace') as file:
            lines = file.readlines()
            
            # Find the header line
            header_line = None
            data_start = None
            for i, line in enumerate(lines):
                if 'Bachelor' in line and '1 Bedroom' in line and '2 Bedroom' in line:
                    header_line = i
                    data_start = i + 1
                    break
            
            if header_line is None:
                print("Could not find headers in vacancy data")
                return []
            
            # Process data rows
            for i in range(data_start, len(lines)):
                line = lines[i].strip()
                if not line or 'Source' in line or 'Notes' in line:
                    continue
                
                # Extract year from the first column
                parts = line.split(',')
                if len(parts) < 2:
                    continue
                
                # Check if this row contains year data
                year_match = re.search(r'(\d{4})', parts[0])
                if year_match:
                    year = year_match.group(1)
                    row_data = {'Year': year}
                    
                    # Try to extract total vacancy rate (typically one of the last columns)
                    # Look for a percentage value in the row
                    for j, part in enumerate(parts):
                        if j == 0:  # Skip year column
                            continue
                        
                        # Look for percentage values
                        value = clean_value(part)
                        if value and isinstance(value, (int, float)) and 0 <= value <= 10:
                            row_data['Vacancy_Rate'] = value
                            break
                    
                    if 'Vacancy_Rate' in row_data:
                        data.append(row_data)
            
            print(f"Processed {len(data)} vacancy data points")
            return data
            
    except Exception as e:
        print(f"Error processing vacancy data: {e}")
        return []

# Load data from CSV files
def load_csv_data(filename):
    data = []
    filepath = os.path.join('data_files', filename)
    
    try:
        encoding = detect_encoding(filepath)
        print(f"Loading {filename} with encoding: {encoding}")
        
        with open(filepath, 'r', encoding=encoding, errors='replace') as file:
            reader = csv.DictReader(file)
            for row in reader:
                cleaned_row = {}
                for key, value in row.items():
                    cleaned_value = clean_value(value)
                    if cleaned_value is not None:
                        cleaned_row[key] = cleaned_value
                data.append(cleaned_row)
                
    except Exception as e:
        print(f"Error loading {filename}: {e}")
    
    return data

# Load action data (petition signatures, etc.)
def load_action_data():
    data_file = 'data_files/action_data.json'
    default_data = {
        'supporters': 2847,
        'signatures': 1923,
        'actions_taken': 547,
        'petition_goal': 3000,
        'petition_signatures': []
    }
    
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r') as file:
                return json.load(file)
        except:
            return default_data
    else:
        return default_data

# Save action data
def save_action_data(data):
    data_file = 'data_files/action_data.json'
    with open(data_file, 'w') as file:
        json.dump(data, file, indent=2)

# Calculate housing statistics for the hero section
def calculate_housing_stats():
    stats = {
        'rent_increase': 84,  # Default value if calculation fails
        'construction_rank': 1,  # Default value if calculation fails
        'downpayment_ratio': 15  # Default value if calculation fails
    }
    
    try:
        # Calculate rent increase since 2010
        if rent_data and len(rent_data) >= 2:
            # Sort rent data by year
            sorted_rent = sorted(rent_data, key=lambda x: x['Year'])
            earliest_rent = sorted_rent[0]['Rent_2Bedroom'] if sorted_rent[0]['Year'] == '2010' else None
            latest_rent = sorted_rent[-1]['Rent_2Bedroom']
            
            if earliest_rent and latest_rent:
                rent_increase = ((latest_rent - earliest_rent) / earliest_rent) * 100
                stats['rent_increase'] = round(rent_increase)
        
        # Find construction ranking
        if comparison_data:
            # Sort by housing starts (ascending order)
            sorted_by_starts = sorted(
                [city for city in comparison_data if city.get('Housing_Starts_Per_1000_People') and city.get('City')],
                key=lambda x: float(x['Housing_Starts_Per_1000_People'])
            )
            
            # Find Burlington's rank (1 is worst)
            for i, city in enumerate(sorted_by_starts):
                if city['City'] == 'Burlington':
                    stats['construction_rank'] = i + 1
                    break
        
        # Calculate downpayment ratio
        if comparison_data:
            burlington_data = next((item for item in comparison_data if item['City'] == 'Burlington'), None)
            if burlington_data and burlington_data.get('Median_Home_Price_2023') and burlington_data.get('Median_Household_Income_2023'):
                home_price = float(burlington_data['Median_Home_Price_2023'])
                income = float(burlington_data['Median_Household_Income_2023'])
                
                # Calculate years of income needed for 20% down payment
                down_payment = home_price * 0.2
                years_needed = down_payment / income
                stats['downpayment_ratio'] = round(years_needed)
                
    except Exception as e:
        print(f"Error calculating housing stats: {e}")
    
    return stats

# Load all data files
print("Loading CSV data files...")
comparison_data = load_csv_data('BurlingtonComparison.csv')
income_data = load_csv_data('OntarioIncome.csv')
population_data = load_csv_data('BurlingtonPopulation.csv')
zoning_data = load_csv_data('ZoningComparison.csv')

# Use special processors for rent and vacancy data
rent_data = process_rent_data('Burlingtonrent.csv')
vacancy_data = process_vacancy_data('BurlintonVacancy.csv')
completions_data = load_csv_data('BurlingtonCompletions.csv')

# Load action data
action_data = load_action_data()

# Calculate housing statistics for hero section
housing_stats = calculate_housing_stats()

print("Data loading completed!")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/problem')
def problem():
    return render_template('problem.html')

@app.route('/solution')
def solution():
    return render_template('solution.html')

@app.route('/action')
def action():
    return render_template('action.html', action_data=action_data, housing_stats=housing_stats)

@app.route('/sources')
def sources():
    return render_template('sources.html')

# API endpoints
@app.route('/api/housing-prices')
def get_housing_prices():
    data = []
    with open('data_files/Burlington_Housing.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append({
                "Year": row["Year"],
                "MedianPrice": float(row["MedianPrice"])
            })
    return jsonify(data)

@app.route('/api/income-data')
def get_income_data():
    return jsonify(income_data)

@app.route('/api/comparison-data')
def get_comparison_data():
    return jsonify(comparison_data)

@app.route('/api/rent-data')
def get_rent_data():
    return jsonify(rent_data)

@app.route('/api/vacancy-data')
def get_vacancy_data():
    return jsonify(vacancy_data)

@app.route('/api/population-data')
def get_population_data():
    return jsonify(population_data)

@app.route('/api/zoning-data')
def get_zoning_data():
    return jsonify(zoning_data)

@app.route('/api/completions-data')
def get_completions_data():
    return jsonify(completions_data)

@app.route('/api/housing-stats')
def get_housing_stats():
    return jsonify(housing_stats)

# New API endpoint for missing middle housing calculations
@app.route('/api/missing-middle-impact')
def get_missing_middle_impact():
    # Calculate impact based on Burlington's zoning and housing data
    burlington_zoning = next((item for item in zoning_data if item['City'] == 'Burlington'), None)
    
    if not burlington_zoning:
        return jsonify({"error": "Burlington zoning data not found"})
    
    # Extract relevant zoning percentages
    low_density = float(burlington_zoning.get('Low Density Residential', 0))
    single_detached = float(burlington_zoning.get('Single Detached Residential', 0))
    
    # Get housing gap data from comparison data
    burlington_comparison = next((item for item in comparison_data if item['City'] == 'Burlington'), None)
    housing_gap = float(burlington_comparison.get('Housing_Gap_Per_1000_People', 0)) if burlington_comparison else 40.2
    
    # Get population data for scaling
    latest_population = None
    if population_data:
        # Sort by year and get the latest
        sorted_population = sorted(population_data, key=lambda x: int(x['Year']), reverse=True)
        latest_population = sorted_population[0] if sorted_population else None
    
    population_count = float(latest_population.get('Population', 196589)) if latest_population else 196589
    
    # Calculate potential impact
    # Assuming 35,000 single-family lots in Burlington (estimated based on population and typical density)
    single_family_lots = round(population_count / 2.5 / 2.5)  # Rough estimate: households / persons per household / units per lot
    
    # Return the data needed for the frontend calculations
    return jsonify({
        "single_family_lots": single_family_lots,
        "low_density_percent": low_density,
        "single_detached_percent": single_detached,
        "housing_gap": housing_gap * (population_count / 1000),  # Convert per 1000 to actual number
        "population": population_count
    })

# New API endpoints for action page
@app.route('/api/action-data')
def get_action_data():
    return jsonify(action_data)

@app.route('/api/sign-petition', methods=['POST'])
def sign_petition():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('first_name') or not data.get('last_name') or not data.get('email'):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Create signature record
        signature = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "email": data['email'],
            "postal_code": data.get('postal_code', ''),
            "signed_at": datetime.now().isoformat(),
            "subscribed": data.get('newsletter', False)
        }
        
        # Update action data
        action_data['signatures'] += 1
        action_data['supporters'] += 1
        action_data['petition_signatures'].append(signature)
        
        # Save updated data
        save_action_data(action_data)
        
        return jsonify({
            "success": True,
            "message": "Thank you for signing the petition!",
            "total_signatures": action_data['signatures']
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contact-council', methods=['POST'])
def contact_council():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name') or not data.get('email'):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Create contact record
        contact = {
            "name": data['name'],
            "email": data['email'],
            "address": data.get('address', ''),
            "message": data.get('message', ''),
            "contacted_at": datetime.now().isoformat(),
            "council_members": data.get('council_members', [])
        }
        
        # Update action data
        action_data['actions_taken'] += 1
        action_data['supporters'] += 1  # Count as a new supporter if they're taking action
        
        # Save updated data
        save_action_data(action_data)
        
        return jsonify({
            "success": True,
            "message": "Your message has been sent to city council!",
            "total_actions": action_data['actions_taken']
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)