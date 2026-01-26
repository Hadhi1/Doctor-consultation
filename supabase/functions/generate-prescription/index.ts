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
    const { transcript, language, patientDetails, vitals, isChild, isFemale } = await req.json();

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

    const vitalsInfo = vitals ? `
Patient Vitals:
- Blood Pressure: ${vitals.bloodPressure || 'Not recorded'}
- Pulse: ${vitals.pulse || 'Not recorded'}
- Temperature: ${vitals.temperature || 'Not recorded'}
- SpO2: ${vitals.spo2 || 'Not recorded'}
- Weight: ${vitals.weight || 'Not recorded'}
- Height: ${vitals.height || 'Not recorded'}
- Respiratory Rate: ${vitals.respiratoryRate || 'Not recorded'}
` : '';

    const contextInfo = `
Patient Details:
- Name: ${patientDetails?.name || 'Not provided'}
- Age: ${patientDetails?.age || 'N/A'}
- Gender: ${patientDetails?.gender || 'N/A'}
- Address: ${patientDetails?.address || 'N/A'}
- Occupation: ${patientDetails?.occupation || 'N/A'}
${vitalsInfo}
Patient Type: ${isChild ? 'Child' : 'Adult'}${isFemale ? ', Female' : ''}
`;

    const systemPrompt = `You are a medical AI assistant that analyzes patient-doctor consultation transcripts and generates comprehensive prescription reports. You understand multiple Indian languages including English, Hindi, Telugu, Tamil, Kannada, and Marathi.

Your task is to analyze the consultation transcript and extract ALL relevant medical information to create a complete prescription report.

IMPORTANT: 
- Always respond in English regardless of the input language
- Parse the medical information accurately even if the consultation was in a regional language
- Consider the patient's age, gender, and occupation when making recommendations
- For children, include birth history if discussed
- For women of reproductive age, include pregnancy history if discussed or relevant

Return your response as a valid JSON object with this exact structure:
{
  "patientInfo": {
    "symptoms": ["symptom1", "symptom2"],
    "medicalHistory": "brief medical history or 'Not discussed' if not mentioned",
    "currentCondition": "detailed description of current condition and chief complaints"
  },
  "pastHistory": "Past medical/surgical history including previous illnesses, surgeries, hospitalizations. Use 'Not discussed' if not mentioned",
  "drugHistory": "Current and past medications, drug allergies, adverse drug reactions. Use 'Not discussed' if not mentioned",
  "vaccinationHistory": "Vaccination status, recent vaccines, pending vaccinations. Use 'Not discussed' if not mentioned",
  "childrenBirthHistory": "For children: birth weight, type of delivery, neonatal complications, developmental milestones. Use 'Not applicable' for adults or 'Not discussed' if not mentioned",
  "pregnancyHistory": "For women: gravida, para, abortions, living children, menstrual history, LMP. Use 'Not applicable' for males/children or 'Not discussed' if not mentioned",
  "familyHistory": "Family history of diseases like diabetes, hypertension, heart disease, cancer. Use 'Not discussed' if not mentioned",
  "investigations": ["investigation1", "investigation2"],
  "diagnosis": "primary diagnosis with differential diagnoses if applicable",
  "medications": [
    {
      "name": "medication name (generic name preferred)",
      "dosage": "e.g., 500mg",
      "frequency": "e.g., twice daily (BD), thrice daily (TDS)",
      "duration": "e.g., 7 days",
      "instructions": "e.g., take after meals, avoid dairy"
    }
  ],
  "advice": ["advice point 1", "advice point 2", "lifestyle modifications"],
  "dietChart": ["dietary recommendation 1", "foods to avoid", "foods to include"],
  "followUp": "specific follow-up recommendation with timeline"
}

Guidelines:
1. Be thorough and extract every piece of medical information from the transcript
2. Provide specific, actionable dietary recommendations based on the condition
3. Include lifestyle modifications in advice
4. For investigations, suggest appropriate tests based on symptoms and differential diagnosis
5. Use standard medical abbreviations where appropriate (BD, TDS, OD, SOS, etc.)
6. If any information is not clearly mentioned, indicate "Not discussed" or "Not specified"
7. Make the diet chart specific to the patient's condition (e.g., low salt for hypertension, diabetic diet, etc.)`;

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
          { role: 'user', content: `${contextInfo}\n\nConsultation Language: ${language}\n\nConsultation Transcript:\n${transcript}` }
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
        pastHistory: 'Not discussed',
        drugHistory: 'Not discussed',
        vaccinationHistory: 'Not discussed',
        childrenBirthHistory: isChild ? 'Not discussed' : 'Not applicable',
        pregnancyHistory: isFemale && !isChild ? 'Not discussed' : 'Not applicable',
        familyHistory: 'Not discussed',
        investigations: [],
        diagnosis: 'Consultation analysis incomplete',
        medications: [],
        advice: ['Please consult with a healthcare professional for accurate diagnosis'],
        dietChart: ['Follow balanced diet as per condition'],
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
