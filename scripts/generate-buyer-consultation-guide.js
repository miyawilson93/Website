const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(__dirname, "..", "buyer-consultation-guide-new-realtor.pdf");

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  info: {
    Title: "Buyer Consultation Guide for New Realtors",
    Author: "MoveWise",
    Subject: "Real estate buyer consultation framework",
  },
});

doc.pipe(fs.createWriteStream(outputPath));

function title(text) {
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111111").text(text);
  doc.moveDown(0.25);
}

function heading(text) {
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#111111").text(text);
  doc.moveDown(0.2);
}

function body(text) {
  doc.font("Helvetica").fontSize(11).fillColor("#222222").text(text, {
    lineGap: 3,
  });
  doc.moveDown(0.2);
}

function bullet(text) {
  doc.font("Helvetica").fontSize(11).fillColor("#222222").text(`• ${text}`, {
    indent: 10,
    lineGap: 3,
  });
}

function line() {
  const y = doc.y + 5;
  doc
    .strokeColor("#cccccc")
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(0.8);
}

function footer() {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(9).fillColor("#666666");
    doc.text(
      "MoveWise Buyer Consultation Guide | Educational resource only",
      doc.page.margins.left,
      doc.page.height - 34,
      { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: "center" }
    );
  }
}

// Cover

doc.rect(0, 0, doc.page.width, 120).fill("#752B1D");
doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24).text("Buyer Consultation Guide", 54, 42);
doc.font("Helvetica").fontSize(12).text("For New Realtors", 54, 78);

doc.moveDown(5.6);
doc.fillColor("#111111");
body("Use this guide to structure a confident, professional buyer consultation from first contact to signed representation. It includes scripts, checklists, and follow-up workflows.");

line();

heading("How to Use This Guide");
bullet("Review this before each buyer consultation until your process feels natural.");
bullet("Print one copy for your notes and one for your client packet.");
bullet("Customize scripts to your voice while keeping legal/contract details accurate.");
bullet("Always follow your brokerage policies and local/state laws.");

doc.addPage();

heading("Consultation Outcome Goals");
body("By the end of the appointment, your buyer should feel informed, confident, and clear on next steps. You should have enough information to guide a focused home search.");
bullet("Build trust and establish your value.");
bullet("Understand timeline, budget, motivations, and non-negotiables.");
bullet("Educate them on financing, market reality, and offer strategy.");
bullet("Set communication expectations and touring process.");
bullet("Secure signed buyer representation agreement (when appropriate).");

heading("Pre-Consultation Checklist (24 hours before)");
bullet("Confirm date/time/location or virtual link.");
bullet("Send a short agenda so client knows what to expect.");
bullet("Ask buyer to bring pre-approval letter (if available).");
bullet("Prepare local market snapshot (prices, days on market, inventory). ");
bullet("Prepare buyer intake form and note sheet.");
bullet("Prepare representation agreement and disclosure forms per brokerage.");

heading("Opening Script (2-3 minutes)");
body("\"Thank you for meeting with me today. My goal is to understand exactly what you need, walk you through how the process works, and build a plan so you can buy confidently. I’ll answer every question and keep things clear and straightforward.\"");

heading("Set the Meeting Structure");
bullet("Discovery: goals, timeline, budget, preferences.");
bullet("Education: financing, market conditions, and process.");
bullet("Strategy: search plan, tour plan, offer plan.");
bullet("Next steps: task list and communication schedule.");

doc.addPage();

heading("Buyer Discovery Questions");
body("Use open-ended questions first. Then narrow down to specifics.");

heading("1) Motivation and Timing");
bullet("What is driving your move right now?");
bullet("When ideally do you want to be in your new home?");
bullet("Is your timeline flexible or fixed?");

heading("2) Financial Readiness");
bullet("Have you spoken with a lender yet?");
bullet("What monthly payment range feels comfortable?");
bullet("Do you have funds set aside for down payment and closing costs?");

