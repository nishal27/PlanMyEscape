from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import os
import json
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Hugging Face model
model_name = os.getenv("HUGGINGFACE_MODEL", "microsoft/DialoGPT-medium")
tokenizer = None
model = None
llm = None

def initialize_model():
    global tokenizer, model, llm
    try:
        print(f"Loading model: {model_name}")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
        
        # Create pipeline
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_length=1024,
            temperature=0.7,
            do_sample=True,
        )
        
        llm = pipe
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Using fallback text generation")
        llm = None

# Initialize model on startup
initialize_model()

# Template for itinerary generation
ITINERARY_TEMPLATE = """You are a travel planning assistant. Create a detailed travel itinerary based on the following information:

Destination: {destination}
Start Date: {start_date}
End Date: {end_date}
Duration: {duration} days
Budget: ${budget}
Number of Travelers: {travelers}
Travel Style: {travel_style}

User Preferences: {preferences}

Create a day-by-day itinerary with:
1. Daily activities with specific times
2. Descriptions for each activity
3. Estimated costs
4. Recommended locations
5. Accommodation suggestions

Format the response as JSON with the following structure:
{{
  "activities": [
    {{
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "activity": "Activity name",
      "description": "Detailed description",
      "location": {{
        "name": "Location name",
        "coordinates": {{"lat": 0.0, "lng": 0.0}}
      }},
      "cost": 0,
      "duration": 120
    }}
  ],
  "accommodations": [
    {{
      "name": "Hotel name",
      "checkIn": "YYYY-MM-DD",
      "checkOut": "YYYY-MM-DD",
      "location": {{
        "name": "Location name",
        "coordinates": {{"lat": 0.0, "lng": 0.0}}
      }},
      "cost": 0,
      "bookingReference": ""
    }}
  ]
}}

Itinerary:"""

def generate_itinerary_text(destination, start_date, end_date, budget, travelers, preferences, travel_style):
    """Generate itinerary using template and LLM"""
    start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    duration = (end - start).days
    
    prompt = ITINERARY_TEMPLATE.format(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        duration=duration,
        budget=budget,
        travelers=travelers,
        travel_style=travel_style,
        preferences=preferences or "No specific preferences"
    )
    
    if llm:
        try:
            response = llm(prompt, max_length=1024, num_return_sequences=1)
            if isinstance(response, list) and len(response) > 0:
                generated_text = response[0].get('generated_text', '')
                return generated_text
            return response
        except Exception as e:
            print(f"Error generating with LLM: {e}")
    
    # Fallback: Generate structured itinerary
    return generate_fallback_itinerary(destination, start, end, duration, budget, travelers)

def generate_fallback_itinerary(destination, start_date, end_date, duration, budget, travelers):
    """Generate a basic itinerary structure when LLM is unavailable"""
    activities = []
    current_date = start_date
    
    # Sample activities for each day
    sample_activities = [
        {"time": "09:00", "activity": "Breakfast at local cafe", "description": "Start your day with local cuisine", "cost": 15},
        {"time": "10:30", "activity": "City walking tour", "description": "Explore the main attractions", "cost": 25},
        {"time": "14:00", "activity": "Lunch", "description": "Local restaurant", "cost": 20},
        {"time": "16:00", "activity": "Museum visit", "description": "Cultural experience", "cost": 30},
        {"time": "19:00", "activity": "Dinner", "description": "Fine dining experience", "cost": 40},
    ]
    
    for day in range(duration):
        for activity in sample_activities:
            activities.append({
                "date": (current_date + timedelta(days=day)).isoformat(),
                "time": activity["time"],
                "activity": activity["activity"],
                "description": activity["description"],
                "location": {
                    "name": destination,
                    "coordinates": {"lat": 0.0, "lng": 0.0}
                },
                "cost": activity["cost"],
                "duration": 120
            })
    
    accommodations = [{
        "name": f"Hotel in {destination}",
        "checkIn": start_date.isoformat(),
        "checkOut": end_date.isoformat(),
        "location": {
            "name": destination,
            "coordinates": {"lat": 0.0, "lng": 0.0}
        },
        "cost": (budget * 0.4) if budget > 0 else 100,
        "bookingReference": ""
    }]
    
    return {
        "activities": activities,
        "accommodations": accommodations
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_loaded": llm is not None})

@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    try:
        data = request.json
        destination = data.get('destination')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        budget = data.get('budget', 0)
        travelers = data.get('travelers', 1)
        preferences = data.get('preferences')
        user_preferences = data.get('userPreferences', {})
        travel_style = user_preferences.get('travelStyle', 'mid-range')
        
        if not destination or not start_date or not end_date:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Generate itinerary
        result = generate_itinerary_text(
            destination, start_date, end_date, budget, travelers, 
            preferences, travel_style
        )
        
        # If result is a string, try to parse it as JSON
        if isinstance(result, str):
            try:
                import json
                # Try to extract JSON from the response
                result = json.loads(result)
            except:
                # If parsing fails, use fallback
                result = generate_fallback_itinerary(
                    destination,
                    datetime.fromisoformat(start_date.replace('Z', '+00:00')),
                    datetime.fromisoformat(end_date.replace('Z', '+00:00')),
                    (datetime.fromisoformat(end_date.replace('Z', '+00:00')) - 
                     datetime.fromisoformat(start_date.replace('Z', '+00:00'))).days,
                    budget,
                    travelers
                )
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error generating itinerary: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', 'False') == 'True')

