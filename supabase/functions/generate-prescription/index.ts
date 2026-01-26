import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, language } = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a medical AI assistant that analyzes patient-doctor consultation transcripts and generates detailed prescription reports. You understand multiple Indian languages including English, Hindi, Telugu, Tamil, Kannada, and Marathi.

Your task is to analyze the consultation transcript and extract:
1. Patient symptoms mentioned
2. Any medical history discussed
3. Current condition assessment
4. Diagnosis (if mentioned or can be reasonably inferred)
5. Medications prescribed with dosage, frequency, and duration
6. Medical advice given
7. Follow-up recommendations

IMPORTANT: Always respond in English regardless of the input language. Parse the medical information accurately even if the consultation was in a regional language.

Return your response as a valid JSON object with this exact structure:
{
  "patientInfo": {
    "symptoms": ["symptom1", "symptom2"],
    "medicalHistory": "brief medical history or 'Not discussed' if not mentioned",
    "currentCondition": "description of current condition"
  },
  "diagnosis": "primary diagnosis or 'Pending further tests' if unclear",
  "medications": [
    {
      "name": "medication name",
      "dosage": "e.g., 500mg",
      "frequency": "e.g., twice daily",
      "duration": "e.g., 7 days",
      "instructions": "e.g., take after meals"
    }
  ],
  "advice": ["advice point 1", "advice point 2"],
  "followUp": "follow-up recommendation"
}

If any information is not clearly mentioned in the transcript, use your medical knowledge to provide reasonable defaults or indicate "Not specified" where appropriate.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Consultation Language: ${language}\n\nConsultation Transcript:\n${transcript}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate prescription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let prescription;
    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      prescription = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw content:', content);
      
      // Return a default structure if parsing fails
      prescription = {
        patientInfo: {
          symptoms: ['Unable to parse symptoms from transcript'],
          medicalHistory: 'Not available',
          currentCondition: 'Please review the original transcript',
        },
        diagnosis: 'Consultation analysis incomplete',
        medications: [],
        advice: ['Please consult with a healthcare professional for accurate diagnosis'],
        followUp: 'Schedule a follow-up appointment',
      };
    }

    return new Response(
      JSON.stringify({ prescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-prescription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
