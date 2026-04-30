import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ManagePayload {
  action:
    | "approve"
    | "cancel"
    | "mark_paid"
    | "list"
    | "get_availability"
    | "get_availability_for_date"
    | "save_availability";
  booking_id?: string;
  admin_secret?: string;
  date?: string;
  config?: unknown;
}

const defaultAvailabilityConfig = {
  enabledWeekdays: [0, 1, 2, 3, 4, 5, 6],
  availableTimeSlotsByWeekday: {},
  blockedDates: [],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const payload: ManagePayload = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ success: false, error: "Supabase configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (payload.action === "get_availability" || payload.action === "get_availability_for_date") {
      const { data, error } = await supabase
        .from("availability_settings")
        .select("config")
        .eq("id", "default")
        .maybeSingle();

      const config = (data?.config as typeof defaultAvailabilityConfig) || defaultAvailabilityConfig;

      if (payload.action === "get_availability") {
        return new Response(JSON.stringify({ success: true, availability: config }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!payload.date) {
        return new Response(JSON.stringify({ success: false, error: "Missing date for availability lookup" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: booked, error: bookedError } = await supabase
        .from("bookings")
        .select("preferred_time,status")
        .eq("preferred_date", payload.date)
        .in("status", ["pending_verification", "confirmed"]);

      if (bookedError) {
        return new Response(JSON.stringify({ success: false, error: bookedError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const bookedTimeSlots = Array.from(
        new Set(
          (booked ?? [])
            .filter((item) => item.preferred_time)
            .map((item) => item.preferred_time)
        )
      );

      return new Response(
        JSON.stringify({ success: true, availability: config, bookedTimeSlots }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (payload.action === "save_availability") {
      const expectedSecret = Deno.env.get("ADMIN_SECRET");
      if (!expectedSecret) {
        return new Response(JSON.stringify({ success: false, error: "Server configuration error: ADMIN_SECRET is not set." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (payload.admin_secret !== expectedSecret) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!payload.config || typeof payload.config !== "object") {
        return new Response(JSON.stringify({ success: false, error: "Missing availability config" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: upsertError } = await supabase
        .from("availability_settings")
        .upsert({ id: "default", config: payload.config }, { onConflict: "id" });

      if (upsertError) {
        return new Response(JSON.stringify({ success: false, error: upsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, availability: payload.config }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expectedSecret = Deno.env.get("ADMIN_SECRET");
    console.log("ADMIN_SECRET from env:", expectedSecret ? "SET" : "NOT SET");
    console.log("Received admin_secret:", payload.admin_secret ? "PROVIDED" : "NOT PROVIDED");
    if (!expectedSecret) {
      return new Response(JSON.stringify({ success: false, error: "Server configuration error: ADMIN_SECRET is not set." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (payload.admin_secret !== expectedSecret) {
      console.log("Admin secret mismatch - expected length:", expectedSecret.length, "received length:", payload.admin_secret?.length);
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payload.booking_id || !payload.action) {
      if (payload.action !== "list") {
        return new Response(JSON.stringify({ success: false, error: "Missing booking_id or action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── LIST ─────────────────────────────────────────────────────────────────
    if (payload.action === "list") {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, bookings: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payload.booking_id || !payload.action) {
      return new Response(JSON.stringify({ success: false, error: "Missing booking_id or action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", payload.booking_id)
      .maybeSingle();

    if (fetchError || !booking) {
      return new Response(JSON.stringify({ success: false, error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // ── MARK AS PAID ──────────────────────────────────────────────────────────
    if (payload.action === "mark_paid") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", payload.booking_id);

      if (updateError) {
        return new Response(JSON.stringify({ success: false, error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, action: "mark_paid", booking_id: payload.booking_id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────
    if (payload.action === "cancel") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled", payment_status: "cancelled" })
        .eq("id", payload.booking_id);

      if (updateError) {
        return new Response(JSON.stringify({ success: false, error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (resendApiKey) {
        const emailHtml = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0;">
            <div style="background: #f97316; padding: 32px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">Booking Cancelled</h1>
            </div>
            <div style="padding: 36px 40px;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">Hi <strong>${booking.student_name}</strong>,</p>
              <p style="color: #374151; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
                Unfortunately, we were unable to verify your payment for the following booking. As a result, your booking has been <strong style="color: #ef4444;">cancelled</strong>.
              </p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0; width: 40%;">Course</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0;">${booking.course_type}</td>
                  </tr>
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0;">Date</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0;">${booking.preferred_date}</td>
                  </tr>
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0;">Time</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0;">${booking.preferred_time} HKT</td>
                  </tr>
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0;">Payment Method</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0; text-transform: capitalize;">${booking.payment_method || "—"}</td>
                  </tr>
                </table>
              </div>
              <p style="color: #374151; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
                If you believe this is a mistake or would like to rebook, please don\'t hesitate to reach out or book again.
              </p>
              <div style="text-align: center; margin: 32px 0 24px;">
                <a href="https://chiugorfrench.com/booking" style="display: inline-block; background: #f97316; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Book Again</a>
              </div>
              <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.6;">
                If you have any questions, feel free to contact me via WhatsApp or Instagram.<br/>
                — Chiu Gor French
              </p>
            </div>
            <div style="background: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Chiu Gor French · Hong Kong</p>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Chiu Gor French <noreply@chiugorfrench.com>",
            to: [booking.student_email],
            subject: "Your Booking Has Been Cancelled — Chiu Gor French",
            html: emailHtml,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true, action: "cancelled", booking_id: payload.booking_id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── APPROVE ───────────────────────────────────────────────────────────────
    if (payload.action === "approve") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "confirmed", payment_status: "paid" })
        .eq("id", payload.booking_id);

      if (updateError) {
        return new Response(JSON.stringify({ success: false, error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let calendarEventId = null;
      try {
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const calendarRes = await fetch(`${supabaseUrl}/functions/v1/calendar-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            student_name: booking.student_name,
            student_email: booking.student_email,
            student_phone: booking.student_phone,
            course_type: booking.course_type,
            preferred_date: booking.preferred_date,
            preferred_time: booking.preferred_time,
            notes: booking.notes,
            booking_id: booking.id,
          }),
        });
        const calendarData = await calendarRes.json();
        if (calendarData.eventId) {
          calendarEventId = calendarData.eventId;
          await supabase
            .from("bookings")
            .update({ google_event_id: calendarEventId })
            .eq("id", payload.booking_id);
        }
      } catch {
        // Calendar sync failure doesn't block approval
      }

      if (resendApiKey) {
        const emailHtml = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0;">
            <div style="background: #0d9488; padding: 32px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">Booking Confirmed!</h1>
            </div>
            <div style="padding: 36px 40px;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">Hi <strong>${booking.student_name}</strong>,</p>
              <p style="color: #374151; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
                Great news! Your payment has been verified and your lesson is now <strong style="color: #0d9488;">confirmed</strong>. See you soon!
              </p>
              <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0; width: 40%;">Course</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0;">${booking.course_type}</td>
                  </tr>
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0;">Date</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0;">${booking.preferred_date}</td>
                  </tr>
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0;">Time</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0;">${booking.preferred_time} HKT</td>
                  </tr>
                  <tr>
                    <td style="color: #9ca3af; padding: 6px 0;">Payment Method</td>
                    <td style="color: #111827; font-weight: 600; padding: 6px 0; text-transform: capitalize;">${booking.payment_method || "—"}</td>
                  </tr>
                </table>
              </div>
              <p style="color: #374151; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
                Please be ready 5 minutes before your lesson. I\'ll send you the meeting link or address closer to the date.
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.6;">
                If you need to reschedule, please contact me at least 24 hours in advance.<br/>
                — Chiu Gor French
              </p>
            </div>
            <div style="background: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Chiu Gor French · Hong Kong</p>
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Chiu Gor French <noreply@chiugorfrench.com>",
            to: [booking.student_email],
            subject: "Your Lesson is Confirmed! — Chiu Gor French",
            html: emailHtml,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true, action: "approved", booking_id: payload.booking_id, calendar_event_id: calendarEventId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
