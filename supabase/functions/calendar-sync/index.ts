import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface BookingPayload {
  student_name: string;
  student_email: string;
  student_phone: string;
  course_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  booking_id: string;
  test?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const payload: BookingPayload = await req.json();

    // Handle test/health check requests
    if (payload.test || !payload.preferred_date || !payload.preferred_time) {
      const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
      const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
      const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");

      return new Response(
        JSON.stringify({
          success: true,
          mode: "health-check",
          clientEmailConfigured: !!clientEmail,
          clientEmail: clientEmail ? clientEmail.substring(0, 30) + "..." : null,
          calendarIdConfigured: !!calendarId,
          calendarId: calendarId || null,
          privateKeyConfigured: !!privateKey,
          privateKeyLength: privateKey ? privateKey.length : 0,
          privateKeyHasNewlines: privateKey ? privateKey.includes("\n") : false,
          message: "Edge function is running. Send booking data to create calendar events.",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate required fields
    if (!payload.student_name || !payload.preferred_date || !payload.preferred_time || !payload.booking_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          details: {
            hasStudentName: !!payload.student_name,
            hasDate: !!payload.preferred_date,
            hasTime: !!payload.preferred_time,
            hasBookingId: !!payload.booking_id,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get Google Calendar API credentials from secrets
    const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
    let privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID") || "chiug.french@gmail.com";

    console.log("Calendar sync started");
    console.log("Client email configured:", !!clientEmail);
    console.log("Private key configured:", !!privateKey);
    console.log("Private key length:", privateKey ? privateKey.length : 0);
    console.log("Calendar ID:", calendarId);

    if (!clientEmail || !privateKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google Calendar credentials not configured",
          details: {
            clientEmailMissing: !clientEmail,
            privateKeyMissing: !privateKey,
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Handle private key - it might have literal \\n or actual newlines
    if (!privateKey.includes("\n") && privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
      console.log("Converted escaped newlines to actual newlines");
    }

    // Get OAuth2 token using service account
    let tokenData;
    try {
      const jwt = await createJWT(clientEmail, privateKey);
      console.log("JWT created successfully");

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      });

      tokenData = await tokenResponse.json();
      console.log("Token response status:", tokenResponse.status);

      if (!tokenResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to get Google access token",
            details: tokenData,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (tokenErr) {
      console.error("Token creation error:", tokenErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token creation failed",
          details: tokenErr instanceof Error ? tokenErr.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (!tokenData.access_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No access token received from Google",
          details: tokenData,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log("Access token obtained successfully");

    // Parse date and time from user input (already in HKT)
    const [year, month, day] = payload.preferred_date.split("-").map(Number);
    const [hour, minute] = payload.preferred_time.split(":").map(Number);

    // Format as ISO string in Asia/Hong_Kong timezone (no Z suffix!)
    // Google Calendar will interpret this using the timeZone field
    const pad = (n: number) => String(n).padStart(2, "0");
    const startIso = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
    
    // End time is 60 minutes later
    const endHour = hour + 1;
    const endIso = `${year}-${pad(month)}-${pad(day)}T${pad(endHour)}:${pad(minute)}:00`;

    console.log("Creating event for HKT:", startIso, "to", endIso);

    // Create calendar event
    const eventResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `French Lesson - ${payload.course_type} (${payload.student_name})`,
          description: `Student: ${payload.student_name}\nEmail: ${payload.student_email}\nPhone: ${payload.student_phone}\nCourse: ${payload.course_type}\nNotes: ${payload.notes || "None"}\nBooking ID: ${payload.booking_id}`,
          start: {
            dateTime: startIso,
            timeZone: "Asia/Hong_Kong",
          },
          end: {
            dateTime: endIso,
            timeZone: "Asia/Hong_Kong",
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 1440 }, // 24 hours before
              { method: "popup", minutes: 60 }, // 1 hour before
            ],
          },
        }),
      }
    );

    const eventData = await eventResponse.json();
    console.log("Calendar API response status:", eventResponse.status);

    if (!eventResponse.ok) {
      console.error("Calendar API error:", eventData);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create calendar event",
          details: eventData,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log("Event created successfully:", eventData.id);

    return new Response(
      JSON.stringify({
        success: true,
        eventId: eventData.id,
        eventLink: eventData.htmlLink,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

// Create JWT for Google Service Account
async function createJWT(clientEmail: string, privateKey: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedClaim = btoa(JSON.stringify(claim)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  // Import private key and sign
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.substring(
    privateKey.indexOf(pemHeader) + pemHeader.length,
    privateKey.indexOf(pemFooter)
  ).replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${encodedSignature}`;
}
