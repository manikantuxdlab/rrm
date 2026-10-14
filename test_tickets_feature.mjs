// Standalone test script to verify all Support Ticket backend endpoints and features
// Run via: node test_tickets_feature.mjs

const SUPABASE_URL = "https://jnjswgavjahizagdtbii.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuanN3Z2F2amFoaXphZ2R0YmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTUyNDc3OSwiZXhwIjoyMTA3MTAwNzc5fQ.kpgc-spJMgkVStQnGPusabqLbWhETOORdIJ_jMgjtVA";

const headers = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

async function runFeatureTests() {
  console.log("==================================================");
  console.log("🚀 STARTING SUPPORT TICKET MODULE FEATURE TESTS");
  console.log("==================================================\n");

  let testTicketId = null;

  try {
    // 1. Fetch tickets (GET)
    console.log("▶ [Test 1]: Fetching existing Support Tickets...");
    const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/support_tickets?select=*&order=created_at.desc`, { headers });
    if (!fetchRes.ok) throw new Error(`Fetch tickets failed: ${fetchRes.status} ${await fetchRes.text()}`);
    const tickets = await fetchRes.json();
    console.log(`✅ [Pass] Retrieved ${tickets.length} tickets from Supabase successfully.`);
    if (tickets.length > 0) {
      console.log(`   Sample Ticket: [${tickets[0].ticket_number}] "${tickets[0].subject}" | Status: ${tickets[0].status} | Priority: ${tickets[0].priority} | Assigned: ${tickets[0].assigned_to}`);
    }

    // 2. Insert new ticket (POST)
    console.log("\n▶ [Test 2]: Creating a Test Ticket...");
    const newTicketPayload = {
      ticket_number: `TKT-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: "Automated Integration Test Ticket",
      description: "Testing automated ticket lifecycle end-to-end.",
      category: "osha_compliance",
      priority: "high",
      status: "open",
      stage: "escalated_to_admin",
      assigned_to: "Super Admin",
      user_name: "Test Engineer",
      user_email: "test.engineer@example.com",
      user_role: "boss",
      company_name: "Apex Safety Testing Corp"
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/support_tickets`, {
      method: "POST",
      headers,
      body: JSON.stringify(newTicketPayload)
    });
    if (!insertRes.ok) throw new Error(`Insert ticket failed: ${insertRes.status} ${await insertRes.text()}`);
    const [createdTicket] = await insertRes.json();
    testTicketId = createdTicket.id;
    console.log(`✅ [Pass] Created ticket ID: ${testTicketId} (${createdTicket.ticket_number})`);

    // 3. Add message to thread (POST to support_ticket_messages)
    console.log("\n▶ [Test 3]: Sending message reply to ticket conversation thread...");
    const messagePayload = {
      ticket_id: testTicketId,
      sender_role: "super_admin",
      sender_name: "Super Admin Support",
      message: "We have reviewed your request. Safety compliance documents are being verified."
    };

    const msgRes = await fetch(`${SUPABASE_URL}/rest/v1/support_ticket_messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(messagePayload)
    });
    if (!msgRes.ok) throw new Error(`Insert message failed: ${msgRes.status} ${await msgRes.text()}`);
    const [createdMsg] = await msgRes.json();
    console.log(`✅ [Pass] Added conversation message ID: ${createdMsg.id}`);

    // 4. Fetch message thread (GET)
    console.log("\n▶ [Test 4]: Fetching conversation messages for the ticket...");
    const getMsgsRes = await fetch(`${SUPABASE_URL}/rest/v1/support_ticket_messages?ticket_id=eq.${testTicketId}&select=*`, { headers });
    if (!getMsgsRes.ok) throw new Error(`Fetch messages failed: ${getMsgsRes.status} ${await getMsgsRes.text()}`);
    const messages = await getMsgsRes.json();
    console.log(`✅ [Pass] Retrieved ${messages.length} message(s) for ticket.`);
    console.log(`   Message Text: "${messages[0].message}" by ${messages[0].sender_name}`);

    // 5. Update Status and Resolution Notes (PATCH)
    console.log("\n▶ [Test 5]: Updating ticket status to 'resolved' with resolution notes...");
    const updatePayload = {
      status: "resolved",
      resolution_notes: "OSHA certifications verified. Ticket resolved automatically via test suite.",
      resolved_by: "Super Admin Support",
      resolved_at: new Date().toISOString()
    };

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/support_tickets?id=eq.${testTicketId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatePayload)
    });
    if (!updateRes.ok) throw new Error(`Update status failed: ${updateRes.status} ${await updateRes.text()}`);
    const [updatedTicket] = await updateRes.json();
    console.log(`✅ [Pass] Status updated to: "${updatedTicket.status}" | Resolved by: "${updatedTicket.resolved_by}"`);
    console.log(`   Resolution notes: "${updatedTicket.resolution_notes}"`);

    // 6. Delete test ticket cleanup (DELETE)
    console.log("\n▶ [Test 6]: Cleaning up test ticket and related records...");
    // First delete messages
    await fetch(`${SUPABASE_URL}/rest/v1/support_ticket_messages?ticket_id=eq.${testTicketId}`, {
      method: "DELETE",
      headers
    });
    // Then delete ticket
    const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/support_tickets?id=eq.${testTicketId}`, {
      method: "DELETE",
      headers
    });
    if (!deleteRes.ok) throw new Error(`Delete ticket failed: ${deleteRes.status} ${await deleteRes.text()}`);
    console.log(`✅ [Pass] Cleaned up test ticket successfully.`);

    console.log("\n==================================================");
    console.log("🎉 ALL 6/6 FEATURES & SUPABASE OPERATIONS: PASSED!");
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}

runFeatureTests();
