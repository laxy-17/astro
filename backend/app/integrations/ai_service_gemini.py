import os
import logging
from google import genai
from ..models import ChartResponse, BirthDetails

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables. AI features will be disabled.")
            self.client = None
        else:
            self.client = genai.Client(api_key=self.api_key)

    def get_mentor_response(self, query: str, chart_data: ChartResponse, details: BirthDetails) -> str:
        """
        Get a single response from the AI Mentor (Chat Mode).
        """
        if not self.client:
            return "AI Service is not configured. Please check server logs."

        try:
            context = self._build_context(chart_data, details)
            prompt = f"""
            You are a wise and compassionate Vedic Astrologer mentor. 
            
            User's Birth Details: {details.date} {details.time}, {details.latitude}, {details.longitude}
            
            Astrological Context:
            {context}
            
            User's Question: "{query}"
            
            Provide a concise, insightful answer (max 150 words). 
            Focus on empowerment, karmic lessons, and practical advice.
            Do NOT provide medical, legal, or financial advice.
            """
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"AI Generation failed: {e}")
            return "I apologize, but I am having trouble connecting to the cosmic consciousness right now."

    def generate_core_insights(self, chart_data: ChartResponse, details: BirthDetails) -> dict:
        """
        Generate the 4 Core Insights for MVP: Personal, Career, Relationships, Do's & Don'ts.
        Returns a dictionary with keys: 'personal', 'career', 'relationships', 'dos_donts'.
        """
        if not self.client:
            return {
                "personal": "AI Service unavailable.",
                "career": "AI Service unavailable.",
                "relationships": "AI Service unavailable.",
                "dos_donts": "AI Service unavailable."
            }

        # Caching Logic
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        # Create a unique key based on birth details
        import hashlib
        import json
        
        # Normalize data for consistent hashing
        data_string = f"{details.date}_{details.time}_{details.latitude}_{details.longitude}"
        data_hash = hashlib.md5(data_string.encode()).hexdigest()
        cache_file = os.path.join(cache_dir, f"{data_hash}.json")
        
        # Check cache first
        if os.path.exists(cache_file):
            logger.info(f"Returning cached insights for {data_hash}")
            try:
                with open(cache_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read cache: {e}")

        context = self._build_context(chart_data, details)
        
        # Batch prompt or individual prompts? Batch is faster/cheaper usually.
        # Let's try a structured prompt asking for JSON but Gemini Flash handles multiple parts well.
        
        prompt = f"""
        You are an expert Vedic Astrologer. Analyze this birth chart and provide 4 distinct insights.
        
        BIRTH DATA:
        Date: {details.date}, Time: {details.time}
        Location: {details.latitude}, {details.longitude}
        
        CHART DATA:
        {context}
        
        REQUIREMENTS:
        1. PERSONAL PROFILE: Core personality, strengths, and nature (100-150 words).
        2. CAREER GUIDANCE: Suitable paths, work style, and success factors (100-150 words).
        3. RELATIONSHIP INSIGHTS: Love style, compatibility factors, and approach to partnership (100-150 words).
        4. DOS & DON'TS: A bulleted list of 5 practical Do's and 5 Don'ts based on this chart.
        
        TONE: Empowering, practical, avoiding fatalism.
        SAFETY: NO medical diagnoses or legal advice.
        
        OUTPUT FORMAT:
        Provide the response with clear headers: "## Personal", "## Career", "## Relationships", "## Dos and Donts".
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp", 
                contents=prompt
            )
            text = response.text
            
            # Simple parsing (robust enough for MVP)
            # In a real prod env, we'd use Structured Output or JSON mode if available, 
            # but text parsing is fine for now.
            
            insights = {
                "personal": self._extract_section(text, "Personal"),
                "career": self._extract_section(text, "Career"),
                "relationships": self._extract_section(text, "Relationships"),
                "dos_donts": self._extract_section(text, "Dos and Donts")
            }
            
            # Save to cache
            try:
                with open(cache_file, 'w') as f:
                    json.dump(insights, f, indent=2)
                logger.info(f"Saved insights to cache: {cache_file}")
            except Exception as e:
                logger.warning(f"Failed to write cache: {e}")
                
            return insights
            
        except Exception as e:
            logger.error(f"Batch Insight Generation failed: {e}")
            return {k: "Insight generation failed." for k in ["personal", "career", "relationships", "dos_donts"]}

    def _extract_section(self, text: str, header: str) -> str:
        """Helper to extract text between headers."""
        try:
            # Flexible matching for headers like "## Personal" or "1. Personal"
            import re
            pattern = re.compile(f"##\\s*{header}|{header.upper()}:", re.IGNORECASE)
            parts = pattern.split(text)
            
            if len(parts) > 1:
                # The content is in the part AFTER the header
                # We need to stop at the NEXT header
                content = parts[1]
                # Split by next headers to truncate
                next_headers = ["##", "PERSONAL:", "CAREER:", "RELATIONSHIPS:", "DOS AND DONTS:"]
                for nh in next_headers:
                    if nh.lower() in content.lower():
                        # This is tricky without strict regex logic.
                        # Simplified: Just split by double newline as a heuristic or look for "##"
                        pass
                
                # Better approach: Split by "##" and find the one that matches our header
                sections = text.split("##")
                for s in sections:
                    if header.lower() in s.lower().split('\n')[0]: # Check first line of section
                        return "\n".join(s.split('\n')[1:]).strip()
                
                return parts[1].strip() # Fallback
            return "Content not found."
        except Exception:
            return "Parsing error."

    def _build_context(self, chart: ChartResponse, details: BirthDetails) -> str:
        """
        Helper to format chart data into a readable string for the LLM.
        """
        # Formulate a summary of the chart
        summary = []
        
        summary.append(f"Ascendant: {chart.ascendant_sign} at {chart.ascendant:.2f} degrees")
        
        summary.append("\nPlanetary Positions (D1):")
        for p in chart.planets:
            summary.append(f"- {p.name}: {p.sign} in House {p.house} ({p.longitude:.2f} deg){' (Retrograde)' if p.retrograde else ''}")
            
        if chart.strengths:
            summary.append("\nPlanetary Strengths (Vimsopaka - out of 20):")
            for planet, score in chart.strengths.items():
                summary.append(f"- {planet}: {score}")
                
        if chart.dashas:
            current_dasha = chart.dashas[0] # Simplification: just taking the first one for context
            # Handle if dasha is dict or object
            lord = current_dasha.get('lord') if isinstance(current_dasha, dict) else getattr(current_dasha, 'lord', 'Unknown')
            summary.append(f"\nCurrent Dasha Cycle: {lord}")
            
        return "\n".join(summary)

    def generate_daily_horoscope(self, sign_name: str, date: str) -> str:
        """
        Generate a daily horoscope in a specific structured format using Gemini.
        """
        if not self.client:
             return "AI Coordinator connection failed. Unable to retrieve cosmic data."

        prompt = f"""
        You are a Vedic Astrology expert. Generate a Daily Horoscope for **{sign_name}** for the date **{date}**.
        
        Strictly follow this output format with these exact Emojis and Headers:

        🌟 **Daily Overview**
        [2-3 sentences on the general vibe of the day]

        💰 **Wealth & Career**
        [Specific advice on money, business, or work]

        🤝 **Relationships**
        [Insight on love, family, or social interactions]

        ⚠️ **Health Alert**
        [A brief note on health or energy levels, and a precaution]

        🎨 **Quick Reference**
        - **Lucky Color**: [Color Name & Hex Code]
        - **Lucky Number**: [1-2 numbers]
        - **Power Word**: [One word theme]

        Tone: Uplifting, predictive yet grounded, and mysterious.
        Keep it concise but impactful.
        """

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            return response.text.replace("*", "") # Formatting cleanup
        except Exception as e:
            logger.error(f"Daily Horoscope Generation failed: {e}")
            return "Unable to consult the stars at this moment."