heading("3) Property Priorities");
bullet("Top 3 must-haves?");
bullet("Any deal-breakers?");
bullet("Preferred locations and commute limits?");
bullet("How important are schools, amenities, and neighborhood style?");

heading("4) Decision Dynamics");
bullet("Who is involved in the final decision?");
bullet("How quickly can you make decisions when you find the right home?");

heading("Agent Note Prompts");
bullet("Urgency level: low / medium / high");
bullet("Emotional motivators: space, schools, safety, investment, lifestyle");
bullet("Risk tolerance in competitive offer situations");

heading("Consultation Red Flags to Address Early");
bullet("No pre-approval + urgent timeline");
bullet("Wish list far outside budget");
bullet("Unrealistic expectations about pricing/negotiation");
bullet("Too many decision-makers with no single lead");

doc.addPage();

heading("Educating the Buyer: Core Talking Points");

heading("Financing");
bullet("Difference between pre-qualified and pre-approved.");
bullet("Why pre-approval strengthens offers.");
bullet("Cash-to-close: down payment + closing costs + reserves.");

heading("Market Conditions");
bullet("Current inventory and competition in target area.");
bullet("How days on market affects negotiation options.");
bullet("Importance of speed when new listings appear.");

heading("Offer Strategy");
bullet("Price, terms, and contingencies all matter.");
bullet("Inspection and appraisal considerations.");
bullet("Seller priorities: timeline, certainty, minimal friction.");

heading("Process Overview (Simple Timeline)");
body("Search -> Tour -> Offer -> Negotiation -> Contract -> Due Diligence -> Loan Processing -> Appraisal -> Final Walkthrough -> Closing");

heading("Client-Friendly Script: Setting Expectations");
body("\"I’ll guide you through every step and keep communication clear. My job is to help you avoid surprises, make strong decisions quickly, and protect your interests through closing.\"");

heading("Technology + Communication Plan");
bullet("How often listings are sent (daily/real-time alerts).");
bullet("Preferred contact method (text/call/email).");
bullet("Expected response windows for showings/offers.");

heading("Touring Standards");
bullet("Preview criteria before booking tours.");
bullet("Feedback form after each home.");
bullet("Prioritize homes that fit non-negotiables first.");

doc.addPage();

heading("Close the Consultation with Confidence");

heading("Close Script");
body("\"Based on what we discussed, I recommend we start in [areas] with a target price range of [range]. If you’re ready, I’ll set your listing alerts today, coordinate lender follow-up, and schedule your first tours.\"");

heading("Next Steps Checklist (Give to Buyer)");
bullet("Finalize/confirm pre-approval with lender.");
bullet("Review and sign representation paperwork (if applicable).");
bullet("Confirm target neighborhoods and non-negotiables.");
bullet("Set listing alert criteria.");
bullet("Book first tour block.");

heading("Agent Follow-Up (Within 24 hours)");
bullet("Send thank-you recap email/text.");
bullet("Attach key notes: goals, budget, search strategy, timeline.");
bullet("Send 3-5 starter listings.");
bullet("Coordinate lender call if needed.");

heading("Follow-Up Message Template");
body("\"Thanks again for meeting today. I’m excited to help you find the right home. Based on your goals, I’ve attached a quick recap and your next steps. I’ve also sent your first set of listings. Let’s schedule tours for [day/time options].\"");

heading("Consultation Packet Checklist");
bullet("Buyer process one-pager");
bullet("Neighborhood snapshot");
bullet("Sample closing cost estimate");
bullet("Offer strategy one-pager");
bullet("Your communication standards");

heading("Compliance Reminder");
body("This guide is an educational framework. Always follow your brokerage policies, state licensing rules, contract requirements, and fair housing laws.");

line();
body("Prepared for MoveWise | Buyer Consultation Guide for New Realtors");

footer();
doc.end();

console.log(`Created: ${outputPath}`);
