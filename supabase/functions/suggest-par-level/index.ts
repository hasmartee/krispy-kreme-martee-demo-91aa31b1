import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category, dayOfWeek, month, historicalData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const systemPrompt = `You are an inventory management AI assistant for a retail chain. Your task is to suggest optimal par levels (minimum stock levels) for products based on various factors.

Consider:
- Day of the week (weekends may have higher traffic)
- Time of year (seasonal variations)
- Product category (perishable items need different treatment)
- Historical sales patterns

Provide a realistic par level that ensures stock availability while minimizing waste. Return ONLY a number representing the suggested par level.`;

    const userPrompt = `Product: ${productName}
Category: ${category || "General"}
Day of Week: ${dayNames[dayOfWeek]} (${dayOfWeek})
Month: ${monthNames[month - 1]}
${historicalData ? `Historical average daily sales: ${historicalData}` : "No historical data available"}

What should the par level be for this product on this day and month?`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_par_level",
              description: "Return the suggested par level for the product",
              parameters: {
                type: "object",
                properties: {
                  par_level: {
                    type: "integer",
                    description: "The suggested minimum stock level"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of why this level was chosen"
                  }
                },
                required: ["par_level", "reasoning"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_par_level" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "No suggestion received from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const suggestion = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        suggestedParLevel: suggestion.par_level,
        reasoning: suggestion.reasoning
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in suggest-par-level:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
